// src/services/conversation.service.ts
import { RAGService } from './rag.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ConversationService {
  private ragService: RAGService;

  constructor() {
    this.ragService = new RAGService();
  }

  async processMessage(
    chatRoomId: string,
    message: string,
    sender: string,
    userId?: string
  ): Promise<string> {
    try {
      // Get chat room details
      const chatRoom = await prisma.chatRoom.findUnique({
        where: { id: chatRoomId },
        include: { chatBot: true },
      });

      if (!chatRoom) {
        // Create a default response if chat room is not found
        console.error(`Chat room not found: ${chatRoomId}`);
        return 'I apologize, but I cannot find the chat session. Please refresh the page and try again.';
      }

      // Save user message
      await prisma.conversation.create({
        data: {
          chatRoomId,
          message,
          sender,
        //   fromUserId: userId,
        },
      });

      // Get conversation history
      const conversationHistory = await prisma.conversation.findMany({
        where: { chatRoomId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      const history = conversationHistory
        .reverse()
        .map(conv => ({
          role: conv.sender === 'user' ? 'user' : 'assistant',
          message: conv.message,
        }));

      // Generate AI response using RAG
      const aiResponse = await this.ragService.generateResponse(
        chatRoom.chatBotId,
        message,
        history
      );

      // Save AI response
      await prisma.conversation.create({
        data: {
          chatRoomId,
          message: aiResponse,
          sender: 'bot',
        },
      });

      return aiResponse;
    } catch (error) {
      console.error('Error processing message:', error);
      return 'I apologize, but I encountered an error while processing your request. Please try again later.';
    }
  }
}