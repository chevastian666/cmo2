/**
 * Precinto Routes
 * Electronic seal management endpoints
 * By Cheva
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as precintoController from '../controllers/precinto.controller';
import { validatePrecinto } from '../validators/precinto.validator';

const router = Router();

/**
 * @swagger
 * /precintos:
 *   get:
 *     summary: Get all precintos
 *     tags: [Precintos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [creado, activado, en_transito, completado, desactivado, alarma]
 *         description: Filter by state
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [RFID, GPS, HIBRIDO]
 *         description: Filter by type
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
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', authenticate, precintoController.getAllPrecintos);

/**
 * @swagger
 * /precintos/{id}:
 *   get:
 *     summary: Get precinto by ID
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
router.get('/:id', authenticate, precintoController.getPrecintoById);

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
 *                 enum: [RFID, GPS, HIBRIDO]
 *     responses:
 *       201:
 *         description: Precinto created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Precinto'
 *       400:
 *         description: Invalid input
 */
router.post('/', authenticate, authorize('admin', 'operator'), validatePrecinto, precintoController.createPrecinto);

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
 *                 enum: [creado, activado, en_transito, completado, desactivado, alarma]
 *               ubicacion:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               bateria:
 *                 type: integer
 *               temperatura:
 *                 type: number
 *     responses:
 *       200:
 *         description: Precinto updated
 *       404:
 *         description: Precinto not found
 */
router.put('/:id', authenticate, authorize('admin', 'operator'), precintoController.updatePrecinto);

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
 *       404:
 *         description: Precinto not found
 */
router.delete('/:id', authenticate, authorize('admin'), precintoController.deletePrecinto);

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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transitId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Precinto activated
 *       400:
 *         description: Cannot activate precinto
 */
router.post('/:id/activate', authenticate, authorize('admin', 'operator'), precintoController.activatePrecinto);

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
 *       400:
 *         description: Cannot deactivate precinto
 */
router.post('/:id/deactivate', authenticate, authorize('admin', 'operator'), precintoController.deactivatePrecinto);

/**
 * @swagger
 * /precintos/{id}/location:
 *   post:
 *     summary: Update precinto location
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
 *             required:
 *               - lat
 *               - lng
 *             properties:
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Location updated
 */
router.post('/:id/location', authenticate, precintoController.updateLocation);

export default router;