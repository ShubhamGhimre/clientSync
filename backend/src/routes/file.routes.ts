import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { PrismaClient } from '../../generated/prisma/index.js';
import { authenticateToken, type AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccessResponse, sendErrorResponse, createPaginationResponse } from '../utils/helpers.js';
import { PaginationSchema } from '../utils/validation.js';
import z from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'files');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.txt', '.doc', '.docx', '.csv', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, TXT, DOC, DOCX, CSV, JSON files are allowed.'));
    }
  }
});

/**
 * @swagger
 * /api/files:
 *   get:
 *     tags: [Files]
 *     summary: Get all files for a chatbot
 *     description: Retrieve paginated files for a specific chatbot
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: chatBotId
 *         required: true
 *         schema:
 *           type: string
 *         description: ChatBot ID
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
 *         description: Files retrieved successfully
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const { chatBotId, page, limit } = PaginationSchema.extend({
      chatBotId: z.string().min(1, 'ChatBot ID is required')
    }).parse(req.query);

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

    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where: { chatBotId },
        skip,
        take: limit,
        orderBy: { uploadedAt: 'desc' }
      }),
      prisma.file.count({ where: { chatBotId } })
    ]);

    const paginationResult = createPaginationResponse(files, total, { page, limit });

    res.json({
      success: true,
      ...paginationResult
    });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendErrorResponse(res, 'Invalid query parameters', 400, error.errors);
    }

    console.error('Get files error:', error);
    sendErrorResponse(res, 'Failed to get files');
  }
});

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     tags: [Files]
 *     summary: Upload file to chatbot
 *     description: Upload a file and associate it with a chatbot
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - chatBotId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               chatBotId:
 *                 type: string
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: Invalid file or missing chatBotId
 *       404:
 *         description: ChatBot not found
 */
router.post('/upload', authenticateToken, upload.single('file'), async (req: AuthRequest, res: express.Response) => {
  try {
    const { chatBotId } = req.body;

    if (!chatBotId) {
      return sendErrorResponse(res, 'ChatBot ID is required', 400);
    }

    if (!req.file) {
      return sendErrorResponse(res, 'File is required', 400);
    }

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

    const fileUrl = `/uploads/files/${req.file.filename}`;

    const file = await prisma.file.create({
      data: {
        fileName: req.file.originalname,
        fileUrl,
        chatBotId
      }
    });

    sendSuccessResponse(res, 'File uploaded successfully', file, 201);

  } catch (error) {
    console.error('Upload file error:', error);
    sendErrorResponse(res, 'Failed to upload file');
  }
});

/**
 * @swagger
 * /api/files/{id}:
 *   delete:
 *     tags: [Files]
 *     summary: Delete file
 *     description: Delete a file and remove it from storage
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
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 */
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;

    if(!id) {
        return sendErrorResponse(res, 'File ID is required', 400);
    }

    // Verify file belongs to user's organization
    const file = await prisma.file.findFirst({
      where: { id },
      include: {
        chatBot: {
          select: { organizationId: true }
        }
      }
    });

    if (!file || file.chatBot.organizationId !== req.user!.organizationId) {
      return sendErrorResponse(res, 'File not found', 404);
    }

    // Delete file from storage
    try {
      const filePath = path.join(process.cwd(), file.fileUrl);
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Could not delete file from storage:', error);
    }

    // Delete file record
    await prisma.file.delete({ where: { id } });

    sendSuccessResponse(res, 'File deleted successfully');

  } catch (error) {
    console.error('Delete file error:', error);
    sendErrorResponse(res, 'Failed to delete file');
  }
});

export default router;