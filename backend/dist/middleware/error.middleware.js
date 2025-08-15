import { Request, Response, NextFunction } from 'express';
export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    // Prisma errors
    if (err.message.includes('Unique constraint failed')) {
        statusCode = 409;
        message = 'Resource already exists';
    }
    if (err.message.includes('Record to update not found')) {
        statusCode = 404;
        message = 'Resource not found';
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
    console.error(`Error: ${message}`, err);
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
//# sourceMappingURL=error.middleware.js.map