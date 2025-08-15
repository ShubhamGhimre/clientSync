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
  email: z.string().email().optional()
});

export const CreateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
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
  ...PaginationSchema.shape
});

export const SearchChatBotsSchema = z.object({
  search: z.string().optional(),
  ...PaginationSchema.shape
});