import express from 'express';
import { PrismaClient } from '../../generated/prisma';
import { authenticateToken, type AuthRequest } from '../middleware/auth.middleware';
import { CreateChatBotSchema } from '../utils/validation';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/chatbots:
 *   get:
 *     tags: [ChatBots]
 *     summary: Get all chatbots
 *     description: Retrieve all chatbots belonging to the authenticated user's organization
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Chatbots retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/ChatBot'
 *                           - type: object
 *                             properties:
 *                               _count:
 *                                 type: object
 *                                 properties:
 *                                   chatRooms:
 *                                     type: integer
 *                                   files:
 *                                     type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // const subDomain = req.subdomain
    // if(!subDomain) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Subdomain is required'
    //   });
    // }
    const chatBots = await prisma.chatBot.findMany({
      where: { organizationId: req.user!.organizationId },
      include: {
        _count: {
          select: {
            chatRooms: true,
            files: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: chatBots
    });

  } catch (error) {
    console.error('Get chatbots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chatbots'
    });
  }
});

/**
 * @swagger
 * /api/chatbots:
 *   post:
 *     tags: [ChatBots]
 *     summary: Create new chatbot
 *     description: Create a new chatbot for the authenticated user's organization
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateChatBotRequest'
 *     responses:
 *       201:
 *         description: Chatbot created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ChatBot'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const validatedData = CreateChatBotSchema.parse(req.body);

    const chatBot = await prisma.chatBot.create({
      data: {
        name: validatedData.name,
        description: validatedData.description === undefined ? null : validatedData.description,
        organizationId: req.user!.organizationId
      }
    });

    res.status(201).json({
      success: true,
      message: 'ChatBot created successfully',
      data: chatBot
    });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      });
    }

    console.error('Create chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chatbot'
    });
  }
});

/**
 * @swagger
 * /api/chatbots/{id}:
 *   get:
 *     tags: [ChatBots]
 *     summary: Get chatbot by ID
 *     description: Retrieve a specific chatbot with its files and recent conversations
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The chatbot ID
 *     responses:
 *       200:
 *         description: Chatbot retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/ChatBot'
 *                         - type: object
 *                           properties:
 *                             files:
 *                               type: array
 *                               items:
 *                                 type: object
 *                             chatRooms:
 *                               type: array
 *                               items:
 *                                 type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Chatbot not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ChatBot ID is required'
      });
    }

    const chatBot = await prisma.chatBot.findFirst({
      where: {
        id: id,
        organizationId: req.user!.organizationId
      },
      include: {
        files: true,
        chatRooms: {
          include: {
            conversations: {
              orderBy: { createdAt: 'desc' },
              take: 10
            }
          }
        }
      }
    });

    if (!chatBot) {
      return res.status(404).json({
        success: false,
        message: 'ChatBot not found'
      });
    }

    res.json({
      success: true,
      data: chatBot
    });

  } catch (error) {
    console.error('Get chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chatbot'
    });
  }
});

export default router;