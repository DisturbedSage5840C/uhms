/**
 * Application Configuration
 * Loads from environment variables with sensible defaults
 */
require('dotenv').config();

// Parse DATABASE_URL (provided by Railway, Render, Heroku etc.)
function parseDbUrl(url) {
    if (!url) return null;
    try {
        const u = new URL(url);
        return {
            host: u.hostname,
            port: parseInt(u.port || '5432'),
            database: u.pathname.replace(/^\//, ''),
            user: u.username,
            password: u.password,
        };
    } catch (_) { return null; }
}

// Parse REDIS_URL (provided by Railway, Render etc.)
function parseRedisUrl(url) {
    if (!url) return null;
    try {
        const u = new URL(url);
        return {
            host: u.hostname,
            port: parseInt(u.port || '6379'),
            password: u.password || undefined,
            db: parseInt(u.pathname.replace(/^\//, '') || '0'),
        };
    } catch (_) { return null; }
}

const dbFromUrl = parseDbUrl(process.env.DATABASE_URL);
const redisFromUrl = parseRedisUrl(process.env.REDIS_URL);

const config = {
    app: {
        port: parseInt(process.env.APP_PORT || process.env.PORT || '3001'),
        host: process.env.APP_HOST || '0.0.0.0',
        env: process.env.NODE_ENV || 'development',
        url: process.env.APP_URL || 'http://localhost:3001',
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
        expiry: process.env.JWT_EXPIRY || '7d',
        refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '30d',
    },

    db: {
        host: dbFromUrl?.host || process.env.DB_HOST || 'localhost',
        port: dbFromUrl?.port || parseInt(process.env.DB_PORT || '5432'),
        database: dbFromUrl?.database || process.env.DB_NAME || 'ilgc_tracker',
        user: dbFromUrl?.user || process.env.DB_USER || 'ilgc_admin',
        password: dbFromUrl?.password || process.env.DB_PASSWORD || 'password',
        pool: {
            min: parseInt(process.env.DB_POOL_MIN || '2'),
            max: parseInt(process.env.DB_POOL_MAX || '10'),
        },
        // Auto-enable SSL when DATABASE_URL is present (cloud providers require it)
        ssl: (process.env.DATABASE_URL || process.env.DB_SSL === 'true')
            ? { rejectUnauthorized: false } : false,
    },

    redis: {
        host: redisFromUrl?.host || process.env.REDIS_HOST || 'localhost',
        port: redisFromUrl?.port || parseInt(process.env.REDIS_PORT || '6379'),
        password: redisFromUrl?.password || process.env.REDIS_PASSWORD || undefined,
        db: redisFromUrl?.db || parseInt(process.env.REDIS_DB || '0'),
    },

    ai: {
        serviceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
        apiKey: process.env.AI_SERVICE_API_KEY || 'your-internal-ai-service-key',
    },

    upload: {
        maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760'),
        dir: process.env.UPLOAD_DIR || './uploads',
        allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
        authMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '20'),
    },

    cors: {
        origins: process.env.CORS_ORIGINS
            ? process.env.CORS_ORIGINS.split(',')
            : ['http://localhost:3000', 'http://localhost:8081'],
    },

    log: {
        level: process.env.LOG_LEVEL || 'info',
        dir: process.env.LOG_DIR || './logs',
    },

    metrics: {
        enabled: process.env.ENABLE_METRICS === 'true',
        port: parseInt(process.env.METRICS_PORT || '9090'),
    },
};

// Validate critical config in production
if (config.app.env === 'production') {
    const required = ['JWT_SECRET'];
    if (!process.env.DATABASE_URL) required.push('DB_PASSWORD');
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required env vars for production: ${missing.join(', ')}`);
    }
    if (config.jwt.secret === 'dev-secret-change-in-production') {
        throw new Error('JWT_SECRET must be changed in production');
    }
}

module.exports = config;
