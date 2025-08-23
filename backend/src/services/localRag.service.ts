import { PrismaClient } from '@prisma/client';
import { Document } from '@langchain/core/documents';
import { localEmbeddingService } from '../config/rag.config';
import { VectorStoreService } from './vectorStore.service';
import { DocumentProcessorService } from './documentProcessor.service';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

export interface ProgressCallback {
  (progress: {
    status: 'processing' | 'completed' | 'failed';
    totalFiles: number;
    processedFiles: number;
    totalChunks: number;
    processedChunks: number;
    currentFile?: string;
    message: string;
  }): void;
}

export class LocalRAGService {
  private vectorStoreService: VectorStoreService;
  private documentProcessor: DocumentProcessorService;

  constructor() {
    this.vectorStoreService = new VectorStoreService();
    this.documentProcessor = new DocumentProcessorService();
    // Initialize local embeddings on startup
    localEmbeddingService.initialize().catch(console.error);
  }

  async initializeChatbotKnowledgeWithProgress(
    chatBotId: string,
    progressCallback: ProgressCallback
  ): Promise<void> {
    try {
      console.log(`Starting local knowledge initialization for chatbot: ${chatBotId}`);

      // Ensure local embeddings are loaded
      await localEmbeddingService.initialize();

      const files = await prisma.file.findMany({
        where: { 
          chatBotId: chatBotId,
          processed: false
        },
      });

      const csvPath = path.resolve(process.cwd(), 'datasets', 'dataset_rag.csv');
      const csvExists = fs.existsSync(csvPath);
      
      const totalFiles = files.length + (csvExists ? 1 : 0);
      let processedFiles = 0;
      let totalChunks = 0;
      let processedChunks = 0;

      progressCallback({
        status: 'processing',
        totalFiles,
        processedFiles,
        totalChunks,
        processedChunks,
        message: `Found ${totalFiles} files to process with local embeddings`
      });

      // Process each file
      for (const file of files) {
        if (fs.existsSync(file.fileUrl)) {
          try {
            progressCallback({
              status: 'processing',
              totalFiles,
              processedFiles,
              totalChunks,
              processedChunks,
              currentFile: file.fileName,
              message: `Processing file ${processedFiles + 1} of ${totalFiles}: ${file.fileName}`
            });

            const docs = await this.documentProcessor.processFile(file.fileUrl, file.fileName);
            
            await this.vectorStoreService.addDocumentsWithLocalEmbeddings(
              chatBotId, 
              docs, 
              file.id,
              (chunkProgress) => {
                const currentChunks = processedChunks + chunkProgress;
                progressCallback({
                  status: 'processing',
                  totalFiles,
                  processedFiles,
                  totalChunks: totalChunks + docs.length,
                  processedChunks: currentChunks,
                  currentFile: file.fileName,
                  message: `Processing ${file.fileName}: ${chunkProgress}/${docs.length} chunks (local embeddings)`
                });
              }
            );
            
            totalChunks += docs.length;
            processedChunks += docs.length;
            processedFiles++;

          } catch (fileError) {
            console.error(`Error processing file ${file.fileName}:`, fileError);
            processedFiles++;
          }
        } else {
          console.warn(`File not found: ${file.fileUrl}`);
          processedFiles++;
        }
      }

      // Process CSV dataset
      if (csvExists) {
        try {
          progressCallback({
            status: 'processing',
            totalFiles,
            processedFiles,
            totalChunks,
            processedChunks,
            currentFile: 'dataset_rag.csv',
            message: `Processing CSV dataset with local embeddings`
          });

          const csvDocs = await this.documentProcessor.processCSVDataset(csvPath);
          
          let csvFile = await prisma.file.findFirst({
            where: {
              chatBotId,
              fileName: 'dataset_rag.csv'
            }
          });

          if (!csvFile) {
            csvFile = await prisma.file.create({
              data: {
                chatBotId,
                fileName: 'dataset_rag.csv',
                fileUrl: csvPath,
                fileType: 'csv',
                processed: false
              }
            });
          }

          await this.vectorStoreService.addDocumentsWithLocalEmbeddings(
            chatBotId,
            csvDocs,
            csvFile.id,
            (chunkProgress) => {
              const currentChunks = processedChunks + chunkProgress;
              progressCallback({
                status: 'processing',
                totalFiles,
                processedFiles,
                totalChunks: totalChunks + csvDocs.length,
                processedChunks: currentChunks,
                currentFile: 'dataset_rag.csv',
                message: `Processing CSV: ${chunkProgress}/${csvDocs.length} chunks (local embeddings)`
              });
            }
          );

          totalChunks += csvDocs.length;
          processedChunks += csvDocs.length;
          processedFiles++;

        } catch (csvError) {
          console.error('Error processing CSV dataset:', csvError);
          processedFiles++;
        }
      }

      // Update chatbot knowledge status
      await prisma.chatBot.update({
        where: { id: chatBotId },
        data: {
          isKnowledgeInitialized: true,
          lastKnowledgeUpdate: new Date(),
          totalChunks: processedChunks
        }
      });

      progressCallback({
        status: 'completed',
        totalFiles,
        processedFiles,
        totalChunks,
        processedChunks,
        message: `Successfully initialized local knowledge base with ${processedChunks} chunks`
      });

    } catch (error) {
      console.error('Error initializing chatbot knowledge:', error);
      progressCallback({
        status: 'failed',
        totalFiles: 0,
        processedFiles: 0,
        totalChunks: 0,
        processedChunks: 0,
        message: `Initialization failed: ${(error as Error).message || 'Unknown error'}`
      });
      throw error;
    }
  }

  async generateResponseLocally(
    chatBotId: string,
    query: string,
    conversationHistory: Array<{ role: string; message: string }> = []
  ): Promise<string> {
    try {
      // Check if knowledge base is initialized
      const chatBot = await prisma.chatBot.findUnique({
        where: { id: chatBotId }
      });

      if (!chatBot?.isKnowledgeInitialized) {
        return 'I apologize, but my knowledge base is still being initialized. Please try again in a few moments.';
      }

      // Get relevant documents using local similarity search
      const relevantDocs = await this.vectorStoreService.localSimilaritySearch(
        chatBotId,
        query,
        3
      );

      if (relevantDocs.length === 0) {
        return "I don't have enough information in my knowledge base to answer your question. Could you please provide more context or try rephrasing your question?";
      }

      // Generate response using simple template-based approach (no API calls)
      const context = relevantDocs
        .map(doc => doc.pageContent)
        .join('\n\n')
        .substring(0, 1500);

      // Simple rule-based response generation
      const response = this.generateTemplateResponse(query, context, chatBot.name);
      
      return response;

    } catch (error) {
      console.error('Error generating local RAG response:', error);
      return 'I apologize, but I encountered an error while processing your request. Please try again later.';
    }
  }

  private generateTemplateResponse(query: string, context: string, botName: string): string {
    const queryLower = query.toLowerCase();
    
    // Extract the most relevant sentences from context
    const sentences = context.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const relevantSentences = sentences.slice(0, 3).join('. ');
    
    // Simple keyword-based response generation
    if (queryLower.includes('what') || queryLower.includes('how') || queryLower.includes('why')) {
      return `Based on my knowledge: ${relevantSentences}. Is there anything specific you'd like me to clarify?`;
    } else if (queryLower.includes('can') || queryLower.includes('able')) {
      return `According to the information I have: ${relevantSentences}. Let me know if you need more details.`;
    } else {
      return `Here's what I found: ${relevantSentences}. Feel free to ask if you need more information.`;
    }
  }

  async updateChatbotKnowledgeWithProgress(
    chatBotId: string,
    progressCallback: ProgressCallback
  ): Promise<void> {
    try {
      progressCallback({
        status: 'processing',
        totalFiles: 0,
        processedFiles: 0,
        totalChunks: 0,
        processedChunks: 0,
        message: 'Clearing existing knowledge base...'
      });

      await this.vectorStoreService.deleteChatbotChunks(chatBotId);
      
      await prisma.file.updateMany({
        where: { chatBotId },
        data: { processed: false }
      });

      await prisma.chatBot.update({
        where: { id: chatBotId },
        data: {
          isKnowledgeInitialized: false,
          totalChunks: 0
        }
      });
      
      await this.initializeChatbotKnowledgeWithProgress(chatBotId, progressCallback);
    } catch (error) {
      console.error('Error updating chatbot knowledge:', error);
      progressCallback({
        status: 'failed',
        totalFiles: 0,
        processedFiles: 0,
        totalChunks: 0,
        processedChunks: 0,
        message: `Update failed: ${(error as Error).message || 'Unknown error'}`
      });
      throw error;
    }
  }
}