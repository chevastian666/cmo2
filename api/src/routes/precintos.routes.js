/**
 * Precintos Routes
 * By Cheva
 */

import { Router } from 'express';
import { authenticate, authorize, authenticateApiKey } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { precintosController } from '../controllers/precintos.controller.js';
import { validatePrecinto, validateUpdatePrecinto } from '../validators/precintos.validator.js';

const router = Router();

/**
 * @swagger
 * /precintos:
 *   get:
 *     summary: Get all precintos
 *     tags: [Precintos]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [activo, inactivo, en_transito, finalizado]
 *         description: Filter by status
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [electronico, mecanico]
 *         description: Filter by type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by codigo
 *     responses:
 *       200:
 *         description: List of precintos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Precinto'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', authenticate, asyncHandler(precintosController.getAll));

/**
 * @swagger
 * /precintos/{id}:
 *   get:
 *     summary: Get precinto by ID
 *     tags: [Precintos]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Precinto ID
 *     responses:
 *       200:
 *         description: Precinto details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Precinto'
 *       404:
 *         description: Precinto not found
 */
router.get('/:id', authenticate, asyncHandler(precintosController.getById));

/**
 * @swagger
 * /precintos:
 *   post:
 *     summary: Create new precinto
 *     tags: [Precintos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo
 *               - tipo
 *             properties:
 *               codigo:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [electronico, mecanico]
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Precinto created
 *       400:
 *         description: Validation error
 */
router.post('/', authenticate, authorize('admin', 'operator'), validatePrecinto, asyncHandler(precintosController.create));

/**
 * @swagger
 * /precintos/{id}:
 *   put:
 *     summary: Update precinto
 *     tags: [Precintos]
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
 *               estado:
 *                 type: string
 *                 enum: [activo, inactivo, en_transito, finalizado]
 *               ubicacion:
 *                 type: object
 *               bateria:
 *                 type: integer
 *               temperatura:
 *                 type: number
 *               humedad:
 *                 type: number
 *     responses:
 *       200:
 *         description: Precinto updated
 */
router.put('/:id', authenticate, authorize('admin', 'operator'), validateUpdatePrecinto, asyncHandler(precintosController.update));

/**
 * @swagger
 * /precintos/{id}:
 *   delete:
 *     summary: Delete precinto
 *     tags: [Precintos]
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
 *         description: Precinto deleted
 */
router.delete('/:id', authenticate, authorize('admin'), asyncHandler(precintosController.delete));

/**
 * @swagger
 * /precintos/{id}/location:
 *   post:
 *     summary: Update precinto location
 *     tags: [Precintos]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
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
 *               - lat
 *               - lng
 *             properties:
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *               speed:
 *                 type: number
 *               heading:
 *                 type: number
 *               altitude:
 *                 type: number
 *               accuracy:
 *                 type: number
 *     responses:
 *       200:
 *         description: Location updated
 */
router.post('/:id/location', authenticateApiKey, asyncHandler(precintosController.updateLocation));

/**
 * @swagger
 * /precintos/{id}/status:
 *   post:
 *     summary: Update precinto status
 *     tags: [Precintos]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
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
 *               bateria:
 *                 type: integer
 *               temperatura:
 *                 type: number
 *               humedad:
 *                 type: number
 *               señal:
 *                 type: integer
 *               eventos:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Status updated
 */
router.post('/:id/status', authenticateApiKey, asyncHandler(precintosController.updateStatus));

/**
 * @swagger
 * /precintos/{id}/activate:
 *   post:
 *     summary: Activate precinto
 *     tags: [Precintos]
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
 *         description: Precinto activated
 */
router.post('/:id/activate', authenticate, authorize('admin', 'operator'), asyncHandler(precintosController.activate));

/**
 * @swagger
 * /precintos/{id}/deactivate:
 *   post:
 *     summary: Deactivate precinto
 *     tags: [Precintos]
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
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Precinto deactivated
 */
router.post('/:id/deactivate', authenticate, authorize('admin', 'operator'), asyncHandler(precintosController.deactivate));

/**
 * @swagger
 * /precintos/{id}/history:
 *   get:
 *     summary: Get precinto history
 *     tags: [Precintos]
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
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Precinto history
 */
router.get('/:id/history', authenticate, asyncHandler(precintosController.getHistory));

export default router;