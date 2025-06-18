/**
 * Webhooks Routes
 * By Cheva
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';
import { webhookManager } from '../webhooks/webhookManager.js';
import { validateWebhook } from '../validators/webhooks.validator.js';

const router = Router();

/**
 * @swagger
 * /webhooks:
 *   get:
 *     summary: List all webhooks
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
 *                 $ref: '#/components/schemas/Webhook'
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const webhooks = await webhookManager.constructor.prototype.findAll();
  res.json(webhooks);
}));

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
 *                   enum: [alerta.created, alerta.updated, transito.started, transito.completed, transito.delayed, precinto.tampered]
 *                 description: Events to subscribe to
 *               headers:
 *                 type: object
 *                 description: Custom headers to send with webhook
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Webhook created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Webhook'
 */
router.post('/', authenticate, authorize('admin'), validateWebhook, asyncHandler(async (req, res) => {
  const webhook = await webhookManager.register(req.body);
  res.status(201).json(webhook);
}));

/**
 * @swagger
 * /webhooks/{id}:
 *   get:
 *     summary: Get webhook details
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Webhook details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Webhook'
 */
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const webhook = await webhookManager.constructor.prototype.findById(req.params.id);
  if (!webhook) {
    throw ApiError.notFound('Webhook not found');
  }
  res.json(webhook);
}));

/**
 * @swagger
 * /webhooks/{id}:
 *   put:
 *     summary: Update webhook
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
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
 *               headers:
 *                 type: object
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Webhook updated
 */
router.put('/:id', authenticate, authorize('admin'), validateWebhook, asyncHandler(async (req, res) => {
  const webhook = await webhookManager.update(req.params.id, req.body);
  res.json(webhook);
}));

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
 *           format: uuid
 *     responses:
 *       204:
 *         description: Webhook deleted
 */
router.delete('/:id', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  await webhookManager.delete(req.params.id);
  res.status(204).send();
}));

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
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 default: test
 *               payload:
 *                 type: object
 *                 default: { test: true }
 *     responses:
 *       200:
 *         description: Test webhook sent
 */
router.post('/:id/test', authenticate, asyncHandler(async (req, res) => {
  const { event = 'test', payload = { test: true, timestamp: new Date() } } = req.body;
  
  await webhookManager.trigger(event, {
    ...payload,
    _test: true
  });

  res.json({ message: 'Test webhook queued for delivery' });
}));

/**
 * @swagger
 * /webhooks/{id}/stats:
 *   get:
 *     summary: Get webhook delivery statistics
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Webhook statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 successful:
 *                   type: integer
 *                 failed:
 *                   type: integer
 *                 pending:
 *                   type: integer
 *                 averageResponseTime:
 *                   type: number
 *                 lastDelivery:
 *                   type: object
 */
router.get('/:id/stats', authenticate, asyncHandler(async (req, res) => {
  const stats = await webhookManager.getStats(req.params.id);
  res.json(stats);
}));

/**
 * @swagger
 * /webhooks/{id}/deliveries:
 *   get:
 *     summary: Get webhook delivery history
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, success, failed]
 *     responses:
 *       200:
 *         description: Delivery history
 */
router.get('/:id/deliveries', authenticate, asyncHandler(async (req, res) => {
  const { limit = 20, status } = req.query;
  
  const where = { webhookId: req.params.id };
  if (status) where.status = status;

  const deliveries = await webhookManager.constructor.prototype.findDeliveries({
    where,
    limit: parseInt(limit),
    order: [['createdAt', 'DESC']]
  });

  res.json(deliveries);
}));

/**
 * @swagger
 * /webhooks/events:
 *   get:
 *     summary: List all available webhook events
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: Available events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       payload:
 *                         type: object
 */
router.get('/events', asyncHandler(async (req, res) => {
  const events = [
    {
      name: 'alerta.created',
      description: 'Triggered when a new alert is created',
      payload: {
        alerta: {
          id: 'uuid',
          tipo: 'string',
          severidad: 'string',
          mensaje: 'string',
          precintoId: 'uuid',
          transitoId: 'uuid',
          ubicacion: { lat: 'number', lng: 'number' },
          createdAt: 'datetime'
        }
      }
    },
    {
      name: 'alerta.updated',
      description: 'Triggered when an alert is updated',
      payload: {
        alerta: 'object',
        changes: 'object'
      }
    },
    {
      name: 'transito.started',
      description: 'Triggered when a transit begins',
      payload: {
        transito: 'object',
        precinto: 'object'
      }
    },
    {
      name: 'transito.completed',
      description: 'Triggered when a transit is completed',
      payload: {
        transito: 'object',
        duration: 'number',
        onTime: 'boolean'
      }
    },
    {
      name: 'transito.delayed',
      description: 'Triggered when a transit is delayed',
      payload: {
        transito: 'object',
        expectedDelay: 'number',
        reason: 'string'
      }
    },
    {
      name: 'precinto.tampered',
      description: 'Triggered when tampering is detected',
      payload: {
        precinto: 'object',
        evento: 'object',
        severity: 'string'
      }
    }
  ];

  res.json({ events });
}));

export default router;