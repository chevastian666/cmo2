/**
 * CMO API Server
 * REST API with Webhooks and Swagger Documentation
 * By Cheva
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { logger } from './utils/logger.js';
import { connectDatabases } from './utils/database.js';
import { initializeWebhooks } from './webhooks/webhookManager.js';
import routes from './routes/index.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO for real-time events
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true
  }
});

// Global middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Rate limiting
app.use('/api/', rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Swagger documentation
if (process.env.SWAGGER_ENABLED === 'true') {
  app.use(
    process.env.SWAGGER_PATH || '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'CMO API Documentation'
    })
  );
}

// API routes
app.use('/api/v1', routes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('subscribe', (channel) => {
    socket.join(channel);
    logger.debug(`Client ${socket.id} subscribed to ${channel}`);
  });
  
  socket.on('unsubscribe', (channel) => {
    socket.leave(channel);
    logger.debug(`Client ${socket.id} unsubscribed from ${channel}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

async function startServer() {
  try {
    // Connect to databases
    await connectDatabases();
    
    // Initialize webhook system
    await initializeWebhooks();
    
    // Start HTTP server
    httpServer.listen(PORT, HOST, () => {
      logger.info(`🚀 CMO API Server running at http://${HOST}:${PORT}`);
      logger.info(`📚 API Documentation available at http://${HOST}:${PORT}${process.env.SWAGGER_PATH || '/api-docs'}`);
      logger.info(`🔌 WebSocket server ready for real-time connections`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    logger.info('HTTP server closed');
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
startServer();

export { app, io };