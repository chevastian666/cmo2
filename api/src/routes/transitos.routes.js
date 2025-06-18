/**
 * Transitos Routes
 * By Cheva
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * @swagger
 * /transitos:
 *   get:
 *     summary: Get all transits
 *     tags: [Transitos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, en_ruta, demorado, finalizado, cancelado]
 *     responses:
 *       200:
 *         description: List of transits
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  res.json({ message: 'Transitos list' });
}));

/**
 * @swagger
 * /transitos:
 *   post:
 *     summary: Create new transit
 *     tags: [Transitos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numeroViaje
 *               - dua
 *               - precintoId
 *               - origen
 *               - destino
 *             properties:
 *               numeroViaje:
 *                 type: string
 *               dua:
 *                 type: string
 *               precintoId:
 *                 type: string
 *               origen:
 *                 type: string
 *               destino:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transit created
 */
router.post('/', authenticate, authorize('admin', 'operator'), asyncHandler(async (req, res) => {
  res.status(201).json({ message: 'Transit created' });
}));

/**
 * @swagger
 * /transitos/{id}/start:
 *   post:
 *     summary: Start transit
 *     tags: [Transitos]
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
 *         description: Transit started
 */
router.post('/:id/start', authenticate, authorize('admin', 'operator'), asyncHandler(async (req, res) => {
  res.json({ message: 'Transit started' });
}));

/**
 * @swagger
 * /transitos/{id}/complete:
 *   post:
 *     summary: Complete transit
 *     tags: [Transitos]
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
 *         description: Transit completed
 */
router.post('/:id/complete', authenticate, authorize('admin', 'operator'), asyncHandler(async (req, res) => {
  res.json({ message: 'Transit completed' });
}));

export default router;