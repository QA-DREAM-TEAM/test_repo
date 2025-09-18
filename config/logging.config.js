/**
 * Node.js Logging Configuration Framework
 * Comprehensive Winston-based logging setup for all repositories
 */

const winston = require('winston');
const path = require('path');

// Log levels configuration
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

// Color scheme for console output
const LOG_COLORS = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'cyan',
  debug: 'blue',
  silly: 'grey'
};

// Environment-based configuration
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug');
const LOG_DIR = process.env.LOG_DIR || 'logs';

// Ensure logs directory exists
const fs = require('fs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Custom log format for structured logging
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    const serviceStr = service ? `[${service}]` : '';
    return `${timestamp} ${level} ${serviceStr}: ${message} ${metaStr}`;
  })
);

// Transport configurations
const transports = [];

// Console transport (always enabled in development)
if (NODE_ENV !== 'production' || process.env.ENABLE_CONSOLE_LOG === 'true') {
  transports.push(
    new winston.transports.Console({
      level: LOG_LEVEL,
      format: consoleFormat
    })
  );
}

// File transports for production and error logging
transports.push(
  // Error log file
  new winston.transports.File({
    filename: path.join(LOG_DIR, 'error.log'),
    level: 'error',
    format: logFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true
  }),
  
  // Combined log file
  new winston.transports.File({
    filename: path.join(LOG_DIR, 'combined.log'),
    level: LOG_LEVEL,
    format: logFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
    tailable: true
  })
);

// Add HTTP log file for web applications
if (process.env.ENABLE_HTTP_LOG === 'true') {
  transports.push(
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'http.log'),
      level: 'http',
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    })
  );
}

// Main logger configuration
const logger = winston.createLogger({
  levels: LOG_LEVELS,
  level: LOG_LEVEL,
  format: logFormat,
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'nodejs-app',
    version: process.env.APP_VERSION || '1.0.0',
    environment: NODE_ENV
  },
  transports,
  exitOnError: false
});

// Add colors to winston
winston.addColors(LOG_COLORS);

// Create child loggers for different modules
const createChildLogger = (moduleName, additionalMeta = {}) => {
  return logger.child({
    module: moduleName,
    ...additionalMeta
  });
};

// Express.js middleware for HTTP request logging
const httpLoggerMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.http('HTTP Request', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    requestId: req.headers['x-request-id'] || Math.random().toString(36).substr(2, 9)
  });
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http('HTTP Response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.headers['x-request-id']
    });
  });
  
  next();
};

// Error logging helper
const logError = (error, context = {}) => {
  logger.error('Application Error', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    context
  });
};

// Performance logging helper
const logPerformance = (operation, startTime, additionalData = {}) => {
  const duration = Date.now() - startTime;
  logger.verbose('Performance Metric', {
    operation,
    duration: `${duration}ms`,
    ...additionalData
  });
};

module.exports = {
  logger,
  createChildLogger,
  httpLoggerMiddleware,
  logError,
  logPerformance,
  LOG_LEVELS,
  LOG_COLORS
};