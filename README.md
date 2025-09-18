# Node.js Logging Framework

A comprehensive, production-ready logging framework built on Winston for Node.js applications. This framework provides structured logging, performance monitoring, security auditing, and business event tracking capabilities.

## 🚀 Features

- **Structured Logging**: JSON-formatted logs with consistent schema
- **Multiple Transports**: Console, file, and external service integration
- **Environment-Based Configuration**: Different settings for development/production
- **Performance Monitoring**: Built-in performance tracking and metrics
- **Security Auditing**: Specialized logging for authentication and security events
- **Business Event Tracking**: Domain-specific business logic logging
- **Express.js Integration**: HTTP request/response logging middleware
- **Error Handling**: Comprehensive error logging with context
- **Log Rotation**: Automatic log file rotation and archival
- **Sensitive Data Protection**: Automatic sanitization of sensitive information

## 📦 Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your specific configuration
   ```

## 🏗️ Project Structure

```
├── config/
│   ├── logging.config.js      # Main logging configuration
│   └── logging.utils.js       # Specialized logging utilities
├── examples/
│   └── logging-examples.js    # Usage examples and patterns
├── logs/                      # Log files directory (auto-created)
├── .env.example              # Environment configuration template
├── package.json              # Dependencies and scripts
└── README.md                 # This documentation
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Application environment |
| `LOG_LEVEL` | `debug` (dev) / `info` (prod) | Minimum log level |
| `LOG_DIR` | `logs` | Directory for log files |
| `SERVICE_NAME` | `nodejs-app` | Service identifier |
| `ENABLE_CONSOLE_LOG` | `true` | Enable console output |
| `ENABLE_HTTP_LOG` | `false` | Enable HTTP request logging |

### Log Levels

- `error`: Error conditions
- `warn`: Warning conditions
- `info`: Informational messages
- `http`: HTTP request/response logs
- `verbose`: Verbose informational messages
- `debug`: Debug-level messages
- `silly`: Very detailed debug information

## 🎯 Quick Start

### Basic Usage

```javascript
const { logger } = require('./config/logging.config');

// Simple logging
logger.info('Application started');
logger.debug('Debug information', { userId: 123 });
logger.warn('Warning message');
logger.error('Error occurred', { error: 'details' });
```

### Module-Specific Logging

```javascript
const { createChildLogger } = require('./config/logging.config');

const authLogger = createChildLogger('authentication');
authLogger.info('User login attempt', { userId: 'user123' });
```

### Express.js Integration

```javascript
const express = require('express');
const { httpLoggerMiddleware } = require('./config/logging.config');

const app = express();
app.use(httpLoggerMiddleware);
```

## 🏭 Advanced Usage

### Database Logging

```javascript
const { DatabaseLogger } = require('./config/logging.utils');

const dbLogger = new DatabaseLogger();
dbLogger.logQuery('SELECT * FROM users WHERE id = ?', [123], 45);
dbLogger.logConnection('pool_created', { maxConnections: 10 });
```

### API Call Logging

```javascript
const { APILogger } = require('./config/logging.utils');

const apiLogger = new APILogger('external-service');
apiLogger.logRequest('POST', '/api/users', headers, data);
apiLogger.logResponse(200, responseData, 150);
```

### Security Event Logging

```javascript
const { SecurityLogger } = require('./config/logging.utils');

const secLogger = new SecurityLogger();
secLogger.logAuthAttempt('user123', true, '192.168.1.1', 'Mozilla/5.0...');
secLogger.logPermissionDenied('user123', '/admin', 'read', '192.168.1.1');
```

### Business Event Tracking

```javascript
const { BusinessLogger } = require('./config/logging.utils');

const orderLogger = new BusinessLogger('order-management');
orderLogger.logEvent('order_created', { orderId: 'ORD-123', amount: 99.99 });
orderLogger.logWorkflow('payment', 'validation', 'completed', { orderId: 'ORD-123' });
orderLogger.logMetric('revenue', 99.99, 'USD', { product: 'premium' });
```

### Performance Monitoring

```javascript
const { PerformanceLogger } = require('./config/logging.utils');

const perfLogger = new PerformanceLogger();
perfLogger.startTimer('database_query');
// ... perform operation
perfLogger.endTimer('database_query', { queryType: 'SELECT' });
perfLogger.logMemoryUsage();
```

### Error Logging with Context

```javascript
const { logStructuredError } = require('./config/logging.utils');

try {
  // Some operation that might fail
} catch (error) {
  logStructuredError(error, {
    operation: 'user_creation',
    userId: 'user123',
    inputData: { email: 'user@example.com' }
  });
}
```

## 🗂️ Log File Structure

### File Organization

- `logs/error.log` - Error-level messages only
- `logs/combined.log` - All log messages
- `logs/http.log` - HTTP request/response logs (if enabled)

### Log Format

```json
{
  "timestamp": "2025-09-18 10:30:45.123",
  "level": "info",
  "message": "User logged in successfully",
  "service": "nodejs-app",
  "version": "1.0.0",
  "environment": "production",
  "module": "authentication",
  "userId": "user123",
  "ip": "192.168.1.1"
}
```

## 🔒 Security Considerations

### Sensitive Data Protection

The framework automatically sanitizes sensitive fields:

- Passwords and tokens in request bodies
- Authorization headers
- Cookie values
- API keys

### Configuration

```javascript
// Sensitive fields are automatically redacted
const sanitizedBody = {
  "username": "john_doe",
  "password": "[REDACTED]",
  "email": "john@example.com"
};
```

## 📊 Monitoring and Alerting

### Log Metrics

The framework can integrate with monitoring systems:

- Error rate monitoring
- Performance metrics tracking
- Business event analytics
- Health check reporting

### External Integrations

Supported log aggregation services:

- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Splunk**
- **DataDog**
- **AWS CloudWatch**
- **Custom HTTP endpoints**

## 🛠️ Development

### npm Scripts

```bash
npm run dev           # Run in development mode
npm run prod          # Run in production mode
npm run logs:clean    # Clean log files
npm run logs:tail     # Tail combined log
npm run logs:errors   # Tail error log
npm test              # Run tests
npm run lint          # Run ESLint
```

## 📈 Best Practices

### 1. Use Appropriate Log Levels

```javascript
logger.error('Critical system failure');    // Use for errors
logger.warn('Deprecated API usage');        // Use for warnings
logger.info('User action completed');       // Use for important events
logger.debug('Variable state', { var: x }); // Use for debugging
```

### 2. Include Contextual Information

```javascript
// Good: Include relevant context
logger.info('Order processed', {
  orderId: 'ORD-123',
  userId: 'user456',
  amount: 99.99,
  paymentMethod: 'credit_card'
});

// Avoid: Vague messages without context
logger.info('Order processed');
```

### 3. Use Structured Logging

```javascript
// Good: Structured data
logger.info('API call completed', {
  endpoint: '/api/users',
  method: 'GET',
  statusCode: 200,
  duration: 150,
  userId: 'user123'
});

// Avoid: String concatenation
logger.info(`API call to /api/users completed in 150ms for user123`);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/logging-framework`
3. Make your changes
4. Add tests for new functionality
5. Run linting: `npm run lint`
6. Commit your changes: `git commit -m 'Add logging framework'`
7. Push to the branch: `git push origin feature/logging-framework`
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:

1. Check the [examples](examples/logging-examples.js)
2. Open an issue on GitHub
3. Contact the development team

---

**Version**: 1.0.0  
**Last Updated**: September 18, 2025  
**Maintainer**: QA-DREAM-TEAM
