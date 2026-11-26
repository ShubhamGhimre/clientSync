import type { Response } from 'express';
export interface PaginationOptions {
    page: number;
    limit: number;
}
export interface PaginationResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export declare const createPaginationResponse: <T>(data: T[], total: number, options: PaginationOptions) => PaginationResult<T>;
export declare const sendSuccessResponse: (res: Response, message: string, data?: any, statusCode?: number) => void;
export declare const sendErrorResponse: (res: Response, message: string, statusCode?: number, errors?: any[]) => void;
export declare const generateSlug: (text: string) => string;
export declare const isValidEmail: (email: string) => boolean;
export declare const sanitizeInput: (input: string) => string;
export declare const formatDate: (date: Date) => string;
//# sourceMappingURL=helpers.d.ts.map