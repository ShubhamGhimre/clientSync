import express from 'express';
import { authenticateToken, type AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccessResponse, sendErrorResponse, createPaginationResponse } from '../utils/helpers.js';
import { CreateChatRoomSchema, PaginationSchema } from '../utils/validation.js';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

const UpdateChatRoomSchema = z.object({
  title: z.string().min(1).optional()
});

/**
 * @swagger
 * /api/chatrooms:
 *   get:
 *     tags: [ChatRooms]
 *     summary: Get all chat rooms
 *     description: Retrieve paginated chat rooms for the organization
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: chatBotId
 *         schema:
 *           type: string
 *         description: Filter by chatbot ID
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
 *           default: 10
 *     responses:
 *       200:
 *         description: Chat rooms retrieved successfully
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const { chatBotId, page, limit } = PaginationSchema.extend({
      chatBotId: z.string().optional()
    }).parse(req.query);

    const skip = (page - 1) * limit;

    const where: any = {
      chatBot: {
        organizationId: req.user!.organizationId
      }
    };

    if (chatBotId) {
      where.chatBotId = chatBotId;
    }

    const [chatRooms, total] = await Promise.all([
      prisma.chatRoom.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          chatBot: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              conversations: true
            }
          }
        }
      }),
      prisma.chatRoom.count({ where })
    ]);

    const paginationResult = createPaginationResponse(chatRooms, total, { page, limit });

    res.json({
      success: true,
      ...paginationResult
    });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendErrorResponse(res, 'Invalid query parameters', 400, error.errors);
    }

    console.error('Get chat rooms error:', error);
    sendErrorResponse(res, 'Failed to get chat rooms');
  }
});

/**
 * @swagger
 * /api/chatrooms:
 *   post:
 *     tags: [ChatRooms]
 *     summary: Create new chat room
 *     description: Create a new chat room for a chatbot
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatBotId
 *               - title
 *             properties:
 *               chatBotId:
 *                 type: string
 *               title:
 *                 type: string
 *                 example: 'Customer Support Chat'
 *     responses:
 *       201:
 *         description: Chat room created successfully
 *       404:
 *         description: ChatBot not found
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const { chatBotId, title } = z.object({
      chatBotId: z.string().min(1, 'ChatBot ID is required'),
      title: z.string().min(1, 'Title is required')
    }).parse(req.body);

    // Verify chatbot belongs to user's organization
    const chatBot = await prisma.chatBot.findFirst({
      where: {
        id: chatBotId,
        organizationId: req.user!.organizationId
      }
    });

    if (!chatBot) {
      return sendErrorResponse(res, 'ChatBot not found', 404);
    }

    const chatRoom = await prisma.chatRoom.create({
      data: {
        title,
        chatBotId
      },
      include: {
        chatBot: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    sendSuccessResponse(res, 'Chat room created successfully', chatRoom, 201);

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendErrorResponse(res, 'Validation failed', 400, error.errors);
    }

    console.error('Create chat room error:', error);
    sendErrorResponse(res, 'Failed to create chat room');
  }
});

/**
 * @swagger
 * /api/chatrooms/{id}:
 *   get:
 *     tags: [ChatRooms]
 *     summary: Get chat room by ID
 *     description: Retrieve a specific chat room with conversations
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
 *         description: Chat room retrieved successfully
 *       404:
 *         description: Chat room not found
 */
router.get('/:id', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendErrorResponse(res, 'Chat room ID is required', 400);
    }

    const chatRoom = await prisma.chatRoom.findFirst({
      where: {
        id,
        chatBot: {
          organizationId: req.user!.organizationId
        }
      },
      include: {
        chatBot: {
          select: {
            id: true,
            name: true
          }
        },
        conversations: {
          orderBy: { createdAt: 'asc' },
          take: 50 // Limit conversations for performance
        }
      }
    });

    if (!chatRoom) {
      return sendErrorResponse(res, 'Chat room not found', 404);
    }

    sendSuccessResponse(res, 'Chat room retrieved successfully', chatRoom);

  } catch (error) {
    console.error('Get chat room error:', error);
    sendErrorResponse(res, 'Failed to get chat room');
  }
});

/**
 * @swagger
 * /api/chatrooms/{id}:
 *   put:
 *     tags: [ChatRooms]
 *     summary: Update chat room
 *     description: Update chat room details
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat room updated successfully
 *       404:
 *         description: Chat room not found
 */
router.put('/:id', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const validatedData = UpdateChatRoomSchema.parse(req.body);

        if (!id) {
      return sendErrorResponse(res, 'Chat room ID is required', 400);
    }
    // Verify chat room belongs to user's organization
    const existingChatRoom = await prisma.chatRoom.findFirst({
      where: {
        id,
        chatBot: {
          organizationId: req.user!.organizationId
        }
      }
    });

    if (!existingChatRoom) {
      return sendErrorResponse(res, 'Chat room not found', 404);
    }

    const chatRoom = await prisma.chatRoom.update({
      where: { id },
      data: validatedData.title !== undefined ? { title: { set: validatedData.title } } : {},
      include: {
        chatBot: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    sendSuccessResponse(res, 'Chat room updated successfully', chatRoom);

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendErrorResponse(res, 'Validation failed', 400, error.errors);
    }

    console.error('Update chat room error:', error);
    sendErrorResponse(res, 'Failed to update chat room');
  }
});

/**
 * @swagger
 * /api/chatrooms/{id}:
 *   delete:
 *     tags: [ChatRooms]
 *     summary: Delete chat room
 *     description: Delete a chat room and all its conversations
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
 *         description: Chat room deleted successfully
 *       404:
 *         description: Chat room not found
 */
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;

        if (!id) {
      return sendErrorResponse(res, 'Chat room ID is required', 400);
    }
    // Verify chat room belongs to user's organization
    const existingChatRoom = await prisma.chatRoom.findFirst({
      where: {
        id,
        chatBot: {
          organizationId: req.user!.organizationId
        }
      }
    });

    if (!existingChatRoom) {
      return sendErrorResponse(res, 'Chat room not found', 404);
    }

    await prisma.chatRoom.delete({ where: { id } });

    sendSuccessResponse(res, 'Chat room deleted successfully');

  } catch (error) {
    console.error('Delete chat room error:', error);
    sendErrorResponse(res, 'Failed to delete chat room');
  }
});

export default router;