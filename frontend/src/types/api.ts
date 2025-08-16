export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
  subdomain: string;
}

export interface RegisterRequest {
  companyName: string;
  contactEmail: string;
  subdomain: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface CreateChatBotRequest {
  name: string;
  description?: string;
}

export interface ChatBot {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    chatRooms: number;
    files: number;
  };
}

// Support Ticket Types
export interface SupportTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  category?: TicketCategory;
  assignedAgent?: User;
  createdBy?: User;
  comments?: TicketComment[];
  attachments?: TicketAttachment[];
}

export interface CreateSupportTicketRequest {
  title: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  priority: TicketPriority;
  categoryId?: string;
  assignedAgentId?: string;
}

export interface UpdateSupportTicketRequest {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  categoryId?: string;
  assignedAgentId?: string;
}

export interface TicketCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketCategoryRequest {
  name: string;
  description?: string;
  color?: string;
}

export interface TicketComment {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
  author: User;
}

export interface CreateTicketCommentRequest {
  content: string;
  isInternal?: boolean;
}

export interface TicketAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt: string;
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_CUSTOMER = 'PENDING_CUSTOMER',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  VIEWER = 'VIEWER'
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}