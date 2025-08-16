import type { Request, Response, NextFunction } from 'express';
import z, { ZodSchema, ZodError } from 'zod';
import { sendErrorResponse } from '../utils/helpers.js';

// Generic validation middleware factory
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return sendErrorResponse(res, 'Validation failed', 400, error.errors);
      }
      return sendErrorResponse(res, 'Invalid request body', 400);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return sendErrorResponse(res, 'Invalid query parameters', 400, error.errors);
      }
      return sendErrorResponse(res, 'Invalid query parameters', 400);
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return sendErrorResponse(res, 'Invalid URL parameters', 400, error.errors);
      }
      return sendErrorResponse(res, 'Invalid URL parameters', 400);
    }
  };
};

// File validation middleware
export const validateFile = (options: {
  required?: boolean;
  maxSize?: number; // in MB
  allowedTypes?: string[];
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { required = false, maxSize = 25, allowedTypes = [] } = options;

    if (required && !req.file) {
      return sendErrorResponse(res, 'File is required', 400);
    }

    if (req.file) {
      // Check file size
      const maxSizeBytes = maxSize * 1024 * 1024;
      if (req.file.size > maxSizeBytes) {
        return sendErrorResponse(res, `File size must be less than ${maxSize}MB`, 400);
      }

      // Check file type
      if (allowedTypes.length > 0) {
        const ext = req.file.originalname.toLowerCase().split('.').pop();
        if (!ext || !allowedTypes.includes(`.${ext}`)) {
          return sendErrorResponse(res, `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`, 400);
        }
      }
    }

    next();
  };
};

// Multiple files validation middleware
export const validateFiles = (options: {
  required?: boolean;
  maxCount?: number;
  maxSize?: number; // in MB per file
  allowedTypes?: string[];
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { required = false, maxCount = 10, maxSize = 25, allowedTypes = [] } = options;

    if (required && (!req.files || !Array.isArray(req.files) || req.files.length === 0)) {
      return sendErrorResponse(res, 'At least one file is required', 400);
    }

    if (req.files && Array.isArray(req.files)) {
      // Check file count
      if (req.files.length > maxCount) {
        return sendErrorResponse(res, `Maximum ${maxCount} files allowed`, 400);
      }

      // Check each file
      for (const file of req.files) {
        // Check file size
        const maxSizeBytes = maxSize * 1024 * 1024;
        if (file.size > maxSizeBytes) {
          return sendErrorResponse(res, `File ${file.originalname} is too large. Maximum ${maxSize}MB allowed`, 400);
        }

        // Check file type
        if (allowedTypes.length > 0) {
          const ext = file.originalname.toLowerCase().split('.').pop();
          if (!ext || !allowedTypes.includes(`.${ext}`)) {
            return sendErrorResponse(res, `File ${file.originalname} has invalid type. Allowed types: ${allowedTypes.join(', ')}`, 400);
          }
        }
      }
    }

    next();
  };
};

// ID parameter validation
export const validateId = (paramName: string = 'id') => {
  return validateParams(z.object({
    [paramName]: z.string().min(1, `${paramName} is required`)
  }));
};

// Date range validation middleware
export const validateDateRange = (req: Request, res: Response, next: NextFunction) => {
  const { startDate, endDate } = req.query;

  if (startDate && endDate) {
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return sendErrorResponse(res, 'Invalid date format', 400);
    }

    if (start >= end) {
      return sendErrorResponse(res, 'Start date must be before end date', 400);
    }

    // Add 1 year maximum range
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    if (end.getTime() - start.getTime() > oneYear) {
      return sendErrorResponse(res, 'Date range cannot exceed 1 year', 400);
    }
  }

  next();
};

// Rate limiting validation
export const validateRateLimit = (options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
}) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const windowMs = options.windowMs;
    const maxRequests = options.maxRequests;

    const userRequests = requests.get(key);

    if (!userRequests || now > userRequests.resetTime) {
      requests.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userRequests.count >= maxRequests) {
      return sendErrorResponse(res, options.message || 'Rate limit exceeded', 429);
    }

    userRequests.count++;
    next();
  };
};

// Content type validation
export const validateContentType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers['content-type'];

    if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
      return sendErrorResponse(res, `Invalid content type. Allowed types: ${allowedTypes.join(', ')}`, 400);
    }

    next();
  };
};

// Custom validation middleware for business rules
export const validateBusinessRules = (validator: (req: Request) => Promise<string | null>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const error = await validator(req);
      if (error) {
        return sendErrorResponse(res, error, 400);
      }
      next();
    } catch (error) {
      return sendErrorResponse(res, 'Validation failed', 500);
    }
  };
};

export default {
  validateBody,
  validateQuery,
  validateParams,
  validateFile,
  validateFiles,
  validateId,
  validateDateRange,
  validateRateLimit,
  validateContentType,
  validateBusinessRules
};