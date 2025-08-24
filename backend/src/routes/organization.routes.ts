import express from 'express';
import { authenticateToken, type AuthRequest } from '../middleware/auth.middleware.js';
import { UpdateOrganizationSchema } from '../utils/validation.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/organizations:
 *   get:
 *     tags: [Organizations]
 *     summary: Get organization details
 *     description: Retrieve the authenticated user's organization information including settings and counts
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Organization details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         subdomain:
 *                           type: string
 *                         companyName:
 *                           type: string
 *                         contactEmail:
 *                           type: string
 *                         settings:
 *                           type: object
 *                         _count:
 *                           type: object
 *                           properties:
 *                             users:
 *                               type: integer
 *                             chatBots:
 *                               type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: req.user!.organizationId },
      include: {
        settings: true,
        _count: {
          select: {
            users: true,
            chatBots: true
          }
        }
      }
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.json({
      success: true,
      data: organization
    });

  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get organization'
    });
  }
});

/**
 * @swagger
 * /api/organizations:
 *   put:
 *     tags: [Organizations]
 *     summary: Update organization
 *     description: Update the authenticated user's organization information
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *                 example: 'Updated Company Name'
 *               contactEmail:
 *                 type: string
 *                 example: 'newcontact@company.com'
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Organization'
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
router.put('/', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const validatedData = UpdateOrganizationSchema.parse(req.body);

    const updateData: any = {};
    if (validatedData.companyName !== undefined) {
      updateData.companyName = { set: validatedData.companyName };
    }
    if (validatedData.contactEmail !== undefined) {
      updateData.contactEmail = { set: validatedData.contactEmail };
    }

    const updatedOrganization = await prisma.organization.update({
      where: { id: req.user!.organizationId },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: updatedOrganization
    });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      });
    }

    console.error('Update organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update organization'
    });
  }
});

/**
 * @swagger
 * /api/organizations/users:
 *   get:
 *     tags: [Organizations]
 *     summary: Get organization users
 *     description: Retrieve all users belonging to the authenticated user's organization
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                           - $ref: '#/components/schemas/User'
 *                           - type: object
 *                             properties:
 *                               botAccess:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/users', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { organizationId: req.user!.organizationId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        botAccess: {
          include: {
            chatBot: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
});



export default router;