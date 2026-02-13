/**
 * Logging Framework Usage Examples
 * Demonstrates how to use the logging framework in different scenarios
 */

// Basic usage example
const { logger, createChildLogger, httpLoggerMiddleware } = require('./config/logging.config');
const { 
  DatabaseLogger, 
  APILogger, 
  SecurityLogger, 
  BusinessLogger,
  PerformanceLogger,
  logStructuredError 
} = require('./config/logging.utils');

// ===== BASIC LOGGING EXAMPLES =====

// Simple logging
logger.info('Application started successfully');
logger.debug('Debug information', { userId: 123, action: 'login' });
logger.warn('This is a warning message');
logger.error('This is an error message');

// ===== MODULE-SPECIFIC LOGGING =====

// Create module-specific loggers
const authLogger = createChildLogger('authentication');
const userLogger = createChildLogger('user-management');

authLogger.info('User authentication attempt', { userId: 'user123' });
userLogger.debug('User profile updated', { userId: 'user123', fields: ['email', 'name'] });

// ===== EXPRESS.JS INTEGRATION EXAMPLE =====

const express = require('express');
const app = express();

// Add HTTP logging middleware
app.use(httpLoggerMiddleware);

// Example route with logging
app.get('/api/users/:id', async (req, res) => {
  const routeLogger = createChildLogger('users-api');
  
  try {
    routeLogger.info('Fetching user data', { userId: req.params.id });
    
    // Simulate database operation
    const user = await getUserById(req.params.id);
    
    routeLogger.info('User data retrieved successfully', { userId: req.params.id });
    res.json(user);
  } catch (error) {
    logStructuredError(error, { 
      route: '/api/users/:id', 
      userId: req.params.id,
      method: req.method 
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== DATABASE LOGGING EXAMPLE =====

const dbLogger = new DatabaseLogger();

async function getUserById(userId) {
  const startTime = Date.now();
  const query = 'SELECT * FROM users WHERE id = ?';
  
  try {
    dbLogger.logConnection('query_start', { userId });
    
    // Simulate database query
    const result = await executeQuery(query, [userId]);
    
    const executionTime = Date.now() - startTime;
    dbLogger.logQuery(query, [userId], executionTime);
    
    return result;
  } catch (error) {
    dbLogger.logError(error, query);
    throw error;
  }
}

// ===== API LOGGING EXAMPLE =====

const apiLogger = new APILogger('external-service');

async function callExternalAPI(endpoint, data) {
  const startTime = Date.now();
  
  try {
    apiLogger.logRequest('POST', endpoint, { 'Content-Type': 'application/json' }, data);
    
    // Simulate API call
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const duration = Date.now() - startTime;
    const responseData = await response.json();
    
    apiLogger.logResponse(response.status, responseData, duration);
    
    return responseData;
  } catch (error) {
    logStructuredError(error, { endpoint, data });
    throw error;
  }
}

// ===== SECURITY LOGGING EXAMPLE =====

const securityLogger = new SecurityLogger();

function handleUserLogin(credentials, req) {
  const { username, password } = credentials;
  const ip = req.ip;
  const userAgent = req.get('User-Agent');
  
  try {
    // Simulate authentication
    const user = authenticateUser(username, password);
    
    if (user) {
      securityLogger.logAuthAttempt(user.id, true, ip, userAgent);
      logger.info('User logged in successfully', { userId: user.id });
      return { success: true, user };
    } else {
      securityLogger.logAuthAttempt(username, false, ip, userAgent);
      logger.warn('Failed login attempt', { username, ip });
      return { success: false, error: 'Invalid credentials' };
    }
  } catch (error) {
    securityLogger.logSuspiciousActivity('Login system error', { username, ip, error: error.message });
    throw error;
  }
}

// ===== BUSINESS LOGIC LOGGING EXAMPLE =====

const orderLogger = new BusinessLogger('order-management');

async function processOrder(order) {
  const orderId = order.id;
  
  try {
    orderLogger.logEvent('order_received', { orderId, amount: order.total });
    orderLogger.logWorkflow('order_processing', 'validation', 'started', { orderId });
    
    // Validate order
    await validateOrder(order);
    orderLogger.logWorkflow('order_processing', 'validation', 'completed', { orderId });
    
    // Process payment
    orderLogger.logWorkflow('order_processing', 'payment', 'started', { orderId });
    const paymentResult = await processPayment(order);
    orderLogger.logWorkflow('order_processing', 'payment', 'completed', { 
      orderId, 
      paymentId: paymentResult.id 
    });
    
    // Ship order
    orderLogger.logWorkflow('order_processing', 'shipping', 'started', { orderId });
    const shipment = await createShipment(order);
    orderLogger.logWorkflow('order_processing', 'shipping', 'completed', { 
      orderId, 
      trackingNumber: shipment.trackingNumber 
    });
    
    orderLogger.logEvent('order_completed', { orderId, total: order.total });
    orderLogger.logMetric('order_value', order.total, 'USD', { status: 'completed' });
    
    return { success: true, orderId, trackingNumber: shipment.trackingNumber };
  } catch (error) {
    orderLogger.logEvent('order_failed', { orderId, error: error.message });
    logStructuredError(error, { orderId, orderData: order });
    throw error;
  }
}

// ===== PERFORMANCE LOGGING EXAMPLE =====

const perfLogger = new PerformanceLogger();

async function performHeavyOperation(data) {
  const operationId = `heavy_op_${Date.now()}`;
  
  perfLogger.startTimer(operationId);
  perfLogger.logMemoryUsage();
  
  try {
    // Simulate heavy computation
    const result = await heavyComputation(data);
    
    const duration = perfLogger.endTimer(operationId, { 
      dataSize: data.length,
      resultSize: result.length 
    });
    
    perfLogger.logCpuUsage();
    
    logger.info('Heavy operation completed', { 
      operationId, 
      duration: `${duration}ms`,
      efficiency: data.length / duration 
    });
    
    return result;
  } catch (error) {
    perfLogger.endTimer(operationId);
    logStructuredError(error, { operationId, dataSize: data.length });
    throw error;
  }
}

// ===== ERROR HANDLING EXAMPLES =====

// Global error handler
process.on('uncaughtException', (error) => {
  logStructuredError(error, { type: 'uncaughtException' });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logStructuredError(reason, { 
    type: 'unhandledRejection',
    promise: promise.toString() 
  });
});

// Express error handler
app.use((error, req, res, next) => {
  logStructuredError(error, {
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query
  });
  
  res.status(500).json({ error: 'Internal server error' });
});

// ===== UTILITY FUNCTIONS (Simulated) =====

async function executeQuery(query, params) {
  // Simulate database query
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id: params[0], name: 'John Doe' }), 100);
  });
}

function authenticateUser(username, password) {
  // Simulate authentication
  if (username === 'admin' && password === 'password') {
    return { id: 'user123', username: 'admin' };
  }
  return null;
}

async function validateOrder(order) {
  // Simulate order validation
  return new Promise((resolve) => {
    setTimeout(resolve, 50);
  });
}

async function processPayment(order) {
  // Simulate payment processing
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id: 'payment123' }), 200);
  });
}

async function createShipment(order) {
  // Simulate shipment creation
  return new Promise((resolve) => {
    setTimeout(() => resolve({ trackingNumber: 'TRACK123' }), 100);
  });
}

async function heavyComputation(data) {
  // Simulate heavy computation
  return new Promise((resolve) => {
    setTimeout(() => resolve(data.map(x => x * 2)), 500);
  });
}

module.exports = {
  app,
  getUserById,
  callExternalAPI,
  handleUserLogin,
  processOrder,
  performHeavyOperation
};