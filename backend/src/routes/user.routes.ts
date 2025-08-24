import express from 'express';
import { authenticateToken, type AuthRequest } from '../middleware/auth.middleware.js';
import { 
  CreateUserSchema, 
  UpdateUserSchema,
  SearchUsersSchema,
  PaginationSchema 
} from '../utils/validation.js';
import { 
  createPaginationResponse, 
  sendSuccessResponse, 
  sendErrorResponse 
} from '../utils/helpers.js';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ⚠️ IMPORTANT: Put specific routes BEFORE parameterized routes

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     tags: [Users]
 *     summary: Get user statistics
 *     description: Get statistics about users in the organization
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 */
router.get('/stats', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    console.log('📊 Getting user stats for organization:', req.user!.organizationId);
    
    const organizationId = req.user!.organizationId;

    const [total, active, roleStats, recentUsers] = await Promise.all([
      prisma.user.count({ 
        where: { organizationId } 
      }),
      prisma.user.count({ 
        where: { organizationId, isActive: true } 
      }),
      prisma.user.groupBy({
        by: ['role'],
        where: { organizationId, isActive: true },
        _count: { role: true }
      }),
      prisma.user.findMany({
        where: { organizationId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true
        }
      })
    ]);

    // Initialize byRole with all possible roles
    const byRole = {
      ADMIN: 0,
      AGENT: 0,
      VIEWER: 0
    };

    // Populate with actual counts
    roleStats.forEach(item => {
      byRole[item.role as keyof typeof byRole] = item._count.role;
    });

    const stats = {
      total,
      active,
      inactive: total - active,
      byRole,
      recentlyJoined: recentUsers
    };

    console.log('✅ User stats retrieved:', stats);

    sendSuccessResponse(res, 'User statistics retrieved successfully', stats);

  } catch (error) {
    console.error('❌ Get user stats error:', error);
    sendErrorResponse(res, 'Failed to get user statistics');
  }
});

/**
 * @swagger
 * /api/users/agents:
 *   get:
 *     tags: [Users]
 *     summary: Get all agents
 *     description: Get all active agents and admins in the organization for assignment purposes
 *     security:
 *       - BearerAuth: []
 */
router.get('/agents', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    console.log('👥 Getting agents for organization:', req.user!.organizationId);
    
    const agents = await prisma.user.findMany({
      where: {
        organizationId: req.user!.organizationId,
        isActive: true,
        role: { in: ['ADMIN', 'AGENT'] }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true
      },
      orderBy: [
        { role: 'asc' }, // ADMIN first, then AGENT
        { firstName: 'asc' }
      ]
    });

    console.log('✅ Agents retrieved:', agents.length);

    sendSuccessResponse(res, 'Agents retrieved successfully', agents);

  } catch (error) {
    console.error('❌ Get agents error:', error);
    sendErrorResponse(res, 'Failed to get agents');
  }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users in organization
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const { page, limit, search, role, isActive } = SearchUsersSchema.parse({
      ...req.query,
      role: req.query.role as string,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined
    });

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      organizationId: req.user!.organizationId
    };

    if (role) where.role = role;
    if (typeof isActive === 'boolean') where.isActive = isActive;

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          organizationId: true,
          _count: {
            select: {
              assignedTickets: true,
              createdTickets: true,
              ticketComments: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    const paginationResult = createPaginationResponse(users, total, { page, limit });

    res.json({
      success: true,
      ...paginationResult
    });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendErrorResponse(res, 'Invalid query parameters', 400, error.errors);
    }

    console.error('Get users error:', error);
    sendErrorResponse(res, 'Failed to get users');
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Create new user
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    // Check if user is admin
    if (req.user!.role !== 'ADMIN') {
      return sendErrorResponse(res, 'Only admins can create users', 403);
    }

    const validatedData = CreateUserSchema.parse(req.body);
    const { role = 'AGENT' } = req.body;

    // Check if email already exists in the organization
    const existingUser = await prisma.user.findFirst({
      where: {
        email: validatedData.email,
        organizationId: req.user!.organizationId
      }
    });

    if (existingUser) {
      return sendErrorResponse(res, 'User with this email already exists in your organization', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    const user = await prisma.user.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        password: hashedPassword,
        role: role as 'ADMIN' | 'AGENT' | 'VIEWER',
        organizationId: req.user!.organizationId
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        organizationId: true
      }
    });

    sendSuccessResponse(res, 'User created successfully', user, 201);

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendErrorResponse(res, 'Validation failed', 400, error.errors);
    }

    if (error.code === 'P2002') {
      return sendErrorResponse(res, 'User with this email already exists', 400);
    }

    console.error('Create user error:', error);
    sendErrorResponse(res, 'Failed to create user');
  }
});

// ⚠️ IMPORTANT: Put parameterized routes AFTER specific routes

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 */
router.get('/:id', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendErrorResponse(res, 'User ID is required', 400);
    }

    console.log('👤 Getting user by ID:', id, 'for organization:', req.user!.organizationId);

    const user = await prisma.user.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        organizationId: true,
        _count: {
          select: {
            assignedTickets: {
              where: { status: { in: ['OPEN', 'IN_PROGRESS'] } }
            },
            createdTickets: true,
            ticketComments: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ User not found:', id);
      return sendErrorResponse(res, 'User not found', 404);
    }

    console.log('✅ User found:', user.email);
    sendSuccessResponse(res, 'User retrieved successfully', user);

  } catch (error) {
    console.error('❌ Get user error:', error);
    sendErrorResponse(res, 'Failed to get user');
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user
 */
router.put('/:id', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const { role, isActive, ...basicFields } = req.body;

    if (!id) {
      return sendErrorResponse(res, 'User ID is required', 400);
    }

    // Check if user exists and belongs to organization
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId
      }
    });

    if (!existingUser) {
      return sendErrorResponse(res, 'User not found', 404);
    }

    // Check permissions
    const isAdmin = req.user!.role === 'ADMIN';
    const isSelf = req.user!.id === id;

    if (!isAdmin && !isSelf) {
      return sendErrorResponse(res, 'You can only update your own profile', 403);
    }

    // Validate basic fields
    const validatedBasicData = UpdateUserSchema.parse(basicFields);

    // Prepare update data
    const updateData: any = { ...validatedBasicData };

    // Only admins can update role and active status
    if (isAdmin) {
      if (role !== undefined) updateData.role = role;
      if (typeof isActive === 'boolean') updateData.isActive = isActive;
    }

    // Check if email is being changed and if it already exists
    if (validatedBasicData.email && validatedBasicData.email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: validatedBasicData.email,
          organizationId: req.user!.organizationId,
          id: { not: id }
        }
      });

      if (emailExists) {
        return sendErrorResponse(res, 'User with this email already exists in your organization', 400);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        organizationId: true
      }
    });

    sendSuccessResponse(res, 'User updated successfully', updatedUser);

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendErrorResponse(res, 'Validation failed', 400, error.errors);
    }

    if (error.code === 'P2002') {
      return sendErrorResponse(res, 'User with this email already exists', 400);
    }

    console.error('Update user error:', error);
    sendErrorResponse(res, 'Failed to update user');
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user
 */
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;

    // Check if user is admin
    if (req.user!.role !== 'ADMIN') {
      return sendErrorResponse(res, 'Only admins can delete users', 403);
    }

    // Check if trying to delete self
    if (req.user!.id === id) {
      return sendErrorResponse(res, 'You cannot delete your own account', 400);
    }

    if (!id) {
      return sendErrorResponse(res, 'User ID is required', 400);
    }

    // Check if user exists and belongs to organization
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId
      }
    });

    if (!existingUser) {
      return sendErrorResponse(res, 'User not found', 404);
    }

    // Instead of hard delete, we'll deactivate the user to preserve data integrity
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });

    sendSuccessResponse(res, 'User deactivated successfully');

  } catch (error) {
    console.error('Delete user error:', error);
    sendErrorResponse(res, 'Failed to delete user');
  }
});

/**
 * @swagger
 * /api/users/{id}/reset-password:
 *   post:
 *     tags: [Users]
 *     summary: Reset user password
 */
router.post('/:id/reset-password', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    // Check if user is admin
    if (req.user!.role !== 'ADMIN') {
      return sendErrorResponse(res, 'Only admins can reset user passwords', 403);
    }

    // Validate password
    if (!newPassword || newPassword.length < 6) {
      return sendErrorResponse(res, 'Password must be at least 6 characters long', 400);
    }

    if (!id) {
      return sendErrorResponse(res, 'User ID is required', 400);
    }

    // Check if user exists and belongs to organization
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId
      }
    });

    if (!existingUser) {
      return sendErrorResponse(res, 'User not found', 404);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    sendSuccessResponse(res, 'Password reset successfully');

  } catch (error) {
    console.error('Reset password error:', error);
    sendErrorResponse(res, 'Failed to reset password');
  }
});

export default router;