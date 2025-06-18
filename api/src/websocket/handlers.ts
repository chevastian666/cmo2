/**
 * WebSocket Handlers
 * Real-time event handling with Socket.IO
 * By Cheva
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    email: string;
    role: string;
    companyId?: string;
  };
}

export const setupWebSocketHandlers = (io: SocketIOServer): void => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, config.jwt.secret) as any;
      socket.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        companyId: decoded.companyId
      };

      // Join company room if applicable
      if (decoded.companyId) {
        socket.join(`company:${decoded.companyId}`);
      }

      // Join user-specific room
      socket.join(`user:${decoded.id}`);

      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`WebSocket client connected: ${socket.user?.email} (${socket.id})`);

    // Subscribe to precinto updates
    socket.on('subscribe:precinto', (precintoId: string) => {
      socket.join(`precinto:${precintoId}`);
      logger.debug(`Client ${socket.id} subscribed to precinto ${precintoId}`);
    });

    // Unsubscribe from precinto updates
    socket.on('unsubscribe:precinto', (precintoId: string) => {
      socket.leave(`precinto:${precintoId}`);
      logger.debug(`Client ${socket.id} unsubscribed from precinto ${precintoId}`);
    });

    // Subscribe to transit updates
    socket.on('subscribe:transit', (transitId: string) => {
      socket.join(`transit:${transitId}`);
      logger.debug(`Client ${socket.id} subscribed to transit ${transitId}`);
    });

    // Subscribe to alerts
    socket.on('subscribe:alerts', () => {
      socket.join('alerts');
      if (socket.user?.companyId) {
        socket.join(`alerts:${socket.user.companyId}`);
      }
    });

    // Handle location updates
    socket.on('location:update', async (data: {
      precintoId: string;
      lat: number;
      lng: number;
    }) => {
      try {
        // Broadcast to all clients subscribed to this precinto
        io.to(`precinto:${data.precintoId}`).emit('location:updated', {
          precintoId: data.precintoId,
          location: {
            lat: data.lat,
            lng: data.lng,
            timestamp: new Date()
          }
        });

        logger.debug(`Location update for precinto ${data.precintoId}`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`WebSocket client disconnected: ${socket.user?.email} (${socket.id})`);
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error('WebSocket error:', error);
    });
  });

  // Emit functions for server-side events
  const emitPrecintoUpdate = (precintoId: string, data: any) => {
    io.to(`precinto:${precintoId}`).emit('precinto:updated', data);
  };

  const emitTransitUpdate = (transitId: string, data: any) => {
    io.to(`transit:${transitId}`).emit('transit:updated', data);
  };

  const emitAlert = (data: any) => {
    io.to('alerts').emit('alert:new', data);
    if (data.companyId) {
      io.to(`alerts:${data.companyId}`).emit('alert:new', data);
    }
  };

  const emitToCompany = (companyId: string, event: string, data: any) => {
    io.to(`company:${companyId}`).emit(event, data);
  };

  const emitToUser = (userId: string, event: string, data: any) => {
    io.to(`user:${userId}`).emit(event, data);
  };

  // Export emit functions for use in other parts of the application
  (global as any).wsEmitters = {
    emitPrecintoUpdate,
    emitTransitUpdate,
    emitAlert,
    emitToCompany,
    emitToUser
  };
};