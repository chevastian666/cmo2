/**
 * Main Routes Index
 * By Cheva
 */

import { Router } from 'express';
import authRoutes from './auth.routes.js';
import precintosRoutes from './precintos.routes.js';
import transitosRoutes from './transitos.routes.js';
import alertasRoutes from './alertas.routes.js';
import webhooksRoutes from './webhooks.routes.js';
import statisticsRoutes from './statistics.routes.js';
import reportsRoutes from './reports.routes.js';

const router = Router();

// API Info
router.get('/', (req, res) => {
  res.json({
    name: 'CMO REST API',
    version: '1.0.0',
    status: 'active',
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
    endpoints: {
      auth: '/auth',
      precintos: '/precintos',
      transitos: '/transitos',
      alertas: '/alertas',
      webhooks: '/webhooks',
      statistics: '/statistics',
      reports: '/reports'
    }
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/precintos', precintosRoutes);
router.use('/transitos', transitosRoutes);
router.use('/alertas', alertasRoutes);
router.use('/webhooks', webhooksRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/reports', reportsRoutes);

export default router;