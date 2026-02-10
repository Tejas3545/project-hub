import winston from 'winston';
import { isProd } from '../config';

const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const logColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

winston.addColors(logColors);

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

const transports: winston.transport[] = [
    new winston.transports.Console(),
];

// In production, also log to file
if (isProd) {
    transports.push(
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
        })
    );
    transports.push(
        new winston.transports.File({
            filename: 'logs/combined.log',
        })
    );
}

const logger = winston.createLogger({
    level: isProd ? 'info' : 'debug',
    levels: logLevels,
    format,
    transports,
});

export default logger;

// Security event logger
export const logSecurityEvent = (event: string, details: any) => {
    logger.warn(`SECURITY: ${event}`, { details, timestamp: new Date().toISOString() });
};
