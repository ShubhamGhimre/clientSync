// src/services/rag.service.ts
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { llm } from '../config/rag.config';
import { VectorStoreService } from './vectorStore.service';
import { DocumentProcessorService } from './documentProcessor.service';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

export class RAGService {
  private vectorStoreService: VectorStoreService;
  private documentProcessor: DocumentProcessorService;

  constructor() {
    this.vectorStoreService = new VectorStoreService();
    this.documentProcessor = new DocumentProcessorService();
  }

  async initializeChatbotKnowledge(chatBotId: string): Promise<void> {
    try {
      console.log(`Starting knowledge initialization for chatbot: ${chatBotId}`);

      // First, validate that the chatbot exists
      const chatBot = await prisma.chatBot.findUnique({
        where: { id: chatBotId }
      });

      if (!chatBot) {
        throw new Error(`Chatbot with ID ${chatBotId} not found. Please check the chatbot ID.`);
      }

      console.log(`Found chatbot: ${chatBot.name}`);

      // Get all files associated with this chatbot
      const files = await prisma.file.findMany({
        where: { 
          chatBotId: chatBotId,
          processed: false
        },
      });

      console.log(`Found ${files.length} files for chatbot ${chatBotId}`);

      let totalChunks = 0;

      // Process each file
      for (const file of files) {
        console.log(`Processing file: ${file.fileName}`);
        
        if (fs.existsSync(file.fileUrl)) {
          try {
            const docs = await this.documentProcessor.processFile(file.fileUrl, file.fileName);
            await this.vectorStoreService.addDocuments(chatBotId, docs, file.id);
            totalChunks += docs.length;
            console.log(`Processed ${docs.length} chunks from ${file.fileName}`);
          } catch (fileError) {
            console.error(`Error processing file ${file.fileName}:`, fileError);
          }
        } else {
          console.warn(`File not found: ${file.fileUrl}`);
        }
      }

      // Process the general knowledge base (your CSV dataset)
      const csvPath = path.resolve(process.cwd(), 'datasets', 'dataset_rag.csv');
      if (fs.existsSync(csvPath)) {
        console.log('Processing general knowledge base (CSV dataset)');
        
        try {
          const csvDocs = await this.documentProcessor.processCSVDataset(csvPath);
          
          // Create a virtual file entry for the CSV dataset
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

          await this.vectorStoreService.addDocuments(chatBotId, csvDocs, csvFile.id);
          totalChunks += csvDocs.length;
          console.log(`Processed ${csvDocs.length} chunks from CSV dataset`);
        } catch (csvError) {
          console.error('Error processing CSV dataset:', csvError);
        }
      } else {
        console.warn(`CSV dataset not found at: ${csvPath}`);
      }

      // Update chatbot knowledge status - with additional validation
      try {
        const updatedChatBot = await prisma.chatBot.update({
          where: { id: chatBotId },
          data: {
            isKnowledgeInitialized: true,
            lastKnowledgeUpdate: new Date(),
            totalChunks
          }
        });
        console.log(`Updated chatbot ${updatedChatBot.name} with ${totalChunks} chunks`);
      } catch (updateError) {
        console.error('Error updating chatbot:', updateError);
        // Even if update fails, the processing was successful
        console.log(`Knowledge base processing completed with ${totalChunks} chunks, but failed to update chatbot status`);
      }

      console.log(`Successfully initialized knowledge base for chatbot ${chatBotId} with ${totalChunks} chunks`);
    } catch (error) {
      console.error('Error initializing chatbot knowledge:', error);
      throw error;
    }
  }

  async processNewFile(fileId: string): Promise<void> {
    try {
      const file = await prisma.file.findUnique({
        where: { id: fileId }
      });

      if (!file || file.processed) {
        return;
      }

      if (fs.existsSync(file.fileUrl)) {
        const docs = await this.documentProcessor.processFile(file.fileUrl, file.fileName);
        await this.vectorStoreService.addDocuments(file.chatBotId, docs, file.id);

        // Update chatbot chunk count
        await prisma.chatBot.update({
          where: { id: file.chatBotId },
          data: {
            totalChunks: {
              increment: docs.length
            },
            lastKnowledgeUpdate: new Date()
          }
        });
      }
    } catch (error) {
      console.error('Error processing new file:', error);
      throw error;
    }
  }

  async generateResponse(
    chatBotId: string,
    query: string,
    conversationHistory: Array<{ role: string; message: string }> = []
  ): Promise<string> {
    try {
      // Check if chatbot exists and knowledge base is initialized
      const chatBot = await prisma.chatBot.findUnique({
        where: { id: chatBotId }
      });

      if (!chatBot) {
        return 'I apologize, but I cannot find the chatbot configuration. Please contact support.';
      }

      if (!chatBot.isKnowledgeInitialized) {
        return 'I apologize, but my knowledge base is still being initialized. Please try again in a few moments.';
      }

      // Get relevant documents
      const relevantDocs = await this.vectorStoreService.similaritySearch(
        chatBotId,
        query,
        5
      );

      // Create context from relevant documents
      const context = relevantDocs
        .map(doc => doc.pageContent)
        .join('\n\n');

      // Format conversation history
      const history = conversationHistory
        .slice(-5)
        .map(msg => `${msg.role}: ${msg.message}`)
        .join('\n');

      // Create the prompt template
      const promptTemplate = ChatPromptTemplate.fromTemplate(`
You are ${chatBot.name}, a helpful AI assistant for ClientSync. Use the provided context and conversation history to answer the user's question accurately and helpfully.

Context:
{context}

Conversation History:
{history}

User Question: {question}

Instructions:
- Answer based on the provided context when possible
- If the context doesn't contain relevant information, provide a helpful general response
- Be concise but comprehensive
- Maintain a professional and friendly tone
- If you're unsure about something, say so rather than guessing
- Stay in character as ${chatBot.name}

Answer:
      `);

      // Create the chain
      const chain = RunnableSequence.from([
        promptTemplate,
        llm,
        new StringOutputParser(),
      ]);

      // Generate response
      const response = await chain.invoke({
        context,
        history,
        question: query,
      });

      return response;
    } catch (error) {
      console.error('Error generating RAG response:', error);
      return 'I apologize, but I encountered an error while processing your request. Please try again later.';
    }
  }
}