/**
 * Webhook Routes
 * Webhook management and configuration
 * By Cheva
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as webhookController from '../controllers/webhook.controller';
import { webhookRateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @swagger
 * /webhooks:
 *   get:
 *     summary: List all configured webhooks
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of webhooks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   url:
 *                     type: string
 *                   events:
 *                     type: array
 *                     items:
 *                       type: string
 *                   active:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.get('/', authenticate, authorize('admin'), webhookController.getWebhooks);

/**
 * @swagger
 * /webhooks:
 *   post:
 *     summary: Register a new webhook
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *               - events
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: Webhook endpoint URL
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [precinto.created, precinto.updated, transit.started, transit.completed, alert.created, alert.resolved]
 *                 description: Events to subscribe to
 *               secret:
 *                 type: string
 *                 description: Optional secret for HMAC signature validation
 *               headers:
 *                 type: object
 *                 description: Custom headers to send with webhook
 *     responses:
 *       201:
 *         description: Webhook registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 url:
 *                   type: string
 *                 events:
 *                   type: array
 *                   items:
 *                     type: string
 *                 secret:
 *                   type: string
 *                 active:
 *                   type: boolean
 */
router.post('/', authenticate, authorize('admin'), webhookController.createWebhook);

/**
 * @swagger
 * /webhooks/{id}:
 *   put:
 *     summary: Update webhook configuration
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *               active:
 *                 type: boolean
 *               headers:
 *                 type: object
 *     responses:
 *       200:
 *         description: Webhook updated
 */
router.put('/:id', authenticate, authorize('admin'), webhookController.updateWebhook);

/**
 * @swagger
 * /webhooks/{id}:
 *   delete:
 *     summary: Delete webhook
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Webhook deleted
 */
router.delete('/:id', authenticate, authorize('admin'), webhookController.deleteWebhook);

/**
 * @swagger
 * /webhooks/{id}/test:
 *   post:
 *     summary: Test webhook with sample payload
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 enum: [precinto.created, precinto.updated, transit.started, transit.completed, alert.created, alert.resolved]
 *     responses:
 *       200:
 *         description: Test result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 response:
 *                   type: object
 *                 error:
 *                   type: string
 */
router.post('/:id/test', authenticate, authorize('admin'), webhookController.testWebhook);

/**
 * @swagger
 * /webhooks/{id}/logs:
 *   get:
 *     summary: Get webhook delivery logs
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Webhook delivery logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   event:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [success, failed, pending]
 *                   statusCode:
 *                     type: integer
 *                   responseTime:
 *                     type: integer
 *                   error:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 */
router.get('/:id/logs', authenticate, authorize('admin'), webhookController.getWebhookLogs);

// Webhook receiver endpoint (for testing incoming webhooks)
router.post('/receive', webhookRateLimiter, webhookController.receiveWebhook);

export default router;