import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

/**
 * OWASP Best Practice: Input Validation Schemas
 * 
 * All schemas include:
 * - Type validation
 * - Length limits (prevent DoS)
 * - Format validation (regex patterns)
 * - Strict mode (reject unexpected fields)
 */

// Validation schemas
const projectCreateBaseSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title cannot exceed 200 characters').trim(),
    domainId: z.string().uuid('Invalid domain ID format'),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    subDomain: z.string().min(1).max(200).trim().optional(),
    minTime: z.number().int('minTime must be an integer').min(1, 'minTime must be at least 1').max(1000, 'minTime cannot exceed 1000'),
    maxTime: z.number().int('maxTime must be an integer').min(1, 'maxTime must be at least 1').max(1000, 'maxTime cannot exceed 1000'),
    skillFocus: z.array(z.string().min(1).max(100)).min(1, 'At least one skill is required').max(20, 'Cannot exceed 20 skills'),
    caseStudy: z.string().min(20, 'Case study must be at least 20 characters').max(8000, 'Case study cannot exceed 8000 characters').trim().optional(),
    industryContext: z.string().min(50, 'Industry context must be at least 50 characters').max(5000, 'Industry context cannot exceed 5000 characters').trim(),
    problemStatement: z.string().min(50, 'Problem statement must be at least 50 characters').max(5000, 'Problem statement cannot exceed 5000 characters').trim(),
    solutionDescription: z.string().min(20, 'Solution description must be at least 20 characters').max(8000, 'Solution description cannot exceed 8000 characters').trim().optional(),
    scope: z.string().min(50, 'Scope must be at least 50 characters').max(5000, 'Scope cannot exceed 5000 characters').trim(),
    prerequisites: z.array(z.string().min(1).max(200)).min(1, 'At least one prerequisite is required').max(30, 'Cannot exceed 30 prerequisites'),
    deliverables: z.array(z.string().min(1).max(200)).min(1, 'At least one deliverable is required').max(30, 'Cannot exceed 30 deliverables'),
    techStack: z.array(z.string().min(1).max(100)).max(30, 'Cannot exceed 30 tech stack items').optional(),
    supposedDeadline: z.string().min(1).max(100).trim().optional(),
    screenshots: z.array(z.string().url('Screenshot must be a valid URL')).max(5, 'Cannot exceed 5 screenshots').optional(),
    initializationGuide: z.string().min(20, 'Initialization guide must be at least 20 characters').max(12000, 'Initialization guide cannot exceed 12000 characters').trim().optional(),
    advancedExtensions: z.string().max(5000, 'Advanced extensions cannot exceed 5000 characters').trim().optional(),
    evaluationCriteria: z.string().max(5000, 'Evaluation criteria cannot exceed 5000 characters').trim().optional(),
    isPublished: z.boolean().optional().default(false),
}).strict(); // Reject unexpected fields

export const projectCreateSchema = projectCreateBaseSchema.refine(
    data => data.maxTime >= data.minTime,
    {
        message: "maxTime must be greater than or equal to minTime",
        path: ["maxTime"],
    }
);

export const projectUpdateSchema = projectCreateBaseSchema.partial();

export const domainCreateSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters').trim(),
    slug: z.string()
        .min(2, 'Slug must be at least 2 characters')
        .max(100, 'Slug cannot exceed 100 characters')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
        .trim(),
    description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description cannot exceed 500 characters').trim().optional(),
}).strict();

export const domainUpdateSchema = domainCreateSchema.partial();

export const userRegisterSchema = z.object({
    email: z.string().email('Invalid email format').max(255, 'Email cannot exceed 255 characters').trim().toLowerCase(),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password cannot exceed 128 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    firstName: z.string().min(1).max(50, 'First name cannot exceed 50 characters').trim().optional(),
    lastName: z.string().min(1).max(50, 'Last name cannot exceed 50 characters').trim().optional(),
}).strict();

export const userLoginSchema = z.object({
    email: z.string().email('Invalid email format').max(255, 'Email cannot exceed 255 characters').trim().toLowerCase(),
    password: z.string().min(1, 'Password is required').max(128, 'Password cannot exceed 128 characters'),
}).strict();

export const userUpdateProfileSchema = z.object({
    firstName: z.string().min(1).max(50, 'First name cannot exceed 50 characters').trim().optional(),
    lastName: z.string().min(1).max(50, 'Last name cannot exceed 50 characters').trim().optional(),
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').trim().optional(),
    profileImage: z.string().url('Profile image must be a valid URL').optional(),
}).strict();

export const projectProgressUpdateSchema = z.object({
    status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD']),
    notes: z.string().max(5000, 'Notes cannot exceed 5000 characters').trim().optional(),
}).strict();

// Query parameter schemas for GET endpoints
export const projectQuerySchema = z.object({
    domainId: z.string().uuid('Invalid domain ID format').optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    published: z.enum(['true', 'false']).optional(),
    minTime: z.string().regex(/^\d+$/, 'minTime must be a number').optional(),
    maxTime: z.string().regex(/^\d+$/, 'maxTime must be a number').optional(),
    skills: z.string().max(500, 'Skills parameter too long').optional(),
    search: z.string().min(1).max(200, 'Search term cannot exceed 200 characters').trim().optional(),
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
}).strict();

export const uuidParamSchema = z.object({
    id: z.string().uuid('Invalid ID format'),
});

export const slugParamSchema = z.object({
    slug: z.string().min(2).max(100).regex(/^[a-zA-Z0-9_-]+$/, 'Invalid slug format'),
});

// Middleware to validate request body
export const validate = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = schema.parse(req.body);
            req.body = parsed; // Replace with sanitized/validated data
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    status: 400,
                    error: 'Validation Failed',
                    message: 'The request contains invalid data.',
                    details: error.issues.map((err: z.ZodIssue) => ({
                        field: err.path.join('.'),
                        message: err.message,
                        code: err.code,
                    })),
                });
            }
            next(error);
        }
    };
};

// Middleware to validate query parameters
export const validateQuery = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = schema.parse(req.query);
            // Store validated query in a custom property instead of replacing req.query
            (req as any).validatedQuery = parsed;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    status: 400,
                    error: 'Invalid Query Parameters',
                    message: 'The query parameters are invalid.',
                    details: error.issues.map((err: z.ZodIssue) => ({
                        field: err.path.join('.'),
                        message: err.message,
                        code: err.code,
                    })),
                });
            }
            next(error);
        }
    };
};

// Middleware to validate URL parameters
export const validateParams = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = schema.parse(req.params);
            // Params are already validated, no need to replace
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    status: 400,
                    error: 'Invalid URL Parameters',
                    message: 'The URL parameters are invalid.',
                    details: error.issues.map((err: z.ZodIssue) => ({
                        field: err.path.join('.'),
                        message: err.message,
                        code: err.code,
                    })),
                });
            }
            next(error);
        }
    };
};

/**
 * OWASP Best Practice: Input Sanitization
 * 
 * Defense against:
 * - XSS (Cross-Site Scripting)
 * - HTML injection
 * - Script injection
 * - Event handler injection
 * 
 * Uses DOMPurify for robust HTML sanitization
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
    /**
     * Recursively sanitize all string values in an object
     * - Removes dangerous HTML/script tags
     * - Strips event handlers (onclick, onerror, etc.)
     * - Preserves safe content
     */
    const sanitize = (obj: any): any => {
        if (typeof obj === 'string') {
            // Use DOMPurify for robust XSS prevention
            return DOMPurify.sanitize(obj, {
                ALLOWED_TAGS: [], // Strip all HTML tags
                ALLOWED_ATTR: [], // Strip all attributes
                KEEP_CONTENT: true, // Keep text content
            }).trim();
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }
        if (obj && typeof obj === 'object') {
            const sanitized: any = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    sanitized[key] = sanitize(obj[key]);
                }
            }
            return sanitized;
        }
        return obj;
    };

    // Sanitize request body (safe to modify)
    if (req.body && typeof req.body === 'object') {
        req.body = sanitize(req.body);
    }

    // Note: req.query and req.params are read-only in newer Express versions
    // Sanitization is handled by validation middleware instead

    next();
};
