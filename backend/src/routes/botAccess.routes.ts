import express from 'express';
import { PrismaClient } from '../../generated/prisma/index.js';
import { authenticateToken, type AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccessResponse, sendErrorResponse, createPaginationResponse } from '../utils/helpers.js';
import { PaginationSchema } from '../utils/validation.js';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const UpdateBotAccessSchema = z.object({
  isBlocked: z.boolean()
});

/**
 * @swagger
 * /api/bot-access:
 *   get:
 *     tags: [Bot Access]
 *     summary: Get bot access permissions
 *     description: Retrieve bot access permissions for users in the organization
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: chatBotId
 *         schema:
 *           type: string
 *         description: Filter by chatbot ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
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
 *         description: Bot access permissions retrieved successfully
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const { chatBotId, userId, page, limit } = PaginationSchema.extend({
      chatBotId: z.string().optional(),
      userId: z.string().optional()
    }).parse(req.query);

    const skip = (page - 1) * limit;

    const where: any = {
      user: {
        organizationId: req.user!.organizationId
      },
      chatBot: {
        organizationId: req.user!.organizationId
      }
    };

    if (chatBotId) where.chatBotId = chatBotId;
    if (userId) where.userId = userId;

    const [botAccess, total] = await Promise.all([
      prisma.botAccess.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          },
          chatBot: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.botAccess.count({ where })
    ]);

    const paginationResult = createPaginationResponse(botAccess, total, { page, limit });

    res.json({
      success: true,
      ...paginationResult
    });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendErrorResponse(res, 'Invalid query parameters', 400, error.errors);
    }

    console.error('Get bot access error:', error);
    sendErrorResponse(res, 'Failed to get bot access permissions');
  }
});

/**
 * @swagger
 * /api/bot-access:
 *   post:
 *     tags: [Bot Access]
 *     summary: Grant bot access to user
 *     description: Grant or update bot access permission for a user
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - chatBotId
 *             properties:
 *               userId:
 *                 type: string
 *               chatBotId:
 *                 type: string
 *               isBlocked:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Bot access granted successfully
 *       404:
 *         description: User or ChatBot not found
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    // Check if user is admin
    if (req.user!.role !== 'ADMIN') {
      return sendErrorResponse(res, 'Only admins can manage bot access', 403);
    }

    const { userId, chatBotId, isBlocked = false } = z.object({
      userId: z.string().min(1, 'User ID is required'),
      chatBotId: z.string().min(1, 'ChatBot ID is required'),
      isBlocked: z.boolean().default(false)
    }).parse(req.body);

    // Verify user and chatbot belong to organization
    const [user, chatBot] = await Promise.all([
      prisma.user.findFirst({
        where: {
          id: userId,
          organizationId: req.user!.organizationId
        }
      }),
      prisma.chatBot.findFirst({
        where: {
          id: chatBotId,
          organizationId: req.user!.organizationId
        }
      })
    ]);

    if (!user) {
      return sendErrorResponse(res, 'User not found', 404);
    }

    if (!chatBot) {
      return sendErrorResponse(res, 'ChatBot not found', 404);
    }

    const botAccess = await prisma.botAccess.upsert({
      where: {
        userId_chatBotId: {
          userId,
          chatBotId
        }
      },
      update: { isBlocked },
      create: {
        userId,
        chatBotId,
        isBlocked
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        chatBot: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    sendSuccessResponse(res, 'Bot access updated successfully', botAccess, 201);

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendErrorResponse(res, 'Validation failed', 400, error.errors);
    }

    console.error('Update bot access error:', error);
    sendErrorResponse(res, 'Failed to update bot access');
  }
});

/**
 * @swagger
 * /api/bot-access/{id}:
 *   put:
 *     tags: [Bot Access]
 *     summary: Update bot access permission
 *     description: Update bot access permission (block/unblock)
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
 *             required:
 *               - isBlocked
 *             properties:
 *               isBlocked:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Bot access updated successfully
 *       404:
 *         description: Bot access not found
 */
router.put('/:id', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    // Check if user is admin
    if (req.user!.role !== 'ADMIN') {
      return sendErrorResponse(res, 'Only admins can manage bot access', 403);
    }

    const { id } = req.params;
    const validatedData = UpdateBotAccessSchema.parse(req.body);

    if(!id) {
      return sendErrorResponse(res, 'Bot access ID is required', 400);
    }

    // Verify bot access belongs to organization
    const existingBotAccess = await prisma.botAccess.findFirst({
      where: {
        id,
        user: {
          organizationId: req.user!.organizationId
        }
      }
    });

    if (!existingBotAccess) {
      return sendErrorResponse(res, 'Bot access not found', 404);
    }

    const botAccess = await prisma.botAccess.update({
      where: { id },
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        chatBot: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    sendSuccessResponse(res, 'Bot access updated successfully', botAccess);

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendErrorResponse(res, 'Validation failed', 400, error.errors);
    }

    console.error('Update bot access error:', error);
    sendErrorResponse(res, 'Failed to update bot access');
  }
});

/**
 * @swagger
 * /api/bot-access/{id}:
 *   delete:
 *     tags: [Bot Access]
 *     summary: Remove bot access
 *     description: Remove bot access permission for a user
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
 *         description: Bot access removed successfully
 *       404:
 *         description: Bot access not found
 */
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    // Check if user is admin
    if (req.user!.role !== 'ADMIN') {
      return sendErrorResponse(res, 'Only admins can manage bot access', 403);
    }

    const { id } = req.params;

    if (!id) {
      return sendErrorResponse(res, 'Bot access ID is required', 400);
    }

    // Verify bot access belongs to organization
    const existingBotAccess = await prisma.botAccess.findFirst({
      where: {
        id,
        user: {
          organizationId: req.user!.organizationId
        }
      }
    });

    if (!existingBotAccess) {
      return sendErrorResponse(res, 'Bot access not found', 404);
    }

    await prisma.botAccess.delete({ where: { id } });

    sendSuccessResponse(res, 'Bot access removed successfully');

  } catch (error) {
    console.error('Remove bot access error:', error);
    sendErrorResponse(res, 'Failed to remove bot access');
  }
});

export default router;