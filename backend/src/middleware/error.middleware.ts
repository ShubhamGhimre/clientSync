import  type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    return res.status(statusCode).json({
      success: false,
      message,
      errors: err.errors.map(error => ({
        field: error.path.join('.'),
        message: error.message
      }))
    });
  }

  // Prisma errors
  if (err.message.includes('Unique constraint failed')) {
    statusCode = 409;
    message = 'Resource already exists';
  }

  if (err.message.includes('Record to update not found')) {
    statusCode = 404;
    message = 'Resource not found';
  }

  if (err.message.includes('Foreign key constraint failed')) {
    statusCode = 400;
    message = 'Invalid reference to related resource';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.message.includes('File too large')) {
      message = 'File size too large';
    } else if (err.message.includes('Unexpected field')) {
      message = 'Invalid file field';
    } else {
      message = 'File upload error';
    }
  }

  console.error(`Error: ${message}`, {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err.message 
    })
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: {
      auth: '/api/auth',
      organizations: '/api/organizations',
      chatbots: '/api/chatbots',
      docs: '/api/docs'
    }
  });
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};