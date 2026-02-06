import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import domainRoutes from './routes/domainRoutes';
import projectRoutes from './routes/projectRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import githubProjectRoutes from './routes/githubProjectRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { sanitizeInput } from './middleware/validation';
import { generalLimiter } from './middleware/rateLimiter';
import { securityConfig } from './config';
import logger from './utils/logger';
import { githubUpdateService } from './services/githubUpdateService';

/**
 * OWASP Security Hardening
 * 
 * This application implements:
 * 1. Rate limiting (IP + user-based, per-endpoint)
 * 2. Input validation & sanitization (all endpoints)
 * 3. Secure environment variable handling
 * 4. Security headers (Helmet)
 * 5. CORS policy enforcement
 * 6. Request logging and monitoring
 */

// Force override of environment variables to fix stale shell values
const result = dotenv.config({ override: true });
if (result.error) {
    console.error('Error loading .env file:', result.error);
} else {
    console.log('Environment variables loaded successfully');
    // Log DB URL for debugging (masked)
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
        console.log(`Database URL loaded: ${dbUrl.replace(/:[^:]*@/, ':****@')}`);
    } else {
        console.error('❌ DATABASE_URL is not defined!');
    }
}

// Log environment variable status for debugging
console.log('🔍 Checking environment variables...');
const missingVars: string[] = [];

if (!process.env.DATABASE_URL) {
    console.error('❌ WARNING: DATABASE_URL not set');
    missingVars.push('DATABASE_URL');
}
if (!process.env.JWT_SECRET) {
    console.error('❌ WARNING: JWT_SECRET not set');
    missingVars.push('JWT_SECRET');
}
if (!process.env.JWT_REFRESH_SECRET) {
    console.error('❌ WARNING: JWT_REFRESH_SECRET not set');
    missingVars.push('JWT_REFRESH_SECRET');
}

if (missingVars.length > 0) {
    console.error(`⚠️  Missing critical environment variables: ${missingVars.join(', ')}`);
    console.error('⚠️  App will start but some features will not work correctly.');
    console.error('⚠️  Please configure environment variables in your hosting platform.');
} else {
    console.log('✅ Environment variables loaded successfully');
}

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Render deployment (required for rate limiting)
app.set('trust proxy', 1);

/**
 * Health Check Endpoint - MUST be before CORS
 * Platform health checks (Render, AWS, etc.) don't send Origin headers
 * This endpoint MUST be accessible for monitoring and auto-scaling
 * Shows configuration status for debugging
 */
app.get('/health', (req: Request, res: Response) => {
    const envVarsConfigured = {
        DATABASE_URL: !!process.env.DATABASE_URL,
        JWT_SECRET: !!process.env.JWT_SECRET,
        JWT_REFRESH_SECRET: !!process.env.JWT_REFRESH_SECRET,
        ALLOWED_ORIGINS: !!process.env.ALLOWED_ORIGINS,
        NODE_ENV: process.env.NODE_ENV || 'not-set'
    };
    
    const allConfigured = envVarsConfigured.DATABASE_URL && 
                         envVarsConfigured.JWT_SECRET && 
                         envVarsConfigured.JWT_REFRESH_SECRET;
    
    res.status(200).json({ 
        status: allConfigured ? 'OK' : 'DEGRADED',
        message: allConfigured ? 'All systems operational' : 'Missing environment variables - configure in hosting platform',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'not-set',
        configuration: envVarsConfigured,
        ready: allConfigured
    });
});

/**
 * Security Middleware - Helmet
 * OWASP: Set security-related HTTP headers
 */
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true,
    },
    frameguard: {
        action: 'deny', // Prevent clickjacking
    },
    noSniff: true, // Prevent MIME type sniffing
    xssFilter: true, // Enable XSS filter
}));

/**
 * CORS Configuration
 * OWASP: Strict origin control - NO wildcards
 * 
 * Security:
 * - Only explicitly whitelisted origins are allowed
 * - No requests without origin are blocked (prevents CSRF)
 * - Credentials enabled for authenticated requests
 * - Proper preflight cache to reduce overhead
 */
app.use(cors({
    origin: (origin, callback) => {
        // In production, REJECT requests with no origin (prevents CSRF from non-browser clients)
        // In development, allow for testing with tools like Postman/curl
        if (!origin) {
            if (securityConfig.allowNoOriginRequests) {
                return callback(null, true);
            }
            logger.warn('CORS blocked request with no origin header');
            return callback(new Error('Origin header required'));
        }

        // Check if origin is explicitly whitelisted
        if (securityConfig.allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            logger.warn(`CORS blocked request from unauthorized origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Required for cookies/auth headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-admin-key'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'], // Allow frontend to read pagination headers
    maxAge: 86400, // 24 hours - cache preflight requests
}));

/**
 * Rate Limiting
 * OWASP: Apply general rate limiting to all API routes
 * Specific endpoints have stricter limits (see rateLimiter.ts)
 */
app.use('/api', generalLimiter);

/**
 * Body Parsing Middleware
 * OWASP: Limit payload size to prevent DoS attacks
 */
app.use(express.json({ limit: '1mb' })); // Reduced from 10mb
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

/**
 * Input Sanitization
 * OWASP: Sanitize all inputs to prevent XSS attacks
 */
app.use(sanitizeInput);

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
    logger.http(`${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// API info endpoint
app.get('/api', (req: Request, res: Response) => {
    res.json({
        message: 'Project Hub API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            domains: '/api/domains',
            projects: '/api/projects',
            user: '/api/user',
            'github-projects': '/api/github-projects'
        },
        status: 'running'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/user', userRoutes);
app.use('/api/github-projects', githubProjectRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use(notFoundHandler);

// Start server
app.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔒 CORS allowed origins: ${securityConfig.allowedOrigins.join(', ')}`);
    
    // Start GitHub project update service
    logger.info(`🔄 Starting GitHub Project Auto-Update Service...`);
    githubUpdateService.startScheduler();
});

export default app;
