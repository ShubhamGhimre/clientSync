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

export const createPaginationResponse = <T>(
  data: T[],
  total: number,
  options: PaginationOptions
): PaginationResult<T> => {
  const totalPages = Math.ceil(total / options.limit);
  
  return {
    data,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages,
      hasNext: options.page < totalPages,
      hasPrev: options.page > 1
    }
  };
};

export const sendSuccessResponse = (
  res: Response,
  message: string,
  data?: any,
  statusCode: number = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
    ...(data && { data })
  });
};

export const sendErrorResponse = (
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: any[]
) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors })
  });
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};