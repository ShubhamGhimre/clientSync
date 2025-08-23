// src/routes/rag.routes.ts
import express from 'express';
import { RAGService } from '../services/rag.service';
import { ConversationService } from '../services/conversation.service';
import { authenticateToken } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const ragService = new RAGService();
const conversationService = new ConversationService();
const prisma = new PrismaClient();

// Store initialization progress
const initializationProgress = new Map<string, {
  status: 'processing' | 'completed' | 'failed';
  totalFiles: number;
  processedFiles: number;
  totalChunks: number;
  processedChunks: number;
  currentFile?: string;
  message: string;
  startTime: Date;
}>();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     ChatMessage:
 *       type: object
 *       required:
 *         - chatRoomId
 *         - message
 *         - sender
 *       properties:
 *         chatRoomId:
 *           type: string
 *           description: The ID of the chat room
 *           example: "cm12345678901234567890"
 *         message:
 *           type: string
 *           description: The message content
 *           example: "How do I install WordPress?"
 *         sender:
 *           type: string
 *           description: The sender identifier
 *           example: "user"
 *         userId:
 *           type: string
 *           description: The ID of the user sending the message
 *           example: "cm09876543210987654321"
 *     
 *     ChatResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             response:
 *               type: string
 *               description: The AI-generated response
 *               example: "To install WordPress, you'll need to follow these steps..."
 *             message:
 *               type: string
 *               example: "Message processed successfully"
 *     
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Operation completed successfully"
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Error message describing what went wrong"
 * 
 * tags:
 *   - name: RAG
 *     description: RAG (Retrieval-Augmented Generation) operations for chatbots
 */

/**
 * @swagger
 * /api/rag/initialize/{chatbotId}:
 *   post:
 *     summary: Initialize knowledge base for a chatbot
 *     tags: [RAG]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatbotId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the chatbot
 *     responses:
 *       202:
 *         description: Knowledge base initialization started
 *       404:
 *         description: Chatbot not found
 *       409:
 *         description: Initialization already in progress
 */
router.post('/initialize/:chatbotId', authenticateToken, async (req, res) => {
    try {
        const { chatbotId } = req.params;

        if (typeof chatbotId !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid chatbotId parameter'
            });
        }

        // Validate that the chatbot exists
        const chatBot = await prisma.chatBot.findUnique({
            where: { id: chatbotId }
        });

        if (!chatBot) {
            return res.status(404).json({
                success: false,
                message: `Chatbot with ID ${chatbotId} not found. Please check the chatbot ID.`
            });
        }

        // Check if initialization is already in progress
        if (initializationProgress.has(chatbotId)) {
            const progress = initializationProgress.get(chatbotId)!;
            if (progress.status === 'processing') {
                return res.status(409).json({
                    success: false,
                    message: 'Knowledge base initialization is already in progress',
                    progressUrl: `/api/rag/progress/${chatbotId}`
                });
            }
        }

        // Initialize progress tracking
        initializationProgress.set(chatbotId, {
            status: 'processing',
            totalFiles: 0,
            processedFiles: 0,
            totalChunks: 0,
            processedChunks: 0,
            message: 'Starting initialization...',
            startTime: new Date()
        });

        // Start initialization in background
        ragService.initializeChatbotKnowledge(chatbotId)
            .then(() => {
                initializationProgress.set(chatbotId, {
                    status: 'completed',
                    totalFiles: 0,
                    processedFiles: 0,
                    totalChunks: 0,
                    processedChunks: 0,
                    message: 'Knowledge base initialization completed successfully',
                    startTime: initializationProgress.get(chatbotId)?.startTime || new Date()
                });
            })
            .catch((error) => {
                initializationProgress.set(chatbotId, {
                    status: 'failed',
                    totalFiles: 0,
                    processedFiles: 0,
                    totalChunks: 0,
                    processedChunks: 0,
                    message: `Initialization failed: ${error.message}`,
                    startTime: initializationProgress.get(chatbotId)?.startTime || new Date()
                });
            });

        res.status(202).json({
            success: true,
            message: `Knowledge base initialization started for chatbot: ${chatBot.name}`,
            progressUrl: `/api/rag/progress/${chatbotId}`,
            chatbot: {
                id: chatBot.id,
                name: chatBot.name
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to start knowledge base initialization',
        });
    }
});

/**
 * @swagger
 * /api/rag/progress/{chatbotId}:
 *   get:
 *     summary: Get knowledge base initialization progress
 *     tags: [RAG]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatbotId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the chatbot
 *     responses:
 *       200:
 *         description: Initialization progress retrieved successfully
 *       404:
 *         description: No initialization process found
 */
router.get('/progress/:chatbotId', authenticateToken, async (req, res) => {
    try {
        const { chatbotId } = req.params;
        
               if (typeof chatbotId !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid chatbotId parameter'
            });
        }

        const progress = initializationProgress.get(chatbotId);
        
        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'No initialization process found for this chatbot'
            });
        }

        // Calculate progress percentage
        const progressPercentage = progress.totalChunks > 0 
            ? (progress.processedChunks / progress.totalChunks) * 100 
            : 0;

        // Calculate time elapsed
        const timeElapsed = Date.now() - progress.startTime.getTime();
        const timeElapsedFormatted = formatDuration(timeElapsed);

        res.json({
            success: true,
            data: {
                ...progress,
                progress: Math.round(progressPercentage * 100) / 100,
                timeElapsed: timeElapsedFormatted
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve progress'
        });
    }
});

/**
 * @swagger
 * /api/rag/chat:
 *   post:
 *     summary: Process a chat message
 *     tags: [RAG]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatRoomId
 *               - message
 *               - sender
 *             properties:
 *               chatRoomId:
 *                 type: string
 *                 description: The chat room ID
 *               message:
 *                 type: string
 *                 description: The user's message
 *               sender:
 *                 type: string
 *                 description: The sender type (user/bot)
 *               userId:
 *                 type: string
 *                 description: The user ID (optional)
 *     responses:
 *       200:
 *         description: Message processed successfully
 *       404:
 *         description: Chat room not found
 */
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const { chatRoomId, message, sender, userId } = req.body;

        // Validate required fields
        if (!chatRoomId || !message || !sender) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: chatRoomId, message, sender'
            });
        }

        const response = await conversationService.processMessage(
            chatRoomId,
            message,
            sender,
            userId
        );

        res.json({
            success: true,
            data: {
                response,
                message: 'Message processed successfully',
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to process message',
        });
    }
});

// Utility function to format duration
function formatDuration(ms: number): string {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
}

export default router;