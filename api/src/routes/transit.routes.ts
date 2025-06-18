/**
 * Transit Routes
 * Transit management endpoints
 * By Cheva
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /transits:
 *   get:
 *     summary: Get all transits
 *     tags: [Transits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, en_curso, completado, cancelado, retrasado]
 *     responses:
 *       200:
 *         description: List of transits
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transit'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', authenticate, async (req, res) => {
  res.json({ message: 'Get transits - to be implemented' });
});

/**
 * @swagger
 * /transits/{id}:
 *   get:
 *     summary: Get transit by ID
 *     tags: [Transits]
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
 *         description: Transit details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transit'
 */
router.get('/:id', authenticate, async (req, res) => {
  res.json({ message: 'Get transit by ID - to be implemented' });
});

/**
 * @swagger
 * /transits:
 *   post:
 *     summary: Create new transit
 *     tags: [Transits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - origen
 *               - destino
 *               - precintoId
 *             properties:
 *               origen:
 *                 type: string
 *               destino:
 *                 type: string
 *               precintoId:
 *                 type: string
 *               camionId:
 *                 type: string
 *               conductorId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transit created
 */
router.post('/', authenticate, authorize('admin', 'operator'), async (req, res) => {
  res.json({ message: 'Create transit - to be implemented' });
});

/**
 * @swagger
 * /transits/{id}/start:
 *   post:
 *     summary: Start transit
 *     tags: [Transits]
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
router.post('/:id/start', authenticate, authorize('admin', 'operator'), async (req, res) => {
  res.json({ message: 'Start transit - to be implemented' });
});

/**
 * @swagger
 * /transits/{id}/complete:
 *   post:
 *     summary: Complete transit
 *     tags: [Transits]
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
router.post('/:id/complete', authenticate, authorize('admin', 'operator'), async (req, res) => {
  res.json({ message: 'Complete transit - to be implemented' });
});

export default router;