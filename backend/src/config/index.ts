import dotenv from 'dotenv';

dotenv.config();

// Warn about missing critical secrets but use placeholders to allow app to start
// This enables health checks to work even if env vars aren't configured yet
let jwtSecretWarning = false;
let jwtRefreshSecretWarning = false;

if (!process.env.JWT_SECRET) {
    console.error('⚠️  CRITICAL: JWT_SECRET environment variable is not defined.');
    console.error('⚠️  Using placeholder. Authentication WILL NOT WORK.');
    jwtSecretWarning = true;
}
if (!process.env.JWT_REFRESH_SECRET) {
    console.error('⚠️  CRITICAL: JWT_REFRESH_SECRET environment variable is not defined.');
    console.error('⚠️  Using placeholder. Token refresh WILL NOT WORK.');
    jwtRefreshSecretWarning = true;
}

export const authConfig = {
    jwtSecret: process.env.JWT_SECRET || 'MISSING_JWT_SECRET_CONFIGURE_IN_ENVIRONMENT',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'MISSING_JWT_REFRESH_SECRET_CONFIGURE_IN_ENVIRONMENT',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    isConfigured: !jwtSecretWarning && !jwtRefreshSecretWarning,
};

export const securityConfig = {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    allowNoOriginRequests: process.env.ALLOW_NO_ORIGIN_REQUESTS === 'true' || process.env.NODE_ENV === 'development',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Limit each IP to 100 requests per windowMs
};

export const isProd = process.env.NODE_ENV === 'production';

