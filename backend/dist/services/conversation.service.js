// src/services/conversation.service.ts
import { RAGService } from './rag.service';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class ConversationService {
    ragService;
    constructor() {
        this.ragService = new RAGService();
    }
    async processMessage(chatRoomId, message, sender, userId) {
        try {
            // Get chat room details
            const chatRoom = await prisma.chatRoom.findUnique({
                where: { id: chatRoomId },
                include: { chatBot: true },
            });
            if (!chatRoom) {
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
            // Get ALL conversation history (no pagination)
            const conversationHistory = await prisma.conversation.findMany({
                where: { chatRoomId },
                orderBy: { createdAt: 'asc' }, // Get in chronological order
            });
            // Format history for RAG (keeping all messages)
            const history = conversationHistory.map(conv => ({
                role: conv.sender === 'user' ? 'user' : 'assistant',
                message: conv.message,
            }));
            // Generate AI response using RAG
            const aiResponse = await this.ragService.generateResponse(chatRoom.chatBotId, message, history // Pass all history without limitation
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
        }
        catch (error) {
            console.error('Error processing message:', error);
            return 'I apologize, but I encountered an error while processing your request. Please try again later.';
        }
    }
    // Get all conversations for a chat room (no pagination)
    async getAllConversations(chatRoomId) {
        try {
            const conversations = await prisma.conversation.findMany({
                where: { chatRoomId },
                orderBy: { createdAt: 'asc' },
                include: {
                //   fromUser: {
                //     select: {
                //       id: true,
                //       name: true,
                //       email: true,
                //     }
                //   }
                }
            });
            return conversations;
        }
        catch (error) {
            console.error('Error fetching conversations:', error);
            throw error;
        }
    }
    // Clear all conversations in a chat room
    async clearConversations(chatRoomId) {
        try {
            const deletedCount = await prisma.conversation.deleteMany({
                where: { chatRoomId }
            });
            return {
                success: true,
                deletedCount: deletedCount.count,
                message: `Cleared ${deletedCount.count} conversations`
            };
        }
        catch (error) {
            console.error('Error clearing conversations:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=conversation.service.js.map