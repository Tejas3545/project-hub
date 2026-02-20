/**
 * OWASP Best Practice: Rate Limiting
 * 
 * Implements multi-tier rate limiting to prevent:
 * - Brute force attacks on authentication endpoints
 * - API abuse and DoS attacks
 * - Credential stuffing attacks
 * - Resource exhaustion from expensive operations
 * 
 * Strategy:
 * - IP-based limiting for all public endpoints
 * - Stricter limits for authentication endpoints
 * - User-based limits for authenticated endpoints
 * - All limits configurable via environment variables
 * - Standard headers for client visibility
 */

import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

// Development mode bypass - skip all rate limiting
const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';

// Environment-based configuration with secure defaults
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'); // 1 minute for development, 15 for prod
const RATE_LIMIT_MAX_GENERAL = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '50000'); // Very high for development
const RATE_LIMIT_MAX_AUTH = parseInt(process.env.RATE_LIMIT_AUTH_MAX || '5000'); // Increased for development with multiple tabs
const RATE_LIMIT_MAX_REGISTER = parseInt(process.env.RATE_LIMIT_REGISTER_MAX || '100'); // Increased for development
const RATE_LIMIT_MAX_WRITE = parseInt(process.env.RATE_LIMIT_WRITE_MAX || '5000'); // Increased for development
const RATE_LIMIT_MAX_SEARCH = parseInt(process.env.RATE_LIMIT_SEARCH_MAX || '5000'); // Increased for development

/**
 * Standard rate limiter for general API endpoints
 * OWASP: Configurable requests per window per IP
 * Default: 100 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW,
    max: RATE_LIMIT_MAX_GENERAL,
    message: {
        status: 429,
        error: 'Too Many Requests',
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 60000) + ' minutes'
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable legacy `X-RateLimit-*` headers
    // Use User ID for authenticated users, IP for anonymous
    keyGenerator: (req: Request) => {
        const authReq = req as AuthRequest;
        return authReq.user ? `user-${authReq.user.id}` : ipKeyGenerator(req.ip || '127.0.0.1');
    },
    // Skip only in development mode
    skip: (req: Request) => IS_DEVELOPMENT,
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            status: 429,
            error: 'Too Many Requests',
            message: 'You have exceeded the rate limit. Please try again later.',
            retryAfter: res.getHeader('Retry-After'),
            limit: RATE_LIMIT_MAX_GENERAL,
            window: RATE_LIMIT_WINDOW
        });
    }
});

/**
 * Strict rate limiter for authentication endpoints
 * OWASP: Prevent brute force attacks
 * Default: 5 attempts per 15 minutes
 * Only failed attempts count (successful logins reset counter)
 */
export const authLimiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW,
    max: RATE_LIMIT_MAX_AUTH,
    skipSuccessfulRequests: true, // Don't count successful logins
    skipFailedRequests: false, // Count failed attempts
    // Skip in development mode or for /me endpoint (auth check only)
    skip: (req: Request) => IS_DEVELOPMENT || req.path === '/me',
    message: {
        status: 429,
        error: 'Too Many Login Attempts',
        message: 'Too many failed login attempts. Please try again later.',
        retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 60000) + ' minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            status: 429,
            error: 'Too Many Login Attempts',
            message: 'Account temporarily locked due to multiple failed login attempts. Please try again later.',
            retryAfter: res.getHeader('Retry-After'),
            limit: RATE_LIMIT_MAX_AUTH,
            window: RATE_LIMIT_WINDOW
        });
    }
});

/**
 * Registration rate limiter
 * OWASP: Prevent automated account creation
 * Default: 3 per hour per IP
 */
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: RATE_LIMIT_MAX_REGISTER,
    skip: () => IS_DEVELOPMENT, // Skip in development mode
    message: {
        status: 429,
        error: 'Too Many Registration Attempts',
        message: 'Too many accounts created from this IP, please try again after an hour.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            status: 429,
            error: 'Too Many Registration Attempts',
            message: 'Registration limit exceeded. Please try again later.',
            retryAfter: res.getHeader('Retry-After'),
            limit: RATE_LIMIT_MAX_REGISTER,
            window: 60 * 60 * 1000
        });
    }
});

/**
 * Write operation rate limiter
 * OWASP: Prevent abuse of create/update/delete operations
 * Default: 30 operations per 15 minutes per IP
 */
export const writeLimiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW,
    max: RATE_LIMIT_MAX_WRITE,
    skip: () => IS_DEVELOPMENT, // Skip in development mode
    message: {
        status: 429,
        error: 'Too Many Write Operations',
        message: 'Too many write operations, please slow down.',
        retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 60000) + ' minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            status: 429,
            error: 'Too Many Write Operations',
            message: 'You are performing too many operations. Please wait before trying again.',
            retryAfter: res.getHeader('Retry-After'),
            limit: RATE_LIMIT_MAX_WRITE,
            window: RATE_LIMIT_WINDOW
        });
    }
});

/**
 * Search/Query rate limiter
 * OWASP: Prevent resource exhaustion from expensive queries
 * Default: 20 searches per minute per IP
 */
export const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: RATE_LIMIT_MAX_SEARCH,
    skip: () => IS_DEVELOPMENT, // Skip in development mode
    message: {
        status: 429,
        error: 'Too Many Search Requests',
        message: 'Too many search requests, please wait a moment.',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            status: 429,
            error: 'Too Many Search Requests',
            message: 'Search rate limit exceeded. Please wait before searching again.',
            retryAfter: res.getHeader('Retry-After'),
            limit: RATE_LIMIT_MAX_SEARCH,
            window: 60000
        });
    }
});
