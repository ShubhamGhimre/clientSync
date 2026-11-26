// src/services/vectorStore.service.ts
import { Document } from '@langchain/core/documents';
import { embeddings } from '../config/rag.config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class VectorStoreService {
  
  async addDocuments(chatBotId: string, documents: Document[], fileId: string): Promise<void> {
    try {
      for (const doc of documents) {
        try {
          // Generate embedding for the document
          const embedding = await embeddings.embedQuery(doc.pageContent);
          
          // Store chunk in database
          await prisma.fileChunk.create({
            data: {
              fileId,
              content: doc.pageContent,
              chunkIndex: doc.metadata.chunkIndex || 0,
              embedding: JSON.stringify(embedding),
              metadata: doc.metadata,
            }
          });
        } catch (embeddingError) {
          console.error(`Error generating embedding for chunk:`, embeddingError);
          // Store without embedding as fallback
          await prisma.fileChunk.create({
            data: {
              fileId,
              content: doc.pageContent,
              chunkIndex: doc.metadata.chunkIndex || 0,
              embedding: JSON.stringify([]), // Empty embedding as fallback
              metadata: doc.metadata,
            }
          });
        }
      }

      // Update file as processed
      await prisma.file.update({
        where: { id: fileId },
        data: { processed: true }
      });

    } catch (error) {
      console.error('Error adding documents to vector store:', error);
      throw error;
    }
  }

  async similaritySearch(
    chatBotId: string, 
    query: string, 
    k: number = 5
  ): Promise<Document[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await embeddings.embedQuery(query);
      
      // Get all chunks for this chatbot
      const allChunks = await prisma.fileChunk.findMany({
        include: { file: true },
        where: {
          file: {
            chatBotId: chatBotId
          }
        }
      });

      if (allChunks.length === 0) {
        console.log(`No chunks found for chatbot: ${chatBotId}`);
        return [];
      }

      // Calculate cosine similarity
      const chunksWithSimilarity = allChunks.map(chunk => {
        const chunkEmbedding = JSON.parse(chunk.embedding || '[]');
        const similarity = this.cosineSimilarity(queryEmbedding, chunkEmbedding);
        
        return {
          ...chunk,
          similarity
        };
      }).filter(chunk => chunk.similarity > 0); // Filter out chunks with no valid embeddings

      // Sort by similarity and take top k
      const topChunks = chunksWithSimilarity
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, k);

      return topChunks.map(chunk => new Document({
        pageContent: chunk.content,
        metadata: {
          ...(typeof chunk.metadata === 'object' && chunk.metadata !== null ? chunk.metadata : {}),
          fileName: chunk.file.fileName,
          similarity: chunk.similarity
        }
      }));
    } catch (error) {
      console.error('Error performing similarity search:', error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0 || b.length === 0) return 0;
    
    const dotProduct = a.reduce((sum, ai, i) => sum + ai * (b[i] || 0), 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  async deleteFileChunks(fileId: string): Promise<void> {
    try {
      await prisma.fileChunk.deleteMany({
        where: { fileId }
      });
    } catch (error) {
      console.error('Error deleting file chunks:', error);
      throw error;
    }
  }

  async deleteChatbotChunks(chatBotId: string): Promise<void> {
    try {
      const files = await prisma.file.findMany({
        where: { chatBotId },
        select: { id: true }
      });

      for (const file of files) {
        await this.deleteFileChunks(file.id);
      }
    } catch (error) {
      console.error('Error deleting chatbot chunks:', error);
      throw error;
    }
  }
}