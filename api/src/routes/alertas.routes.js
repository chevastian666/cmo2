/**
 * Alertas Routes
 * By Cheva
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * @swagger
 * /alertas:
 *   get:
 *     summary: Get all alerts
 *     tags: [Alertas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [activa, atendida, resuelta, descartada]
 *       - in: query
 *         name: severidad
 *         schema:
 *           type: string
 *           enum: [baja, media, alta, critica]
 *     responses:
 *       200:
 *         description: List of alerts
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  res.json({ message: 'Alerts list' });
}));

/**
 * @swagger
 * /alertas/{id}:
 *   get:
 *     summary: Get alert details
 *     tags: [Alertas]
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
 *         description: Alert details
 */
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  res.json({ message: 'Alert details' });
}));

/**
 * @swagger
 * /alertas/{id}/acknowledge:
 *   post:
 *     summary: Acknowledge alert
 *     tags: [Alertas]
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
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Alert acknowledged
 */
router.post('/:id/acknowledge', authenticate, asyncHandler(async (req, res) => {
  res.json({ message: 'Alert acknowledged' });
}));

/**
 * @swagger
 * /alertas/{id}/resolve:
 *   post:
 *     summary: Resolve alert
 *     tags: [Alertas]
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
 *             required:
 *               - resolution
 *             properties:
 *               resolution:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Alert resolved
 */
router.post('/:id/resolve', authenticate, asyncHandler(async (req, res) => {
  res.json({ message: 'Alert resolved' });
}));

export default router;