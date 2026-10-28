import { Router } from 'express';
import { submitAttempt, getMyProgress } from '../controllers/attemptController.js';
import { protect, allowRoles } from '../middleware/auth.js';
import { loadClassGroup, requireApprovedStudent } from '../middleware/classAccess.js';

const router = Router({ mergeParams: true });

router.use(protect, loadClassGroup, allowRoles('student'), requireApprovedStudent);
router.post('/', submitAttempt);
router.get('/me/progress', getMyProgress);

export default router;
