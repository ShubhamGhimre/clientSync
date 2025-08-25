export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Organization Types
export interface Organization {
  id: string;
  name: string;
  subdomain: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    chatBots: number;
    supportTickets: number;
  };
}

export interface CreateOrganizationRequest {
  name: string;
  subdomain: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  subdomain?: string;
}

// User Types
export interface User {
  id: string;
  name: string; 
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId?: string;
  organization?: {
    id: string;
    name: string;
    subdomain: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'USER';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'ADMIN' | 'USER';
}

// ChatBot Types
export interface ChatBot {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  isKnowledgeInitialized: boolean;
  totalChunks?: number;
  lastKnowledgeUpdate?: string;
  createdAt: string;
  updatedAt: string;
  organization?: Organization;
  _count?: {
    chatRooms: number;
    files: number;
  };
}

export interface CreateChatBotRequest {
  name: string;
  description?: string;
}

export interface UpdateChatBotRequest {
  name?: string;
  description?: string;
}

// ChatRoom Types
export interface ChatRoom {
  id: string;
  title: string;
  description?: string;
  chatBotId: string;
  createdAt: string;
  updatedAt: string;
  chatBot?: ChatBot;
  _count?: {
    conversations: number;
  };
}

export interface CreateChatRoomRequest {
  title: string;
  description?: string;
  chatBotId: string;
}

export interface UpdateChatRoomRequest {
  title?: string;
  description?: string;
}

// Conversation Types
export interface Conversation {
  id: string;
  chatRoomId: string;
  sender: string;
  fromUserId?: string;
  message: string;
  createdAt: string;
  fromUser?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SendMessageRequest {
  chatRoomId: string;
  message: string;
  sender: string;
  userId?: string;
}

// File Types
export interface File {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  chatBotId: string;
  processed: boolean;
  uploadedAt: string;
  chatBot?: ChatBot;
}

// Support Ticket Types
export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  organizationId: string;
  createdById: string;
  assignedToId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  assignedTo?: User;
  organization?: Organization;
  _count?: {
    attachments: number;
  };
}

export interface CreateSupportTicketRequest {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface UpdateSupportTicketRequest {
  title?: string;
  description?: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedToId?: string;
}

// Ticket Attachment Types
export interface TicketAttachment {
  id: string;
  ticketId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  ticket?: SupportTicket;
}

// Settings Types
export interface Settings {
  id: string;
  organizationId: string;
  allowUserRegistration: boolean;
  maxChatbotsPerUser: number;
  maxFilesPerChatbot: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  customBranding: boolean;
  customDomain?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsRequest {
  allowUserRegistration?: boolean;
  maxChatbotsPerUser?: number;
  maxFilesPerChatbot?: number;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  customBranding?: boolean;
  customDomain?: string;
}

// Bot Access Types
export interface BotAccess {
  id: string;
  userId: string;
  chatBotId: string;
  accessLevel: 'READ' | 'WRITE' | 'ADMIN';
  createdAt: string;
  user?: User;
  chatBot?: ChatBot;
}

export interface CreateBotAccessRequest {
  userId: string;
  chatBotId: string;
  accessLevel: 'READ' | 'WRITE' | 'ADMIN';
}

export interface UpdateBotAccessRequest {
  accessLevel: 'READ' | 'WRITE' | 'ADMIN';
}

// RAG Types
export interface RAGChatRequest {
  chatRoomId: string;
  message: string;
  sender: string;
  userId?: string;
}

export interface RAGChatResponse {
  response: string;
  message: string;
  processingType?: string;
}

export interface KnowledgeInitializationRequest {
  chatBotId: string;
}

export interface KnowledgeInitializationResponse {
  message: string;
  jobId?: string;
}

export interface KnowledgeBaseProgressResponse {
  status: 'processing' | 'completed' | 'failed';
  progress?: number;
  message: string;
  totalFiles: number;
  processedFiles: number;
  totalChunks: number;
  processedChunks: number;
  currentFile?: string;
  embeddingType?: string;
  timeElapsed?: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  contactEmail: string;
  password: string;
  companyName: string;
  email: string;
  subdomain: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}