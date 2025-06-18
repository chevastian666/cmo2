import { Router } from 'express';
import { authenticate } from '../middleware/auth';
const router = Router();
router.get('/', authenticate, async (req, res) => {
  res.json({ message: 'Alerts endpoint - to be implemented' });
});
export default router;