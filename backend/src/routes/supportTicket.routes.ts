import express from 'express';
import {
    CreateSupportTicketSchema,
    UpdateSupportTicketSchema,
    CreateTicketCategorySchema,
    CreateTicketCommentSchema,
    SupportTicketQuerySchema
} from '../utils/validation.js';
import { authenticateToken, type AuthRequest } from '../middleware/auth.middleware.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/support-tickets/categories:
 *   get:
 *     tags: [Support Tickets]
 *     summary: Get ticket categories
 *     description: Retrieve all ticket categories for the organization
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Ticket categories retrieved successfully
 */
router.get('/categories', authenticateToken, async (req: AuthRequest, res: express.Response) => {
    try {
        const categories = await prisma.ticketCategory.findMany({
            where: {
                organizationId: req.user!.organizationId,
                isActive: true
            },
            orderBy: { name: 'asc' }
        });

        res.json({
            success: true,
            data: categories
        });

    } catch (error) {
        console.error('Get ticket categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get ticket categories'
        });
    }
});

/**
 * @swagger
 * /api/support-tickets/categories:
 *   post:
 *     tags: [Support Tickets]
 *     summary: Create ticket category
 *     description: Create a new ticket category for the organization
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: 'Technical Support'
 *               description:
 *                 type: string
 *                 example: 'Technical issues and bugs'
 *               color:
 *                 type: string
 *                 example: '#FF5733'
 *     responses:
 *       201:
 *         description: Ticket category created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 */
router.post('/categories', authenticateToken, async (req: AuthRequest, res: express.Response) => {
    try {
        const validatedData = CreateTicketCategorySchema.parse(req.body);

        const category = await prisma.ticketCategory.create({
            data: {
                ...validatedData,
                description: validatedData.description ?? null,
                color: validatedData.color ?? null,
                organizationId: req.user!.organizationId
            }
        });

        res.status(201).json({
            success: true,
            message: 'Ticket category created successfully',
            data: category
        });

    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.errors
            });
        }

        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: 'Category name already exists'
            });
        }

        console.error('Create ticket category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create ticket category'
        });
    }
});

/**
 * @swagger
 * /api/support-tickets/stats:
 *   get:
 *     tags: [Support Tickets]
 *     summary: Get ticket statistics
 *     description: Get statistics for support tickets (counts by status, priority, etc.)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Ticket statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     byStatus:
 *                       type: object
 *                     byPriority:
 *                       type: object
 *                     recent:
 *                       type: array
 */
router.get('/stats', authenticateToken, async (req: AuthRequest, res: express.Response) => {
    try {
        const organizationId = req.user!.organizationId;

        // Get ticket counts by status
        const statusStats = await prisma.supportTicket.groupBy({
            by: ['status'],
            where: { organizationId },
            _count: { status: true }
        });

        // Get ticket counts by priority
        const priorityStats = await prisma.supportTicket.groupBy({
            by: ['priority'],
            where: { organizationId },
            _count: { priority: true }
        });

        // Get total count
        const total = await prisma.supportTicket.count({
            where: { organizationId }
        });

        // Get recent tickets
        const recent = await prisma.supportTicket.findMany({
            where: { organizationId },
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                ticketNumber: true,
                title: true,
                status: true,
                priority: true,
                customerName: true,
                createdAt: true
            }
        });

        // Format the stats
        const byStatus = statusStats.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
        }, {} as Record<string, number>);

        const byPriority = priorityStats.reduce((acc, item) => {
            acc[item.priority] = item._count.priority;
            return acc;
        }, {} as Record<string, number>);

        res.json({
            success: true,
            data: {
                total,
                byStatus,
                byPriority,
                recent
            }
        });

    } catch (error) {
        console.error('Get ticket stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get ticket statistics'
        });
    }
});

/**
 * @swagger
 * /api/support-tickets:
 *   get:
 *     tags: [Support Tickets]
 *     summary: Get all support tickets
 *     description: Retrieve paginated support tickets for the authenticated user's organization
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of tickets per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, IN_PROGRESS, PENDING_CUSTOMER, RESOLVED, CLOSED, CANCELLED]
 *         description: Filter by ticket status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT, CRITICAL]
 *         description: Filter by ticket priority
 *       - in: query
 *         name: assignedAgentId
 *         schema:
 *           type: string
 *         description: Filter by assigned agent ID
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, customer name or email
 *     responses:
 *       200:
 *         description: Support tickets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SupportTicket'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: express.Response) => {
    try {
        const query = SupportTicketQuerySchema.parse(req.query);
        const { page, limit, status, priority, assignedAgentId, categoryId, search } = query;

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {
            organizationId: req.user!.organizationId
        };

        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (assignedAgentId) where.assignedAgentId = assignedAgentId;
        if (categoryId) where.categoryId = categoryId;

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { customerName: { contains: search, mode: 'insensitive' } },
                { customerEmail: { contains: search, mode: 'insensitive' } },
                { ticketNumber: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [tickets, total] = await Promise.all([
            prisma.supportTicket.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    category: true,
                    assignedAgent: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            role: true
                        }
                    },
                    createdBy: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            role: true
                        }
                    },
                    _count: {
                        select: {
                            comments: true,
                            attachments: true
                        }
                    }
                }
            }),
            prisma.supportTicket.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: tickets,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });

    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid query parameters',
                errors: error.errors
            });
        }

        console.error('Get support tickets error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get support tickets'
        });
    }
});

/**
 * @swagger
 * /api/support-tickets:
 *   post:
 *     tags: [Support Tickets]
 *     summary: Create new support ticket
 *     description: Create a new support ticket for the authenticated user's organization
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - customerName
 *               - customerEmail
 *             properties:
 *               title:
 *                 type: string
 *                 example: 'Website login issue'
 *               description:
 *                 type: string
 *                 example: 'Customer unable to login to their account'
 *               customerName:
 *                 type: string
 *                 example: 'John Doe'
 *               customerEmail:
 *                 type: string
 *                 example: 'john.doe@example.com'
 *               customerPhone:
 *                 type: string
 *                 example: '+1234567890'
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT, CRITICAL]
 *                 default: MEDIUM
 *               categoryId:
 *                 type: string
 *               assignedAgentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Support ticket created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: express.Response) => {
    try {
        const validatedData = CreateSupportTicketSchema.parse(req.body);

        // Generate unique ticket number
        const ticketCount = await prisma.supportTicket.count({
            where: { organizationId: req.user!.organizationId }
        });
        const ticketNumber = `TKT-${(ticketCount + 1).toString().padStart(6, '0')}`;

        const ticket = await prisma.supportTicket.create({
            data: {
                title: validatedData.title,
                description: validatedData.description,
                customerName: validatedData.customerName,
                customerEmail: validatedData.customerEmail,
                customerPhone: validatedData.customerPhone || null,
                priority: validatedData.priority || 'MEDIUM',
                categoryId: validatedData.categoryId || null,
                assignedAgentId: validatedData.assignedAgentId || null,
                ticketNumber,
                organizationId: req.user!.organizationId,
                createdById: req.user!.id
            },
            include: {
                category: true,
                assignedAgent: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Support ticket created successfully',
            data: ticket
        });

    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.errors
            });
        }

        console.error('Create support ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create support ticket'
        });
    }
});

/**
 * @swagger
 * /api/support-tickets/{id}:
 *   get:
 *     tags: [Support Tickets]
 *     summary: Get support ticket by ID
 *     description: Retrieve a specific support ticket with comments and attachments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The support ticket ID
 *     responses:
 *       200:
 *         description: Support ticket retrieved successfully
 *       404:
 *         description: Support ticket not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authenticateToken, async (req: AuthRequest, res: express.Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Ticket ID is required'
            });
        }

        const ticket = await prisma.supportTicket.findFirst({
            where: {
                id,
                organizationId: req.user!.organizationId
            },
            include: {
                category: true,
                assignedAgent: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true
                    }
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                role: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                },
                attachments: true
            }
        });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Support ticket not found'
            });
        }

        res.json({
            success: true,
            data: ticket
        });

    } catch (error) {
        console.error('Get support ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get support ticket'
        });
    }
});

/**
 * @swagger
 * /api/support-tickets/{id}:
 *   put:
 *     tags: [Support Tickets]
 *     summary: Update support ticket
 *     description: Update a support ticket's details
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The support ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [OPEN, IN_PROGRESS, PENDING_CUSTOMER, RESOLVED, CLOSED, CANCELLED]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT, CRITICAL]
 *               categoryId:
 *                 type: string
 *               assignedAgentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Support ticket updated successfully
 *       404:
 *         description: Support ticket not found
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', authenticateToken, async (req: AuthRequest, res: express.Response) => {
    try {
        const { id } = req.params;
        const validatedData = UpdateSupportTicketSchema.parse(req.body);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Ticket ID is required'
            });
        }



        // Check if ticket exists and belongs to organization
        const existingTicket = await prisma.supportTicket.findFirst({
            where: {
                id,
                organizationId: req.user!.organizationId
            }
        });

        if (!existingTicket) {
            return res.status(404).json({
                success: false,
                message: 'Support ticket not found'
            });
        }

        // Set timestamps based on status changes
        const updateData: any = { ...validatedData };

        if (validatedData.status) {
            if (validatedData.status === 'RESOLVED' && existingTicket.status !== 'RESOLVED') {
                updateData.resolvedAt = new Date();
            }
            if (validatedData.status === 'CLOSED' && existingTicket.status !== 'CLOSED') {
                updateData.closedAt = new Date();
            }
        }

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Ticket ID is required'
            });
        }

        const updatedTicket = await prisma.supportTicket.update({
            where: { id: id as string },
            data: updateData,
            include: {
                category: true,
                assignedAgent: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        res.json({
            success: true,
            message: 'Support ticket updated successfully',
            data: updatedTicket
        });

    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.errors
            });
        }

        console.error('Update support ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update support ticket'
        });
    }
});

/**
 * @swagger
 * /api/support-tickets/{id}:
 *   delete:
 *     tags: [Support Tickets]
 *     summary: Delete support ticket
 *     description: Delete a support ticket (only for admins)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The support ticket ID
 *     responses:
 *       200:
 *         description: Support ticket deleted successfully
 *       404:
 *         description: Support ticket not found
 *       403:
 *         description: Insufficient permissions
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: express.Response) => {
    try {
        const { id } = req.params;

        // Check if user is admin
        if (req.user!.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can delete support tickets'
            });
        }

        if(!id) {
            return res.status(400).json({
                success: false,
                message: 'Ticket ID is required'
            });
        }

        // Check if ticket exists and belongs to organization
        const existingTicket = await prisma.supportTicket.findFirst({
            where: {
                id,
                organizationId: req.user!.organizationId
            }
        });

        if (!existingTicket) {
            return res.status(404).json({
                success: false,
                message: 'Support ticket not found'
            });
        }

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Ticket ID is required'
            });
        }

        await prisma.supportTicket.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Support ticket deleted successfully'
        });

    } catch (error) {
        console.error('Delete support ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete support ticket'
        });
    }
});

/**
 * @swagger
 * /api/support-tickets/{id}/comments:
 *   post:
 *     tags: [Support Tickets]
 *     summary: Add comment to support ticket
 *     description: Add a comment to a support ticket
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The support ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: 'This issue has been resolved by updating the password'
 *               isInternal:
 *                 type: boolean
 *                 default: false
 *                 example: false
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       404:
 *         description: Support ticket not found
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/comments', authenticateToken, async (req: AuthRequest, res: express.Response) => {
    try {
        const { id } = req.params;
        const validatedData = CreateTicketCommentSchema.parse(req.body);

        // Check if ticket exists and belongs to organization
        const whereClause: any = {
            organizationId: req.user!.organizationId
        };
        if (id) {
            whereClause.id = id;
        }

        const ticket = await prisma.supportTicket.findFirst({
            where: whereClause
        });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Support ticket not found'
            });
        }

        const comment = await prisma.ticketComment.create({
            data: {
                content: validatedData.content,
                isInternal: validatedData.isInternal || false,
                ticketId: id as string,
                authorId: req.user!.id
            },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: comment
        });

    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.errors
            });
        }

        console.error('Add ticket comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add comment'
        });
    }
});

export default router;