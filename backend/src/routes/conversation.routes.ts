import express from 'express';
import { PrismaClient } from '../../generated/prisma/index.js';
import { authenticateToken, type AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccessResponse, sendErrorResponse, createPaginationResponse } from '../utils/helpers.js';
import { SendMessageSchema, PaginationSchema } from '../utils/validation.js';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     tags: [Conversations]
 *     summary: Get conversations for a chat room
 *     description: Retrieve paginated conversations for a specific chat room
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: chatRoomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat room ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *       404:
 *         description: Chat room not found
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const { chatRoomId, page, limit } = PaginationSchema.extend({
      chatRoomId: z.string().min(1, 'Chat room ID is required')
    }).parse(req.query);

    // Verify chat room belongs to user's organization
    const chatRoom = await prisma.chatRoom.findFirst({
      where: {
        id: chatRoomId,
        chatBot: {
          organizationId: req.user!.organizationId
        }
      }
    });

    if (!chatRoom) {
      return sendErrorResponse(res, 'Chat room not found', 404);
    }

    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where: { chatRoomId },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' }
      }),
      prisma.conversation.count({ where: { chatRoomId } })
    ]);

    const paginationResult = createPaginationResponse(conversations, total, { page, limit });

    res.json({
      success: true,
      ...paginationResult
    });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendErrorResponse(res, 'Invalid query parameters', 400, error.errors);
    }

    console.error('Get conversations error:', error);
    sendErrorResponse(res, 'Failed to get conversations');
  }
});

/**
 * @swagger
 * /api/conversations:
 *   post:
 *     tags: [Conversations]
 *     summary: Send message to chat room
 *     description: Add a new message to a chat room
 *     security:
 *       - BearerAuth: []
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
 *                 example: 'Hello, how can I help you?'
 *               sender:
 *                 type: string
 *                 example: 'customer'
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       404:
 *         description: Chat room not found
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const { chatRoomId, message, sender } = z.object({
      chatRoomId: z.string().min(1, 'Chat room ID is required'),
      message: z.string().min(1, 'Message is required'),
      sender: z.string().min(1, 'Sender is required')
    }).parse(req.body);

    // Verify chat room belongs to user's organization
    const chatRoom = await prisma.chatRoom.findFirst({
      where: {
        id: chatRoomId,
        chatBot: {
          organizationId: req.user!.organizationId
        }
      }
    });

    if (!chatRoom) {
      return sendErrorResponse(res, 'Chat room not found', 404);
    }

    const conversation = await prisma.conversation.create({
      data: {
        message,
        sender,
        chatRoomId
      }
    });

    sendSuccessResponse(res, 'Message sent successfully', conversation, 201);

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendErrorResponse(res, 'Validation failed', 400, error.errors);
    }

    console.error('Send message error:', error);
    sendErrorResponse(res, 'Failed to send message');
  }
});

/**
 * @swagger
 * /api/conversations/{id}:
 *   delete:
 *     tags: [Conversations]
 *     summary: Delete conversation
 *     description: Delete a specific conversation message
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation deleted successfully
 *       404:
 *         description: Conversation not found
 */
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendErrorResponse(res, 'Conversation ID is required', 400);
    }
    // Verify conversation belongs to user's organization
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        chatRoom: {
          chatBot: {
            organizationId: req.user!.organizationId
          }
        }
      }
    });

    if (!conversation) {
      return sendErrorResponse(res, 'Conversation not found', 404);
    }

    await prisma.conversation.delete({ where: { id } });

    sendSuccessResponse(res, 'Conversation deleted successfully');

  } catch (error) {
    console.error('Delete conversation error:', error);
    sendErrorResponse(res, 'Failed to delete conversation');
  }
});

export default router;