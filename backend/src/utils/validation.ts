import { z } from 'zod';

// Base schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10)
});

// Organization schemas
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

export const UpdateOrganizationSchema = z.object({
  companyName: z.string().min(2).optional(),
  contactEmail: z.string().email().optional()
});

// Authentication schemas
export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  subdomain: z.string().min(1, 'Subdomain is required')
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
  subdomain: z.string().min(1, 'Subdomain is required')
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Password must contain at least one letter and one number')
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Password must contain at least one letter and one number')
});

// User schemas
export const CreateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
  role: z.enum(['ADMIN', 'AGENT', 'VIEWER']).default('AGENT')
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'AGENT', 'VIEWER']).optional(),
  isActive: z.boolean().optional()
});

export const SearchUsersSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['ADMIN', 'AGENT', 'VIEWER']).optional(),
  isActive: z.boolean().optional(),
  ...PaginationSchema.shape
});

export const ResetUserPasswordSchema = z.object({
  newPassword: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Password must contain at least one letter and one number')
});

// Settings schemas
export const UpdateSettingsSchema = z.object({
  timezone: z.string()
    .regex(/^UTC[+-]\d{1,2}$/, 'Invalid timezone format. Use UTC+/-N format')
    .optional(),
  emailNotifications: z.boolean().optional(),
  browserNotifications: z.boolean().optional(),
  weeklyReports: z.boolean().optional(),
  apiKey: z.string().min(1).max(255).optional(),
  webhookUrl: z.string().url('Invalid webhook URL').optional(),
  twoFactorEnabled: z.boolean().optional(),
  sessionTimeoutMinutes: z.number()
    .min(5, 'Session timeout must be at least 5 minutes')
    .max(1440, 'Session timeout must be less than 24 hours')
    .optional()
});

// ChatBot schemas
export const CreateChatBotSchema = z.object({
  name: z.string().min(1, 'Bot name is required').max(100, 'Bot name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional()
});

export const UpdateChatBotSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional()
});

export const SearchChatBotsSchema = z.object({
  search: z.string().optional(),
  ...PaginationSchema.shape
});

// File schemas
export const FileUploadSchema = z.object({
  chatBotId: z.string().min(1, 'ChatBot ID is required')
});

export const FileQuerySchema = z.object({
  chatBotId: z.string().min(1, 'ChatBot ID is required'),
  ...PaginationSchema.shape
});

// ChatRoom schemas
export const CreateChatRoomSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  chatBotId: z.string().min(1, 'ChatBot ID is required')
});

export const UpdateChatRoomSchema = z.object({
  title: z.string().min(1).max(200).optional()
});

export const ChatRoomQuerySchema = z.object({
  chatBotId: z.string().optional(),
  ...PaginationSchema.shape
});

// Conversation schemas
export const SendMessageSchema = z.object({
  chatRoomId: z.string().min(1, 'Chat room ID is required'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message must be less than 2000 characters'),
  sender: z.string().min(1, 'Sender is required').max(100, 'Sender must be less than 100 characters')
});

export const ConversationQuerySchema = z.object({
  chatRoomId: z.string().min(1, 'Chat room ID is required'),
  ...PaginationSchema.shape
});

// BotAccess schemas
export const CreateBotAccessSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  chatBotId: z.string().min(1, 'ChatBot ID is required'),
  isBlocked: z.boolean().default(false)
});

export const UpdateBotAccessSchema = z.object({
  isBlocked: z.boolean()
});

export const BotAccessQuerySchema = z.object({
  chatBotId: z.string().optional(),
  userId: z.string().optional(),
  isBlocked: z.boolean().optional(),
  ...PaginationSchema.shape
});

// Support Ticket schemas
export const CreateSupportTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description must be less than 5000 characters'),
  customerName: z.string().min(1, 'Customer name is required').max(100, 'Customer name must be less than 100 characters'),
  customerEmail: z.string().email('Invalid email format'),
  customerPhone: z.string()
    .regex(/^[+]?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL']).default('MEDIUM'),
  categoryId: z.string().optional(),
  assignedAgentId: z.string().optional()
});

export const UpdateSupportTicketSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL']).optional(),
  categoryId: z.string().optional(),
  assignedAgentId: z.string().optional()
});

export const SupportTicketQuerySchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL']).optional(),
  assignedAgentId: z.string().optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  ...PaginationSchema.shape
});

// Ticket Category schemas
export const CreateTicketCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color (e.g., #FF5733)')
    .optional()
});

export const UpdateTicketCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  isActive: z.boolean().optional()
});

export const TicketCategoryQuerySchema = z.object({
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  ...PaginationSchema.shape
});

// Ticket Comment schemas
export const CreateTicketCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(2000, 'Comment must be less than 2000 characters'),
  isInternal: z.boolean().default(false)
});

export const UpdateTicketCommentSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
  isInternal: z.boolean().optional()
});

export const TicketCommentQuerySchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required'),
  isInternal: z.boolean().optional(),
  ...PaginationSchema.shape
});

// Ticket Attachment schemas
export const TicketAttachmentUploadSchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required')
});

export const TicketAttachmentQuerySchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required'),
  ...PaginationSchema.shape
});

// Analytics and Reports schemas
export const DateRangeBaseSchema = z.object({
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format')
});

export const DateRangeSchema = DateRangeBaseSchema.refine(
  data => new Date(data.startDate) < new Date(data.endDate),
  {
    message: 'Start date must be before end date'
  }
);

export const AnalyticsQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
  ...DateRangeBaseSchema.partial().shape
});

// Search schemas
export const GlobalSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100),
  type: z.enum(['tickets', 'users', 'chatbots', 'all']).default('all'),
  ...PaginationSchema.shape
});

// Bulk operation schemas
export const BulkUpdateTicketsSchema = z.object({
  ticketIds: z.array(z.string()).min(1, 'At least one ticket ID is required'),
  updates: z.object({
    status: z.enum(['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED', 'CANCELLED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL']).optional(),
    assignedAgentId: z.string().optional(),
    categoryId: z.string().optional()
  })
});

export const BulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one ID is required')
});

// Export operation schemas
export const ExportQuerySchema = z.object({
  format: z.enum(['csv', 'xlsx', 'pdf']).default('csv'),
  type: z.enum(['tickets', 'users', 'analytics']),
  filters: z.record(z.any()).optional(),
  dateRange: DateRangeSchema.optional()
});

// Notification schemas
export const NotificationPreferencesSchema = z.object({
  emailNotifications: z.object({
    newTickets: z.boolean().default(true),
    ticketUpdates: z.boolean().default(true),
    assignments: z.boolean().default(true),
    mentions: z.boolean().default(true)
  }).optional(),
  browserNotifications: z.object({
    newTickets: z.boolean().default(true),
    ticketUpdates: z.boolean().default(false),
    assignments: z.boolean().default(true),
    mentions: z.boolean().default(true)
  }).optional(),
  slackNotifications: z.object({
    enabled: z.boolean().default(false),
    webhookUrl: z.string().url().optional(),
    channels: z.array(z.string()).optional()
  }).optional()
});

// Webhook schemas
export const CreateWebhookSchema = z.object({
  name: z.string().min(1, 'Webhook name is required').max(100),
  url: z.string().url('Invalid webhook URL'),
  events: z.array(z.enum([
    'ticket.created',
    'ticket.updated',
    'ticket.resolved',
    'ticket.closed',
    'comment.added',
    'user.created',
    'user.updated'
  ])).min(1, 'At least one event must be selected'),
  isActive: z.boolean().default(true),
  secret: z.string().min(8, 'Secret must be at least 8 characters').optional()
});

export const UpdateWebhookSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  events: z.array(z.enum([
    'ticket.created',
    'ticket.updated',
    'ticket.resolved',
    'ticket.closed',
    'comment.added',
    'user.created',
    'user.updated'
  ])).min(1).optional(),
  isActive: z.boolean().optional(),
  secret: z.string().min(8).optional()
});

// API Key schemas
export const CreateApiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required').max(100),
  permissions: z.array(z.enum([
    'read:tickets',
    'write:tickets',
    'read:users',
    'write:users',
    'read:chatbots',
    'write:chatbots',
    'admin'
  ])).min(1, 'At least one permission must be granted'),
  expiresAt: z.string().datetime().optional()
});

export const UpdateApiKeySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  permissions: z.array(z.enum([
    'read:tickets',
    'write:tickets',
    'read:users',
    'write:users',
    'read:chatbots',
    'write:chatbots',
    'admin'
  ])).min(1).optional(),
  isActive: z.boolean().optional()
});

// Team schemas
export const CreateTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100),
  description: z.string().max(500).optional(),
  leaderId: z.string().min(1, 'Team leader is required'),
  memberIds: z.array(z.string()).optional()
});

export const UpdateTeamSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  leaderId: z.string().optional(),
  memberIds: z.array(z.string()).optional()
});

// Custom field schemas
export const CreateCustomFieldSchema = z.object({
  name: z.string().min(1, 'Field name is required').max(100),
  type: z.enum(['text', 'number', 'date', 'select', 'multiselect', 'checkbox']),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(), // For select/multiselect fields
  defaultValue: z.string().optional(),
  helpText: z.string().max(200).optional()
});

export const UpdateCustomFieldSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['text', 'number', 'date', 'select', 'multiselect', 'checkbox']).optional(),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  defaultValue: z.string().optional(),
  helpText: z.string().max(200).optional(),
  isActive: z.boolean().optional()
});

// SLA schemas
export const CreateSLASchema = z.object({
  name: z.string().min(1, 'SLA name is required').max(100),
  description: z.string().max(500).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL']),
  responseTimeHours: z.number().min(1, 'Response time must be at least 1 hour'),
  resolutionTimeHours: z.number().min(1, 'Resolution time must be at least 1 hour'),
  businessHoursOnly: z.boolean().default(true),
  isActive: z.boolean().default(true)
});

export const UpdateSLASchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL']).optional(),
  responseTimeHours: z.number().min(1).optional(),
  resolutionTimeHours: z.number().min(1).optional(),
  businessHoursOnly: z.boolean().optional(),
  isActive: z.boolean().optional()
});

// Validation helper functions
export const validateIds = (ids: string[]) => {
  return z.array(z.string().min(1)).parse(ids);
};

export const validateEmail = (email: string) => {
  return z.string().email().parse(email);
};

export const validatePassword = (password: string) => {
  return z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Password must contain at least one letter and one number')
    .parse(password);
};

export const validateFileSize = (size: number, maxSizeMB: number = 25) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (size > maxSizeBytes) {
    throw new Error(`File size must be less than ${maxSizeMB}MB`);
  }
  return true;
};

export const validateFileType = (filename: string, allowedTypes: string[]) => {
  const ext = filename.toLowerCase().split('.').pop();
  if (!ext || !allowedTypes.includes(`.${ext}`)) {
    throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  return true;
};

// Environment validation
export const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().url('Invalid database URL'),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(15).default(12),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.coerce.number().optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  REDIS_URL: z.string().optional(),
  SENTRY_DSN: z.string().optional()
});

export type EnvironmentConfig = z.infer<typeof EnvironmentSchema>;