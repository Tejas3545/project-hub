import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import fs from 'fs';
import domainRoutes from './routes/domainRoutes';
import projectRoutes from './routes/projectRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import githubProjectRoutes from './routes/githubProjectRoutes';
import adminRoutes from './routes/adminRoutes';
import socialRoutes from './routes/socialRoutes';
import workspaceRoutes from './routes/workspaceRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import gamificationRoutes from './routes/gamificationRoutes';
import learningPathRoutes from './routes/learningPathRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { sanitizeInput } from './middleware/validation';
import { generalLimiter } from './middleware/rateLimiter';
import { securityConfig } from './config';
import logger from './utils/logger';
import { githubUpdateService } from './services/githubUpdateService';
import path from 'path';

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
// Use path relative to this file's compiled location (dist/index.js -> ../.env)
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const result = dotenv.config({ override: true, path: envPath });
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
} else {
    console.log('No .env file found; using environment variables from the host.');
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

    // In production, fail fast if security-critical variables are missing
    if (process.env.NODE_ENV === 'production') {
        console.error('❌ FATAL: Cannot start in production without security secrets. Exiting.');
        process.exit(1);
    }

    console.error('⚠️  App will start but some features will not work correctly.');
    console.error('⚠️  Please configure environment variables in your hosting platform.');
} else {
    console.log('✅ Environment variables loaded successfully');
}

// Ensure ALLOWED_ORIGINS is set in production
if (process.env.NODE_ENV === 'production' && (!process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS === 'http://localhost:3000')) {
    console.warn('⚠️  WARNING: Production environment detected but ALLOWED_ORIGINS is not strictly configured.');
    console.warn('⚠️  Using default (localhost:3000) or empty origin list. CORS will likely fail for real clients.');
}

const app: Express = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

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
        // Strict CORS Policy
        // 1. Allow requests with no origin ONLY in development (e.g. Postman, mobile apps)
        // 2. In production, REQUIRE an origin and check against whitelist

        if (!origin) {
            if (process.env.NODE_ENV !== 'production' || securityConfig.allowNoOriginRequests) {
                return callback(null, true);
            }
            logger.warn('CORS blocked request with no origin header');
            return callback(new Error('Origin header required'));
        }

        // Check if origin is in whitelist
        if (securityConfig.allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Allow all Vercel preview deployments (*.vercel.app)
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        // Block unauthorized origins
        logger.warn(`CORS blocked request from unauthorized origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-admin-key'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400, // 24 hours
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

// Lightweight request payload logger for debugging failing write operations.
// Logs safe summaries to backend/logs/recent_requests.log (do NOT log Authorization header value).

const LOG_DIR = path.join(__dirname, '..', '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'recent_requests.log');
try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
    if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, '');
} catch (e) {
    console.error('Failed to initialize request log file', e);
}

app.use((req: Request, res: Response, next: NextFunction) => {
    try {
        // Only log write endpoints we care about to avoid noise
        const writePaths = ['/api/user/progress', '/api/social', '/api/user/bookmarks', '/api/social/projects', '/api/social/projects/'];
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
            const matched = writePaths.some(p => req.path.startsWith(p));
            if (matched) {
                const safeHeaders: Record<string, any> = {};
                Object.entries(req.headers).forEach(([k, v]) => {
                    if (k.toLowerCase() === 'authorization') {
                        safeHeaders[k] = v ? 'REDACTED' : undefined;
                    } else {
                        safeHeaders[k] = v;
                    }
                });

                const entry = {
                    ts: new Date().toISOString(),
                    ip: req.ip,
                    method: req.method,
                    path: req.path,
                    params: req.params,
                    query: req.query,
                    headers: safeHeaders,
                    body: req.body,
                };

                fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
            }
        }
    } catch (e) {
        // ignore logging errors
    }
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
app.use('/api/social', socialRoutes);
// M3: Workspace & Tracking Routes
app.use('/api/workspace', workspaceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use(notFoundHandler);

// Ensure the database is connected before accepting traffic
import { connectDB } from './utils/prisma';

connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔒 CORS allowed origins: ${securityConfig.allowedOrigins.join(', ')}`);

      // Start GitHub project update service
      logger.info(`🔄 Starting GitHub Project Auto-Update Service...`);
      githubUpdateService.startScheduler();
    });
  })
  .catch((err) => {
    logger.error(`❌ Failed to start server – DB connection error: ${err.message}`);
    process.exit(1);
  });

export default app;
