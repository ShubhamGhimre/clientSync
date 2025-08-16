import { z } from 'zod';

// Common parameter schemas
export const IdParamSchema = z.object({
  id: z.string().min(1, 'ID is required')
});

export const UserIdParamSchema = z.object({
  userId: z.string().min(1, 'User ID is required')
});

export const ChatBotIdParamSchema = z.object({
  chatBotId: z.string().min(1, 'ChatBot ID is required')
});

export const TicketIdParamSchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required')
});

export const ChatRoomIdParamSchema = z.object({
  chatRoomId: z.string().min(1, 'Chat room ID is required')
});

export const CategoryIdParamSchema = z.object({
  categoryId: z.string().min(1, 'Category ID is required')
});

export const CommentIdParamSchema = z.object({
  commentId: z.string().min(1, 'Comment ID is required')
});

export const AttachmentIdParamSchema = z.object({
  attachmentId: z.string().min(1, 'Attachment ID is required')
});

export const FileIdParamSchema = z.object({
  fileId: z.string().min(1, 'File ID is required')
});

export const OrganizationIdParamSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required')
});

// Combined parameter schemas
export const UserTicketParamSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  ticketId: z.string().min(1, 'Ticket ID is required')
});

export const BotAccessParamSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  chatBotId: z.string().min(1, 'ChatBot ID is required')
});

export const TicketCommentParamSchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required'),
  commentId: z.string().min(1, 'Comment ID is required')
});