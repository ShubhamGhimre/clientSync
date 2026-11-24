import { z } from 'zod';
export declare const PaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare const RegisterOrganizationSchema: z.ZodObject<{
    companyName: z.ZodString;
    contactEmail: z.ZodString;
    subdomain: z.ZodEffects<z.ZodString, string, string>;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    companyName: string;
    contactEmail: string;
    subdomain: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}, {
    companyName: string;
    contactEmail: string;
    subdomain: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}>;
export declare const UpdateOrganizationSchema: z.ZodObject<{
    companyName: z.ZodOptional<z.ZodString>;
    contactEmail: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    companyName?: string | undefined;
    contactEmail?: string | undefined;
}, {
    companyName?: string | undefined;
    contactEmail?: string | undefined;
}>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const ForgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const ResetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    token: string;
}, {
    password: string;
    token: string;
}>;
export declare const ChangePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
export declare const CreateUserSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["ADMIN", "AGENT", "VIEWER"]>>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "ADMIN" | "AGENT" | "VIEWER";
}, {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: "ADMIN" | "AGENT" | "VIEWER" | undefined;
}>;
export declare const UpdateUserSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["ADMIN", "AGENT", "VIEWER"]>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    email?: string | undefined;
    role?: "ADMIN" | "AGENT" | "VIEWER" | undefined;
    isActive?: boolean | undefined;
}, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    email?: string | undefined;
    role?: "ADMIN" | "AGENT" | "VIEWER" | undefined;
    isActive?: boolean | undefined;
}>;
export declare const SearchUsersSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["ADMIN", "AGENT", "VIEWER"]>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    role?: "ADMIN" | "AGENT" | "VIEWER" | undefined;
    isActive?: boolean | undefined;
    search?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    role?: "ADMIN" | "AGENT" | "VIEWER" | undefined;
    isActive?: boolean | undefined;
    search?: string | undefined;
}>;
export declare const ResetUserPasswordSchema: z.ZodObject<{
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    newPassword: string;
}, {
    newPassword: string;
}>;
export declare const UpdateSettingsSchema: z.ZodObject<{
    timezone: z.ZodOptional<z.ZodString>;
    emailNotifications: z.ZodOptional<z.ZodBoolean>;
    browserNotifications: z.ZodOptional<z.ZodBoolean>;
    weeklyReports: z.ZodOptional<z.ZodBoolean>;
    apiKey: z.ZodOptional<z.ZodString>;
    webhookUrl: z.ZodOptional<z.ZodString>;
    twoFactorEnabled: z.ZodOptional<z.ZodBoolean>;
    sessionTimeoutMinutes: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    timezone?: string | undefined;
    emailNotifications?: boolean | undefined;
    browserNotifications?: boolean | undefined;
    weeklyReports?: boolean | undefined;
    apiKey?: string | undefined;
    webhookUrl?: string | undefined;
    twoFactorEnabled?: boolean | undefined;
    sessionTimeoutMinutes?: number | undefined;
}, {
    timezone?: string | undefined;
    emailNotifications?: boolean | undefined;
    browserNotifications?: boolean | undefined;
    weeklyReports?: boolean | undefined;
    apiKey?: string | undefined;
    webhookUrl?: string | undefined;
    twoFactorEnabled?: boolean | undefined;
    sessionTimeoutMinutes?: number | undefined;
}>;
export declare const CreateChatBotSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
}>;
export declare const UpdateChatBotSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
}>;
export declare const SearchChatBotsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    search?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
}>;
export declare const FileUploadSchema: z.ZodObject<{
    chatBotId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    chatBotId: string;
}, {
    chatBotId: string;
}>;
export declare const FileQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    chatBotId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    chatBotId: string;
}, {
    chatBotId: string;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare const CreateChatRoomSchema: z.ZodObject<{
    title: z.ZodString;
    chatBotId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    chatBotId: string;
    title: string;
}, {
    chatBotId: string;
    title: string;
}>;
export declare const UpdateChatRoomSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
}, {
    title?: string | undefined;
}>;
export declare const ChatRoomQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    chatBotId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    chatBotId?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    chatBotId?: string | undefined;
}>;
export declare const SendMessageSchema: z.ZodObject<{
    chatRoomId: z.ZodString;
    message: z.ZodString;
    sender: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    chatRoomId: string;
    sender: string;
}, {
    message: string;
    chatRoomId: string;
    sender: string;
}>;
export declare const ConversationQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    chatRoomId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    chatRoomId: string;
}, {
    chatRoomId: string;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare const CreateBotAccessSchema: z.ZodObject<{
    userId: z.ZodString;
    chatBotId: z.ZodString;
    isBlocked: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    chatBotId: string;
    userId: string;
    isBlocked: boolean;
}, {
    chatBotId: string;
    userId: string;
    isBlocked?: boolean | undefined;
}>;
export declare const UpdateBotAccessSchema: z.ZodObject<{
    isBlocked: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    isBlocked: boolean;
}, {
    isBlocked: boolean;
}>;
export declare const BotAccessQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    chatBotId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    isBlocked: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    chatBotId?: string | undefined;
    userId?: string | undefined;
    isBlocked?: boolean | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    chatBotId?: string | undefined;
    userId?: string | undefined;
    isBlocked?: boolean | undefined;
}>;
export declare const CreateSupportTicketSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    customerName: z.ZodString;
    customerEmail: z.ZodString;
    customerPhone: z.ZodOptional<z.ZodString>;
    priority: z.ZodDefault<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"]>>;
    categoryId: z.ZodOptional<z.ZodString>;
    assignedAgentId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description: string;
    title: string;
    customerName: string;
    customerEmail: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL";
    customerPhone?: string | undefined;
    categoryId?: string | undefined;
    assignedAgentId?: string | undefined;
}, {
    description: string;
    title: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL" | undefined;
    categoryId?: string | undefined;
    assignedAgentId?: string | undefined;
}>;
export declare const UpdateSupportTicketSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["OPEN", "IN_PROGRESS", "PENDING_CUSTOMER", "RESOLVED", "CLOSED", "CANCELLED"]>>;
    priority: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"]>>;
    categoryId: z.ZodOptional<z.ZodString>;
    assignedAgentId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "OPEN" | "IN_PROGRESS" | "PENDING_CUSTOMER" | "RESOLVED" | "CLOSED" | "CANCELLED" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL" | undefined;
    categoryId?: string | undefined;
    assignedAgentId?: string | undefined;
}, {
    status?: "OPEN" | "IN_PROGRESS" | "PENDING_CUSTOMER" | "RESOLVED" | "CLOSED" | "CANCELLED" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL" | undefined;
    categoryId?: string | undefined;
    assignedAgentId?: string | undefined;
}>;
export declare const SupportTicketQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<["OPEN", "IN_PROGRESS", "PENDING_CUSTOMER", "RESOLVED", "CLOSED", "CANCELLED"]>>;
    priority: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"]>>;
    assignedAgentId: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: "OPEN" | "IN_PROGRESS" | "PENDING_CUSTOMER" | "RESOLVED" | "CLOSED" | "CANCELLED" | undefined;
    search?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL" | undefined;
    categoryId?: string | undefined;
    assignedAgentId?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    status?: "OPEN" | "IN_PROGRESS" | "PENDING_CUSTOMER" | "RESOLVED" | "CLOSED" | "CANCELLED" | undefined;
    search?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL" | undefined;
    categoryId?: string | undefined;
    assignedAgentId?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}>;
export declare const CreateTicketCategorySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description?: string | undefined;
    color?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    color?: string | undefined;
}>;
export declare const UpdateTicketCategorySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    name?: string | undefined;
    description?: string | undefined;
    color?: string | undefined;
}, {
    isActive?: boolean | undefined;
    name?: string | undefined;
    description?: string | undefined;
    color?: string | undefined;
}>;
export declare const TicketCategoryQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    isActive?: boolean | undefined;
    search?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    isActive?: boolean | undefined;
    search?: string | undefined;
}>;
export declare const CreateTicketCommentSchema: z.ZodObject<{
    content: z.ZodString;
    isInternal: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    content: string;
    isInternal: boolean;
}, {
    content: string;
    isInternal?: boolean | undefined;
}>;
export declare const UpdateTicketCommentSchema: z.ZodObject<{
    content: z.ZodOptional<z.ZodString>;
    isInternal: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    content?: string | undefined;
    isInternal?: boolean | undefined;
}, {
    content?: string | undefined;
    isInternal?: boolean | undefined;
}>;
export declare const TicketCommentQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    ticketId: z.ZodString;
    isInternal: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    ticketId: string;
    isInternal?: boolean | undefined;
}, {
    ticketId: string;
    page?: number | undefined;
    limit?: number | undefined;
    isInternal?: boolean | undefined;
}>;
export declare const TicketAttachmentUploadSchema: z.ZodObject<{
    ticketId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    ticketId: string;
}, {
    ticketId: string;
}>;
export declare const TicketAttachmentQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    ticketId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    ticketId: string;
}, {
    ticketId: string;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare const DateRangeBaseSchema: z.ZodObject<{
    startDate: z.ZodString;
    endDate: z.ZodString;
}, "strip", z.ZodTypeAny, {
    startDate: string;
    endDate: string;
}, {
    startDate: string;
    endDate: string;
}>;
export declare const DateRangeSchema: z.ZodEffects<z.ZodObject<{
    startDate: z.ZodString;
    endDate: z.ZodString;
}, "strip", z.ZodTypeAny, {
    startDate: string;
    endDate: string;
}, {
    startDate: string;
    endDate: string;
}>, {
    startDate: string;
    endDate: string;
}, {
    startDate: string;
    endDate: string;
}>;
export declare const AnalyticsQuerySchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    period: z.ZodDefault<z.ZodEnum<["day", "week", "month", "quarter", "year"]>>;
}, "strip", z.ZodTypeAny, {
    period: "day" | "week" | "month" | "quarter" | "year";
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    period?: "day" | "week" | "month" | "quarter" | "year" | undefined;
}>;
export declare const GlobalSearchSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    query: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["tickets", "users", "chatbots", "all"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    type: "tickets" | "users" | "chatbots" | "all";
    query: string;
}, {
    query: string;
    page?: number | undefined;
    limit?: number | undefined;
    type?: "tickets" | "users" | "chatbots" | "all" | undefined;
}>;
export declare const BulkUpdateTicketsSchema: z.ZodObject<{
    ticketIds: z.ZodArray<z.ZodString, "many">;
    updates: z.ZodObject<{
        status: z.ZodOptional<z.ZodEnum<["OPEN", "IN_PROGRESS", "PENDING_CUSTOMER", "RESOLVED", "CLOSED", "CANCELLED"]>>;
        priority: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"]>>;
        assignedAgentId: z.ZodOptional<z.ZodString>;
        categoryId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status?: "OPEN" | "IN_PROGRESS" | "PENDING_CUSTOMER" | "RESOLVED" | "CLOSED" | "CANCELLED" | undefined;
        priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL" | undefined;
        categoryId?: string | undefined;
        assignedAgentId?: string | undefined;
    }, {
        status?: "OPEN" | "IN_PROGRESS" | "PENDING_CUSTOMER" | "RESOLVED" | "CLOSED" | "CANCELLED" | undefined;
        priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL" | undefined;
        categoryId?: string | undefined;
        assignedAgentId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    ticketIds: string[];
    updates: {
        status?: "OPEN" | "IN_PROGRESS" | "PENDING_CUSTOMER" | "RESOLVED" | "CLOSED" | "CANCELLED" | undefined;
        priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL" | undefined;
        categoryId?: string | undefined;
        assignedAgentId?: string | undefined;
    };
}, {
    ticketIds: string[];
    updates: {
        status?: "OPEN" | "IN_PROGRESS" | "PENDING_CUSTOMER" | "RESOLVED" | "CLOSED" | "CANCELLED" | undefined;
        priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL" | undefined;
        categoryId?: string | undefined;
        assignedAgentId?: string | undefined;
    };
}>;
export declare const BulkDeleteSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    ids: string[];
}, {
    ids: string[];
}>;
export declare const ExportQuerySchema: z.ZodObject<{
    format: z.ZodDefault<z.ZodEnum<["csv", "xlsx", "pdf"]>>;
    type: z.ZodEnum<["tickets", "users", "analytics"]>;
    filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    dateRange: z.ZodOptional<z.ZodEffects<z.ZodObject<{
        startDate: z.ZodString;
        endDate: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        startDate: string;
        endDate: string;
    }, {
        startDate: string;
        endDate: string;
    }>, {
        startDate: string;
        endDate: string;
    }, {
        startDate: string;
        endDate: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "tickets" | "users" | "analytics";
    format: "csv" | "xlsx" | "pdf";
    filters?: Record<string, any> | undefined;
    dateRange?: {
        startDate: string;
        endDate: string;
    } | undefined;
}, {
    type: "tickets" | "users" | "analytics";
    format?: "csv" | "xlsx" | "pdf" | undefined;
    filters?: Record<string, any> | undefined;
    dateRange?: {
        startDate: string;
        endDate: string;
    } | undefined;
}>;
export declare const NotificationPreferencesSchema: z.ZodObject<{
    emailNotifications: z.ZodOptional<z.ZodObject<{
        newTickets: z.ZodDefault<z.ZodBoolean>;
        ticketUpdates: z.ZodDefault<z.ZodBoolean>;
        assignments: z.ZodDefault<z.ZodBoolean>;
        mentions: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        newTickets: boolean;
        ticketUpdates: boolean;
        assignments: boolean;
        mentions: boolean;
    }, {
        newTickets?: boolean | undefined;
        ticketUpdates?: boolean | undefined;
        assignments?: boolean | undefined;
        mentions?: boolean | undefined;
    }>>;
    browserNotifications: z.ZodOptional<z.ZodObject<{
        newTickets: z.ZodDefault<z.ZodBoolean>;
        ticketUpdates: z.ZodDefault<z.ZodBoolean>;
        assignments: z.ZodDefault<z.ZodBoolean>;
        mentions: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        newTickets: boolean;
        ticketUpdates: boolean;
        assignments: boolean;
        mentions: boolean;
    }, {
        newTickets?: boolean | undefined;
        ticketUpdates?: boolean | undefined;
        assignments?: boolean | undefined;
        mentions?: boolean | undefined;
    }>>;
    slackNotifications: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        webhookUrl: z.ZodOptional<z.ZodString>;
        channels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        webhookUrl?: string | undefined;
        channels?: string[] | undefined;
    }, {
        webhookUrl?: string | undefined;
        enabled?: boolean | undefined;
        channels?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    emailNotifications?: {
        newTickets: boolean;
        ticketUpdates: boolean;
        assignments: boolean;
        mentions: boolean;
    } | undefined;
    browserNotifications?: {
        newTickets: boolean;
        ticketUpdates: boolean;
        assignments: boolean;
        mentions: boolean;
    } | undefined;
    slackNotifications?: {
        enabled: boolean;
        webhookUrl?: string | undefined;
        channels?: string[] | undefined;
    } | undefined;
}, {
    emailNotifications?: {
        newTickets?: boolean | undefined;
        ticketUpdates?: boolean | undefined;
        assignments?: boolean | undefined;
        mentions?: boolean | undefined;
    } | undefined;
    browserNotifications?: {
        newTickets?: boolean | undefined;
        ticketUpdates?: boolean | undefined;
        assignments?: boolean | undefined;
        mentions?: boolean | undefined;
    } | undefined;
    slackNotifications?: {
        webhookUrl?: string | undefined;
        enabled?: boolean | undefined;
        channels?: string[] | undefined;
    } | undefined;
}>;
export declare const CreateWebhookSchema: z.ZodObject<{
    name: z.ZodString;
    url: z.ZodString;
    events: z.ZodArray<z.ZodEnum<["ticket.created", "ticket.updated", "ticket.resolved", "ticket.closed", "comment.added", "user.created", "user.updated"]>, "many">;
    isActive: z.ZodDefault<z.ZodBoolean>;
    secret: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    isActive: boolean;
    name: string;
    url: string;
    events: ("ticket.created" | "ticket.updated" | "ticket.resolved" | "ticket.closed" | "comment.added" | "user.created" | "user.updated")[];
    secret?: string | undefined;
}, {
    name: string;
    url: string;
    events: ("ticket.created" | "ticket.updated" | "ticket.resolved" | "ticket.closed" | "comment.added" | "user.created" | "user.updated")[];
    isActive?: boolean | undefined;
    secret?: string | undefined;
}>;
export declare const UpdateWebhookSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    events: z.ZodOptional<z.ZodArray<z.ZodEnum<["ticket.created", "ticket.updated", "ticket.resolved", "ticket.closed", "comment.added", "user.created", "user.updated"]>, "many">>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    secret: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    name?: string | undefined;
    url?: string | undefined;
    events?: ("ticket.created" | "ticket.updated" | "ticket.resolved" | "ticket.closed" | "comment.added" | "user.created" | "user.updated")[] | undefined;
    secret?: string | undefined;
}, {
    isActive?: boolean | undefined;
    name?: string | undefined;
    url?: string | undefined;
    events?: ("ticket.created" | "ticket.updated" | "ticket.resolved" | "ticket.closed" | "comment.added" | "user.created" | "user.updated")[] | undefined;
    secret?: string | undefined;
}>;
export declare const CreateApiKeySchema: z.ZodObject<{
    name: z.ZodString;
    permissions: z.ZodArray<z.ZodEnum<["read:tickets", "write:tickets", "read:users", "write:users", "read:chatbots", "write:chatbots", "admin"]>, "many">;
    expiresAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    permissions: ("read:tickets" | "write:tickets" | "read:users" | "write:users" | "read:chatbots" | "write:chatbots" | "admin")[];
    expiresAt?: string | undefined;
}, {
    name: string;
    permissions: ("read:tickets" | "write:tickets" | "read:users" | "write:users" | "read:chatbots" | "write:chatbots" | "admin")[];
    expiresAt?: string | undefined;
}>;
export declare const UpdateApiKeySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodEnum<["read:tickets", "write:tickets", "read:users", "write:users", "read:chatbots", "write:chatbots", "admin"]>, "many">>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    name?: string | undefined;
    permissions?: ("read:tickets" | "write:tickets" | "read:users" | "write:users" | "read:chatbots" | "write:chatbots" | "admin")[] | undefined;
}, {
    isActive?: boolean | undefined;
    name?: string | undefined;
    permissions?: ("read:tickets" | "write:tickets" | "read:users" | "write:users" | "read:chatbots" | "write:chatbots" | "admin")[] | undefined;
}>;
export declare const CreateTeamSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    leaderId: z.ZodString;
    memberIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    leaderId: string;
    description?: string | undefined;
    memberIds?: string[] | undefined;
}, {
    name: string;
    leaderId: string;
    description?: string | undefined;
    memberIds?: string[] | undefined;
}>;
export declare const UpdateTeamSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    leaderId: z.ZodOptional<z.ZodString>;
    memberIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    leaderId?: string | undefined;
    memberIds?: string[] | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    leaderId?: string | undefined;
    memberIds?: string[] | undefined;
}>;
export declare const CreateCustomFieldSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["text", "number", "date", "select", "multiselect", "checkbox"]>;
    required: z.ZodDefault<z.ZodBoolean>;
    options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    defaultValue: z.ZodOptional<z.ZodString>;
    helpText: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "number" | "date" | "text" | "select" | "multiselect" | "checkbox";
    name: string;
    required: boolean;
    options?: string[] | undefined;
    defaultValue?: string | undefined;
    helpText?: string | undefined;
}, {
    type: "number" | "date" | "text" | "select" | "multiselect" | "checkbox";
    name: string;
    options?: string[] | undefined;
    required?: boolean | undefined;
    defaultValue?: string | undefined;
    helpText?: string | undefined;
}>;
export declare const UpdateCustomFieldSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["text", "number", "date", "select", "multiselect", "checkbox"]>>;
    required: z.ZodOptional<z.ZodBoolean>;
    options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    defaultValue: z.ZodOptional<z.ZodString>;
    helpText: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    options?: string[] | undefined;
    type?: "number" | "date" | "text" | "select" | "multiselect" | "checkbox" | undefined;
    isActive?: boolean | undefined;
    name?: string | undefined;
    required?: boolean | undefined;
    defaultValue?: string | undefined;
    helpText?: string | undefined;
}, {
    options?: string[] | undefined;
    type?: "number" | "date" | "text" | "select" | "multiselect" | "checkbox" | undefined;
    isActive?: boolean | undefined;
    name?: string | undefined;
    required?: boolean | undefined;
    defaultValue?: string | undefined;
    helpText?: string | undefined;
}>;
export declare const CreateSLASchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"]>;
    responseTimeHours: z.ZodNumber;
    resolutionTimeHours: z.ZodNumber;
    businessHoursOnly: z.ZodDefault<z.ZodBoolean>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive: boolean;
    name: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL";
    responseTimeHours: number;
    resolutionTimeHours: number;
    businessHoursOnly: boolean;
    description?: string | undefined;
}, {
    name: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL";
    responseTimeHours: number;
    resolutionTimeHours: number;
    isActive?: boolean | undefined;
    description?: string | undefined;
    businessHoursOnly?: boolean | undefined;
}>;
export declare const UpdateSLASchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"]>>;
    responseTimeHours: z.ZodOptional<z.ZodNumber>;
    resolutionTimeHours: z.ZodOptional<z.ZodNumber>;
    businessHoursOnly: z.ZodOptional<z.ZodBoolean>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    name?: string | undefined;
    description?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL" | undefined;
    responseTimeHours?: number | undefined;
    resolutionTimeHours?: number | undefined;
    businessHoursOnly?: boolean | undefined;
}, {
    isActive?: boolean | undefined;
    name?: string | undefined;
    description?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL" | undefined;
    responseTimeHours?: number | undefined;
    resolutionTimeHours?: number | undefined;
    businessHoursOnly?: boolean | undefined;
}>;
export declare const validateIds: (ids: string[]) => string[];
export declare const validateEmail: (email: string) => string;
export declare const validatePassword: (password: string) => string;
export declare const validateFileSize: (size: number, maxSizeMB?: number) => boolean;
export declare const validateFileType: (filename: string, allowedTypes: string[]) => boolean;
export declare const EnvironmentSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    PORT: z.ZodDefault<z.ZodNumber>;
    DATABASE_URL: z.ZodString;
    JWT_SECRET: z.ZodString;
    JWT_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    BCRYPT_ROUNDS: z.ZodDefault<z.ZodNumber>;
    FRONTEND_URL: z.ZodDefault<z.ZodString>;
    EMAIL_HOST: z.ZodOptional<z.ZodString>;
    EMAIL_PORT: z.ZodOptional<z.ZodNumber>;
    EMAIL_USER: z.ZodOptional<z.ZodString>;
    EMAIL_PASS: z.ZodOptional<z.ZodString>;
    AWS_ACCESS_KEY_ID: z.ZodOptional<z.ZodString>;
    AWS_SECRET_ACCESS_KEY: z.ZodOptional<z.ZodString>;
    AWS_REGION: z.ZodOptional<z.ZodString>;
    AWS_S3_BUCKET: z.ZodOptional<z.ZodString>;
    REDIS_URL: z.ZodOptional<z.ZodString>;
    SENTRY_DSN: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    BCRYPT_ROUNDS: number;
    FRONTEND_URL: string;
    EMAIL_HOST?: string | undefined;
    EMAIL_PORT?: number | undefined;
    EMAIL_USER?: string | undefined;
    EMAIL_PASS?: string | undefined;
    AWS_ACCESS_KEY_ID?: string | undefined;
    AWS_SECRET_ACCESS_KEY?: string | undefined;
    AWS_REGION?: string | undefined;
    AWS_S3_BUCKET?: string | undefined;
    REDIS_URL?: string | undefined;
    SENTRY_DSN?: string | undefined;
}, {
    DATABASE_URL: string;
    JWT_SECRET: string;
    NODE_ENV?: "development" | "production" | "test" | undefined;
    PORT?: number | undefined;
    JWT_EXPIRES_IN?: string | undefined;
    BCRYPT_ROUNDS?: number | undefined;
    FRONTEND_URL?: string | undefined;
    EMAIL_HOST?: string | undefined;
    EMAIL_PORT?: number | undefined;
    EMAIL_USER?: string | undefined;
    EMAIL_PASS?: string | undefined;
    AWS_ACCESS_KEY_ID?: string | undefined;
    AWS_SECRET_ACCESS_KEY?: string | undefined;
    AWS_REGION?: string | undefined;
    AWS_S3_BUCKET?: string | undefined;
    REDIS_URL?: string | undefined;
    SENTRY_DSN?: string | undefined;
}>;
export type EnvironmentConfig = z.infer<typeof EnvironmentSchema>;
//# sourceMappingURL=validation.d.ts.map