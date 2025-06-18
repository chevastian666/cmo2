/**
 * Main Router
 * Combines all API routes
 * By Cheva
 */

import { Router } from 'express';
import authRoutes from './auth.routes';
import precintoRoutes from './precinto.routes';
import transitRoutes from './transit.routes';
import alertRoutes from './alert.routes';
import statisticsRoutes from './statistics.routes';
import webhookRoutes from './webhook.routes';
import userRoutes from './user.routes';
import companyRoutes from './company.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/precintos', precintoRoutes);
router.use('/transits', transitRoutes);
router.use('/alerts', alertRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/users', userRoutes);
router.use('/companies', companyRoutes);

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'CMO REST API v1',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/v1/auth',
      precintos: '/api/v1/precintos',
      transits: '/api/v1/transits',
      alerts: '/api/v1/alerts',
      statistics: '/api/v1/statistics',
      webhooks: '/api/v1/webhooks',
      users: '/api/v1/users',
      companies: '/api/v1/companies'
    }
  });
});

export default router;