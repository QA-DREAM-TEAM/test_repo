/**
 * Logging Utilities and Helper Functions
 * Additional utilities for enhanced logging functionality
 */

const { logger, createChildLogger, logError, logPerformance } = require('./logging.config');

/**
 * Database logging utility
 * For logging database operations and performance
 */
class DatabaseLogger {
  constructor() {
    this.dbLogger = createChildLogger('database');
  }

  logQuery(query, params = [], executionTime = null) {
    this.dbLogger.debug('Database Query', {
      query: query.replace(/\s+/g, ' ').trim(),
      params,
      executionTime: executionTime ? `${executionTime}ms` : null
    });
  }

  logConnection(action, details = {}) {
    this.dbLogger.info(`Database ${action}`, details);
  }

  logError(error, query = null) {
    this.dbLogger.error('Database Error', {
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack
      },
      query
    });
  }
}

/**
 * API logging utility
 * For logging API calls and responses
 */
class APILogger {
  constructor(serviceName) {
    this.apiLogger = createChildLogger('api', { service: serviceName });
  }

  logRequest(method, url, headers = {}, body = null) {
    this.apiLogger.http('API Request', {
      method,
      url,
      headers: this._sanitizeHeaders(headers),
      body: this._sanitizeBody(body)
    });
  }

  logResponse(status, data = null, duration = null) {
    this.apiLogger.http('API Response', {
      status,
      duration: duration ? `${duration}ms` : null,
      dataSize: data ? JSON.stringify(data).length : 0
    });
  }

  logRateLimit(limit, remaining, resetTime) {
    this.apiLogger.warn('API Rate Limit Info', {
      limit,
      remaining,
      resetTime: new Date(resetTime).toISOString()
    });
  }

  _sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  _sanitizeBody(body) {
    if (!body) return null;
    
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'credential'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}

/**
 * Security logging utility
 * For logging security-related events
 */
class SecurityLogger {
  constructor() {
    this.secLogger = createChildLogger('security');
  }

  logAuthAttempt(userId, success, ip, userAgent) {
    const level = success ? 'info' : 'warn';
    this.secLogger[level]('Authentication Attempt', {
      userId,
      success,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    });
  }

  logPermissionDenied(userId, resource, action, ip) {
    this.secLogger.warn('Permission Denied', {
      userId,
      resource,
      action,
      ip,
      timestamp: new Date().toISOString()
    });
  }

  logSuspiciousActivity(description, details = {}) {
    this.secLogger.error('Suspicious Activity', {
      description,
      details,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Business logic logger
 * For logging business events and workflows
 */
class BusinessLogger {
  constructor(domain) {
    this.businessLogger = createChildLogger('business', { domain });
  }

  logEvent(eventName, eventData = {}) {
    this.businessLogger.info('Business Event', {
      event: eventName,
      data: eventData,
      timestamp: new Date().toISOString()
    });
  }

  logWorkflow(workflowName, step, status, data = {}) {
    this.businessLogger.info('Workflow Step', {
      workflow: workflowName,
      step,
      status,
      data,
      timestamp: new Date().toISOString()
    });
  }

  logMetric(metricName, value, unit = null, tags = {}) {
    this.businessLogger.info('Business Metric', {
      metric: metricName,
      value,
      unit,
      tags,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Performance monitoring utility
 */
class PerformanceLogger {
  constructor() {
    this.perfLogger = createChildLogger('performance');
    this.timers = new Map();
  }

  startTimer(operationId) {
    this.timers.set(operationId, Date.now());
  }

  endTimer(operationId, additionalData = {}) {
    const startTime = this.timers.get(operationId);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.perfLogger.verbose('Performance Timer', {
        operation: operationId,
        duration: `${duration}ms`,
        ...additionalData
      });
      this.timers.delete(operationId);
      return duration;
    }
    return null;
  }

  logMemoryUsage() {
    const memUsage = process.memoryUsage();
    this.perfLogger.debug('Memory Usage', {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)} MB`
    });
  }

  logCpuUsage() {
    const cpuUsage = process.cpuUsage();
    this.perfLogger.debug('CPU Usage', {
      user: `${cpuUsage.user / 1000}ms`,
      system: `${cpuUsage.system / 1000}ms`
    });
  }
}

/**
 * Structured error logging with context
 */
const logStructuredError = (error, context = {}) => {
  const errorDetails = {
    message: error.message,
    name: error.name,
    stack: error.stack,
    code: error.code,
    statusCode: error.statusCode,
    context,
    timestamp: new Date().toISOString()
  };

  logger.error('Structured Error', errorDetails);
  return errorDetails;
};

/**
 * Health check logging
 */
const logHealthCheck = (service, status, details = {}) => {
  const level = status === 'healthy' ? 'info' : 'error';
  logger[level]('Health Check', {
    service,
    status,
    details,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  DatabaseLogger,
  APILogger,
  SecurityLogger,
  BusinessLogger,
  PerformanceLogger,
  logStructuredError,
  logHealthCheck
};