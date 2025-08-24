import express from 'express';
import { ConversationService } from '../services/conversation.service';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();
const conversationService = new ConversationService();

/**
 * @swagger
 * /api/conversations/{chatRoomId}:
 *   get:
 *     summary: Get all conversations for a chat room
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatRoomId
 *         required: true
 *         schema:
 *           type: string
 *         description: The chat room ID
 *     responses:
 *       200:
 *         description: All conversations retrieved successfully
 */
router.get('/:chatRoomId', authenticateToken, async (req, res) => {
    try {
        const { chatRoomId } = req.params;

        if(!chatRoomId) {
          return res.status(400).json({
              success: false,
              message: 'Chat room ID is required'
          });
        }
        
        const conversations = await conversationService.getAllConversations(chatRoomId);
        
        res.json({
            success: true,
            data: conversations,
            total: conversations.length,
            message: 'All conversations retrieved successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve conversations'
        });
    }
});

/**
 * @swagger
 * /api/conversations:
 *   post:
 *     summary: Send a message (alternative to RAG chat)
 *     tags: [Conversations]
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
 *               message:
 *                 type: string
 *               sender:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { chatRoomId, message, sender, userId } = req.body;

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
                message: 'Message sent successfully',
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to send message'
        });
    }
});

/**
 * @swagger
 * /api/conversations/{chatRoomId}/clear:
 *   delete:
 *     summary: Clear all conversations in a chat room
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatRoomId
 *         required: true
 *         schema:
 *           type: string
 *         description: The chat room ID
 *     responses:
 *       200:
 *         description: Conversations cleared successfully
 */
router.delete('/:chatRoomId/clear', authenticateToken, async (req, res) => {
    try {
        const { chatRoomId } = req.params;

        if(!chatRoomId) {
          return res.status(400).json({
              success: false,
              message: 'Chat room ID is required'
          });
        }
        
        const result = await conversationService.clearConversations(chatRoomId);
        
        res.json({
            success: true,
            data: result,
            message: result.message
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to clear conversations'
        });
    }
});

export default router;