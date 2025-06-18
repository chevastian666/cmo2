import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
const router = Router();
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  res.json({ message: 'Users endpoint - to be implemented' });
});
export default router;