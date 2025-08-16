import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    organizationId: string;
    role: UserRole;
    organization: {
      id: string;
      subdomain: string;
    };
  };
}

interface JWTPayload {
  userId: string;
  organizationId: string;
  subdomain: string;
  iat?: number;
  exp?: number;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Get user with organization data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        organization: {
          select: {
            id: true,
            subdomain: true
          }
        }
      }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
      organization: user.organization
    };

    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
    return;
  }
};

export const checkSubdomain = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const subdomain = req.headers['x-subdomain'] as string;
    
    if (!subdomain) {
      res.status(400).json({
        success: false,
        message: 'Subdomain header required'
      });
      return;
    }

    // Verify the user belongs to this organization
    if (req.user && req.user.organization.subdomain !== subdomain) {
      res.status(403).json({
        success: false,
        message: 'Access denied for this organization'
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Subdomain verification failed'
    });
    return;
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token provided, continue without authentication
      next();
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        organization: {
          select: {
            id: true,
            subdomain: true
          }
        }
      }
    });

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
        role: user.role,
        organization: user.organization
      };
    }

    next();
  } catch (error) {
    // Invalid token, but continue without authentication
    next();
  }
};