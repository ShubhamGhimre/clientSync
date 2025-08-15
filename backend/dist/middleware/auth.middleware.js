import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../../generated/prisma';
const prisma = new PrismaClient();
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        req.user = {
            id: user.id,
            email: user.email,
            organizationId: user.organizationId,
            organization: user.organization
        };
        next();
    }
    catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};
export const checkSubdomain = async (req, res, next) => {
    try {
        const subdomain = req.headers['x-subdomain'];
        if (!subdomain) {
            return res.status(400).json({
                success: false,
                message: 'Subdomain header required'
            });
        }
        // Verify the user belongs to this organization
        if (req.user && req.user.organization.subdomain !== subdomain) {
            return res.status(403).json({
                success: false,
                message: 'Access denied for this organization'
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Subdomain verification failed'
        });
    }
};
//# sourceMappingURL=auth.middleware.js.map