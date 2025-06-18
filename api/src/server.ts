/**
 * CMO REST API Server
 * Main server configuration with Express, Swagger, and Socket.IO
 * By Cheva
 */

import express, { Application } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/config';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';
import { setupWebSocketHandlers } from './websocket/handlers';
import routes from './routes';

// Initialize Express app
const app: Application = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.cors.origin.split(','),
    credentials: true
  },
  path: config.socket.path
});

// Basic middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: config.cors.origin.split(','),
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'CMO API Documentation',
  customfavIcon: '/favicon.ico'
}));

// Rate limiting
app.use(`${config.api.prefix}/`, rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env
  });
});

// API Routes
app.use(config.api.prefix, routes);

// WebSocket handlers
setupWebSocketHandlers(io);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString()
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to databases
    await connectDatabase();
    
    // Start HTTP server
    httpServer.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📚 API Documentation available at http://localhost:${config.port}/api-docs`);
      logger.info(`🔌 WebSocket server ready`);
      logger.info(`🌍 Environment: ${config.env}`);
    });
  } catch (_error) {
    logger.error('Failed to start server:', _error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (_error) => {
  logger.error('Uncaught Exception:', _error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (_error) => {
  logger.error('Unhandled Rejection:', _error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();

export { app, io };