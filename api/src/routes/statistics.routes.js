/**
 * Statistics Routes
 * By Cheva
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * @swagger
 * /statistics/overview:
 *   get:
 *     summary: Get system overview statistics
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transitos:
 *                   type: object
 *                 precintos:
 *                   type: object
 *                 alertas:
 *                   type: object
 */
router.get('/overview', authenticate, asyncHandler(async (req, res) => {
  res.json({ 
    transitos: { total: 0, enRuta: 0, completados: 0 },
    precintos: { total: 0, activos: 0 },
    alertas: { total: 0, activas: 0 }
  });
}));

/**
 * @swagger
 * /statistics/performance:
 *   get:
 *     summary: Get performance metrics
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: week
 *     responses:
 *       200:
 *         description: Performance metrics
 */
router.get('/performance', authenticate, asyncHandler(async (req, res) => {
  res.json({ message: 'Performance metrics' });
}));

export default router;