import { Router } from 'express';
import { getBySession, getMyAttendance, markAttendance } from '../controllers/attendanceController.js';
import { protect, allowRoles } from '../middleware/auth.js';
import { loadClassGroup, requireOwnerTeacher, requireApprovedStudent } from '../middleware/classAccess.js';

const router = Router({ mergeParams: true });

router.use(protect, loadClassGroup);
router.get('/me', allowRoles('student'), requireApprovedStudent, getMyAttendance);
router.get('/session/:sessionId', allowRoles('teacher'), requireOwnerTeacher, getBySession);
router.post('/', allowRoles('teacher'), requireOwnerTeacher, markAttendance);

export default router;
