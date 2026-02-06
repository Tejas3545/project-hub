import { Request, Response, NextFunction } from 'express';
import logger, { logSecurityEvent } from '../utils/logger';
import { isProd } from '../config';

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Log the error
    logger.error(`Error: ${err.message}`, {
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body,
    });

    // Check if it's an operational error
    if (err instanceof AppError && err.isOperational) {
        return res.status(err.statusCode).json({
            error: err.message,
        });
    }

    // Security-related errors
    if (err.message.includes('token') || err.message.includes('auth')) {
        logSecurityEvent('Authentication Error', {
            ip: req.ip,
            url: req.url,
            error: err.message,
        });
        return res.status(401).json({
            error: 'Authentication failed',
        });
    }

    // Prisma errors
    if (err.constructor.name === 'PrismaClientKnownRequestError') {
        const prismaError = err as any;

        // Unique constraint violation
        if (prismaError.code === 'P2002') {
            return res.status(409).json({
                error: `Duplicate entry: ${prismaError.meta?.target?.[0] || 'field'} already exists`,
            });
        }

        // Record not found
        if (prismaError.code === 'P2025') {
            return res.status(404).json({
                error: 'Resource not found',
            });
        }

        // Foreign key constraint violation
        if (prismaError.code === 'P2003') {
            return res.status(400).json({
                error: 'Invalid reference: related resource does not exist',
            });
        }
    }

    // Default to 500 server error
    // In production, don't leak error details
    if (isProd) {
        return res.status(500).json({
            error: 'An unexpected error occurred',
        });
    } else {
        return res.status(500).json({
            error: err.message,
            stack: err.stack,
        });
    }
};

// Not found handler
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
    });
};
