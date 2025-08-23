import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { authenticateToken, type AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/helpers.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for ticket attachments
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'tickets');
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
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.txt', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.gif', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only documents and images are allowed.'));
    }
  }
});

/**
 * @swagger
 * /api/ticket-attachments/{ticketId}:
 *   get:
 *     tags: [Ticket Attachments]
 *     summary: Get attachments for a ticket
 *     description: Retrieve all attachments for a specific support ticket
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *         description: Support ticket ID
 *     responses:
 *       200:
 *         description: Attachments retrieved successfully
 *       404:
 *         description: Ticket not found
 */
router.get('/:ticketId', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const { ticketId } = req.params;

    if (!ticketId) {
      return sendErrorResponse(res, 'Ticket ID is required', 400);
    }

    // Verify ticket belongs to user's organization
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: ticketId,
        organizationId: req.user!.organizationId
      }
    });

    if (!ticket) {
      return sendErrorResponse(res, 'Ticket not found', 404);
    }

    const attachments = await prisma.ticketAttachment.findMany({
      where: { ticketId },
      orderBy: { uploadedAt: 'desc' }
    });

    sendSuccessResponse(res, 'Attachments retrieved successfully', attachments);

  } catch (error) {
    console.error('Get attachments error:', error);
    sendErrorResponse(res, 'Failed to get attachments');
  }
});

/**
 * @swagger
 * /api/ticket-attachments/upload:
 *   post:
 *     tags: [Ticket Attachments]
 *     summary: Upload attachment to ticket
 *     description: Upload a file attachment to a support ticket
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
 *               - ticketId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               ticketId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Attachment uploaded successfully
 *       400:
 *         description: Invalid file or missing ticketId
 *       404:
 *         description: Ticket not found
 */
router.post('/upload', authenticateToken, upload.single('file'), async (req: AuthRequest, res: express.Response) => {
  try {
    const { ticketId } = req.body;

    if (!ticketId) {
      return sendErrorResponse(res, 'Ticket ID is required', 400);
    }

    if (!req.file) {
      return sendErrorResponse(res, 'File is required', 400);
    }

    // Verify ticket belongs to user's organization
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: ticketId,
        organizationId: req.user!.organizationId
      }
    });

    if (!ticket) {
      return sendErrorResponse(res, 'Ticket not found', 404);
    }

    const fileUrl = `/uploads/tickets/${req.file.filename}`;

    const attachment = await prisma.ticketAttachment.create({
      data: {
        fileName: req.file.originalname,
        fileUrl,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        ticketId
      }
    });

    sendSuccessResponse(res, 'Attachment uploaded successfully', attachment, 201);

  } catch (error) {
    console.error('Upload attachment error:', error);
    sendErrorResponse(res, 'Failed to upload attachment');
  }
});

/**
 * @swagger
 * /api/ticket-attachments/{id}:
 *   delete:
 *     tags: [Ticket Attachments]
 *     summary: Delete attachment
 *     description: Delete a ticket attachment
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
 *         description: Attachment deleted successfully
 *       404:
 *         description: Attachment not found
 */
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendErrorResponse(res, 'Attachment ID is required', 400);
    }

    // Verify attachment belongs to user's organization
    const attachment = await prisma.ticketAttachment.findFirst({
      where: {
        id,
        ticket: {
          organizationId: req.user!.organizationId
        }
      }
    });

    if (!attachment) {
      return sendErrorResponse(res, 'Attachment not found', 404);
    }

    // Delete file from storage
    try {
      const filePath = path.join(process.cwd(), attachment.fileUrl);
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Could not delete attachment from storage:', error);
    }

    // Delete attachment record
    await prisma.ticketAttachment.delete({ where: { id } });

    sendSuccessResponse(res, 'Attachment deleted successfully');

  } catch (error) {
    console.error('Delete attachment error:', error);
    sendErrorResponse(res, 'Failed to delete attachment');
  }
});

export default router;