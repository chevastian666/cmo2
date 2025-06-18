/**
 * Reports Routes
 * By Cheva
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * @swagger
 * /reports/generate:
 *   post:
 *     summary: Generate report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - startDate
 *               - endDate
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [transitos, alertas, performance, compliance]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               format:
 *                 type: string
 *                 enum: [pdf, excel, csv]
 *                 default: pdf
 *     responses:
 *       200:
 *         description: Report generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reportId:
 *                   type: string
 *                 downloadUrl:
 *                   type: string
 */
router.post('/generate', authenticate, authorize('admin', 'supervisor'), asyncHandler(async (req, res) => {
  res.json({ message: 'Report generation endpoint' });
}));

/**
 * @swagger
 * /reports/{id}/download:
 *   get:
 *     summary: Download report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/:id/download', authenticate, asyncHandler(async (req, res) => {
  res.json({ message: 'Download endpoint' });
}));

export default router;