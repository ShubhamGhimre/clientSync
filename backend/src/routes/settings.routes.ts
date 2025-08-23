import express from 'express';
import { authenticateToken, type AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/helpers.js';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const UpdateSettingsSchema = z.object({
  timezone: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  browserNotifications: z.boolean().optional(),
  weeklyReports: z.boolean().optional(),
  apiKey: z.string().optional(),
  webhookUrl: z.string().url().optional(),
  twoFactorEnabled: z.boolean().optional(),
  sessionTimeoutMinutes: z.number().min(5).max(1440).optional()
});

/**
 * @swagger
 * /api/settings:
 *   get:
 *     tags: [Settings]
 *     summary: Get organization settings
 *     description: Retrieve settings for the authenticated user's organization
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *       404:
 *         description: Settings not found
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const settings = await prisma.settings.findUnique({
      where: { organizationId: req.user!.organizationId }
    });

    if (!settings) {
      // Create default settings if they don't exist
      const newSettings = await prisma.settings.create({
        data: { organizationId: req.user!.organizationId }
      });
      return sendSuccessResponse(res, 'Settings retrieved successfully', newSettings);
    }

    sendSuccessResponse(res, 'Settings retrieved successfully', settings);

  } catch (error) {
    console.error('Get settings error:', error);
    sendErrorResponse(res, 'Failed to get settings');
  }
});

/**
 * @swagger
 * /api/settings:
 *   put:
 *     tags: [Settings]
 *     summary: Update organization settings
 *     description: Update settings for the authenticated user's organization (Admin only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timezone:
 *                 type: string
 *                 example: 'UTC-5'
 *               emailNotifications:
 *                 type: boolean
 *               browserNotifications:
 *                 type: boolean
 *               weeklyReports:
 *                 type: boolean
 *               apiKey:
 *                 type: string
 *               webhookUrl:
 *                 type: string
 *               twoFactorEnabled:
 *                 type: boolean
 *               sessionTimeoutMinutes:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       403:
 *         description: Insufficient permissions
 */
router.put('/', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    // Check if user is admin
    if (req.user!.role !== 'ADMIN') {
      return sendErrorResponse(res, 'Only admins can update settings', 403);
    }

    const validatedData = UpdateSettingsSchema.parse(req.body);

    // Build update object only with defined fields
    const updateData: any = {};
    if (validatedData.timezone !== undefined) updateData.timezone = validatedData.timezone;
    if (validatedData.emailNotifications !== undefined) updateData.emailNotifications = validatedData.emailNotifications;
    if (validatedData.browserNotifications !== undefined) updateData.browserNotifications = validatedData.browserNotifications;
    if (validatedData.weeklyReports !== undefined) updateData.weeklyReports = validatedData.weeklyReports;
    if (validatedData.apiKey !== undefined) updateData.apiKey = validatedData.apiKey;
    if (validatedData.webhookUrl !== undefined) updateData.webhookUrl = validatedData.webhookUrl;
    if (validatedData.twoFactorEnabled !== undefined) updateData.twoFactorEnabled = validatedData.twoFactorEnabled;
    if (validatedData.sessionTimeoutMinutes !== undefined) updateData.sessionTimeoutMinutes = validatedData.sessionTimeoutMinutes;

    const settings = await prisma.settings.upsert({
      where: { organizationId: req.user!.organizationId },
      update: updateData,
      create: {
        organizationId: req.user!.organizationId,
        timezone: validatedData.timezone ?? null,
        ...(validatedData.emailNotifications !== undefined && { emailNotifications: validatedData.emailNotifications }),
        ...(validatedData.browserNotifications !== undefined && { browserNotifications: validatedData.browserNotifications }),
        ...(validatedData.weeklyReports !== undefined && { weeklyReports: validatedData.weeklyReports }),
        apiKey: validatedData.apiKey ?? null,
        webhookUrl: validatedData.webhookUrl ?? null,
        ...(validatedData.twoFactorEnabled !== undefined && { twoFactorEnabled: validatedData.twoFactorEnabled }),
        ...(validatedData.sessionTimeoutMinutes !== undefined && { sessionTimeoutMinutes: validatedData.sessionTimeoutMinutes })
      }
    });

    sendSuccessResponse(res, 'Settings updated successfully', settings);

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendErrorResponse(res, 'Validation failed', 400, error.errors);
    }

    console.error('Update settings error:', error);
    sendErrorResponse(res, 'Failed to update settings');
  }
});

export default router;