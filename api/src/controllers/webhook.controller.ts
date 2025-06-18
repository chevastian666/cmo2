/**
 * Webhook Controller
 * Webhook management and delivery
 * By Cheva
 */

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import { webhookService } from '../services/webhook.service';
import { logger } from '../utils/logger';
import crypto from 'crypto';

export const getWebhooks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const webhooks = await webhookService.getAll(req.user?.companyId);
    res.json(webhooks);
  } catch (error) {
    next(error);
  }
};

export const createWebhook = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { url, events, secret, headers } = req.body;
    
    // Validate URL
    try {
      new URL(url);
    } catch {
      throw new ApiError(400, 'Invalid webhook URL');
    }
    
    // Validate events
    const validEvents = [
      'precinto.created',
      'precinto.updated',
      'precinto.activated',
      'precinto.deactivated',
      'transit.started',
      'transit.completed',
      'alert.created',
      'alert.resolved'
    ];
    
    const invalidEvents = events.filter((event: string) => !validEvents.includes(event));
    if (invalidEvents.length > 0) {
      throw new ApiError(400, `Invalid events: ${invalidEvents.join(', ')}`);
    }
    
    const webhook = await webhookService.create({
      url,
      events,
      secret: secret || crypto.randomBytes(32).toString('hex'),
      headers: headers || {},
      companyId: req.user?.companyId,
      createdBy: req.user?.id,
      active: true
    });
    
    logger.info(`Webhook created: ${webhook.id} for ${url}`);
    
    res.status(201).json(webhook);
  } catch (error) {
    next(error);
  }
};

export const updateWebhook = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const webhook = await webhookService.getById(id);
    
    if (!webhook) {
      throw new ApiError(404, 'Webhook not found');
    }
    
    // Check permissions
    if (req.user?.companyId && webhook.companyId !== req.user.companyId) {
      throw new ApiError(403, 'Access denied');
    }
    
    const updated = await webhookService.update(id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteWebhook = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const webhook = await webhookService.getById(id);
    
    if (!webhook) {
      throw new ApiError(404, 'Webhook not found');
    }
    
    // Check permissions
    if (req.user?.companyId && webhook.companyId !== req.user.companyId) {
      throw new ApiError(403, 'Access denied');
    }
    
    await webhookService.delete(id);
    
    logger.info(`Webhook deleted: ${id}`);
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const testWebhook = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { event } = req.body;
    
    const webhook = await webhookService.getById(id);
    
    if (!webhook) {
      throw new ApiError(404, 'Webhook not found');
    }
    
    // Check permissions
    if (req.user?.companyId && webhook.companyId !== req.user.companyId) {
      throw new ApiError(403, 'Access denied');
    }
    
    // Create test payload
    const testPayload = {
      event: event || 'test',
      data: {
        test: true,
        message: 'This is a test webhook delivery',
        timestamp: new Date()
      }
    };
    
    const result = await webhookService.deliver(webhook, testPayload);
    
    res.json({
      success: result.success,
      response: result.response,
      error: result.error,
      statusCode: result.statusCode,
      responseTime: result.responseTime
    });
  } catch (error) {
    next(error);
  }
};

export const getWebhookLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const webhook = await webhookService.getById(id);
    
    if (!webhook) {
      throw new ApiError(404, 'Webhook not found');
    }
    
    // Check permissions
    if (req.user?.companyId && webhook.companyId !== req.user.companyId) {
      throw new ApiError(403, 'Access denied');
    }
    
    const logs = await webhookService.getLogs(id, limit);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

export const receiveWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Verify webhook signature if present
    const signature = req.headers['x-webhook-signature'] as string;
    const secret = req.headers['x-webhook-secret'] as string;
    
    if (signature && secret) {
      const payload = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        throw new ApiError(401, 'Invalid webhook signature');
      }
    }
    
    logger.info('Webhook received:', {
      headers: req.headers,
      body: req.body
    });
    
    // Process webhook (this is just for testing)
    res.json({
      received: true,
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
};