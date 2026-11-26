import type { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
export declare const validateBody: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateQuery: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateParams: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateFile: (options: {
    required?: boolean;
    maxSize?: number;
    allowedTypes?: string[];
}) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateFiles: (options: {
    required?: boolean;
    maxCount?: number;
    maxSize?: number;
    allowedTypes?: string[];
}) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateId: (paramName?: string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateDateRange: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateRateLimit: (options: {
    windowMs: number;
    maxRequests: number;
    message?: string;
}) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateContentType: (allowedTypes: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateBusinessRules: (validator: (req: Request) => Promise<string | null>) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const _default: {
    validateBody: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
    validateQuery: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
    validateParams: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
    validateFile: (options: {
        required?: boolean;
        maxSize?: number;
        allowedTypes?: string[];
    }) => (req: Request, res: Response, next: NextFunction) => void;
    validateFiles: (options: {
        required?: boolean;
        maxCount?: number;
        maxSize?: number;
        allowedTypes?: string[];
    }) => (req: Request, res: Response, next: NextFunction) => void;
    validateId: (paramName?: string) => (req: Request, res: Response, next: NextFunction) => void;
    validateDateRange: (req: Request, res: Response, next: NextFunction) => void;
    validateRateLimit: (options: {
        windowMs: number;
        maxRequests: number;
        message?: string;
    }) => (req: Request, res: Response, next: NextFunction) => void;
    validateContentType: (allowedTypes: string[]) => (req: Request, res: Response, next: NextFunction) => void;
    validateBusinessRules: (validator: (req: Request) => Promise<string | null>) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
export default _default;
//# sourceMappingURL=validation.middleware.d.ts.map