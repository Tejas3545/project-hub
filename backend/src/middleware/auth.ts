import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config';
import prisma from '../utils/prisma';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: 'STUDENT' | 'ADMIN';
    };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const token = authHeader.substring(7);

        try {
            const decoded = jwt.verify(token, authConfig.jwtSecret) as {
                id: string;
                email: string;
                role: 'STUDENT' | 'ADMIN';
            };

            // Verify user exists and is active in database
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, email: true, role: true, isVerified: true }
            });

            if (!user) {
                return res.status(401).json({ error: 'User account not found or deactivated' });
            }

            req.user = {
                id: user.id,
                email: user.email,
                role: user.role
            };

            next();
        } catch (error) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    } catch (error) {
        next(error);
    }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    next();
};

// Optional authentication - doesn't fail if no token, but populates user if valid token exists
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);

            try {
                const decoded = jwt.verify(token, authConfig.jwtSecret) as {
                    id: string;
                    email: string;
                    role: 'STUDENT' | 'ADMIN';
                };

                req.user = decoded;
            } catch (error) {
                // Invalid token, but we don't fail - just continue without user
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};

// Export as authMiddleware for consistency
export const authMiddleware = authenticate;
