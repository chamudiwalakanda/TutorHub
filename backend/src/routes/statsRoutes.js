import { Router } from 'express';
import { studentStats, adminStats } from '../controllers/statsController.js';
import { protect, allowRoles } from '../middleware/auth.js';
import { loadClassGroup, requireOwnerTeacher, requireApprovedStudent } from '../middleware/classAccess.js';

const router = Router({ mergeParams: true });

router.use(protect, loadClassGroup);
router.get('/student', allowRoles('student'), requireApprovedStudent, studentStats);
router.get('/admin', allowRoles('teacher'), requireOwnerTeacher, adminStats);

export default router;
