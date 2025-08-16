import { z } from 'zod';

export const RegisterOrganizationSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  contactEmail: z.string().email('Invalid email format'),
  subdomain: z.string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(30, 'Subdomain must be less than 30 characters')
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens')
    .refine(val => !val.startsWith('-') && !val.endsWith('-'), 'Subdomain cannot start or end with hyphens'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Password must contain at least one letter and one number')
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  subdomain: z.string().min(1, 'Subdomain is required')
});

export const CreateChatBotSchema = z.object({
  name: z.string().min(1, 'Bot name is required'),
  description: z.string().optional()
});

export const UpdateOrganizationSchema = z.object({
  companyName: z.string().min(2).optional(),
  contactEmail: z.string().email().optional()
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'AGENT', 'VIEWER']).optional(),
  isActive: z.boolean().optional()
});

export const CreateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
  role: z.enum(['ADMIN', 'AGENT', 'VIEWER']).default('AGENT')
});

export const UpdateChatBotSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional()
});

export const CreateChatRoomSchema = z.object({
  chatBotId: z.string().min(1, 'ChatBot ID is required'),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional()
});

export const SendMessageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  isFromCustomer: z.boolean().default(true)
});

// Pagination schema
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10)
});

// Query schemas
export const SearchUsersSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['ADMIN', 'AGENT', 'VIEWER']).optional(),
  isActive: z.boolean().optional(),
  ...PaginationSchema.shape
});

export const SearchChatBotsSchema = z.object({
  search: z.string().optional(),
  ...PaginationSchema.shape
});

// Support Ticket Schemas
export const CreateSupportTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Invalid email format'),
  customerPhone: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL']).default('MEDIUM'),
  categoryId: z.string().optional(),
  assignedAgentId: z.string().optional()
});

export const UpdateSupportTicketSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL']).optional(),
  categoryId: z.string().optional(),
  assignedAgentId: z.string().optional()
});

export const CreateTicketCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').optional()
});

export const CreateTicketCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required'),
  isInternal: z.boolean().default(false)
});

export const SupportTicketQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL']).optional(),
  assignedAgentId: z.string().optional(),
  categoryId: z.string().optional(),
  search: z.string().optional()
});