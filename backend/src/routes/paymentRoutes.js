import { Router } from 'express';
import { getMyPayments, listPayments, generateMonthlyPayments, updatePayment } from '../controllers/paymentController.js';
import { protect, allowRoles } from '../middleware/auth.js';
import { loadClassGroup, requireOwnerTeacher, requireApprovedStudent } from '../middleware/classAccess.js';

const router = Router({ mergeParams: true });

router.use(protect, loadClassGroup);
router.get('/me', allowRoles('student'), requireApprovedStudent, getMyPayments);
router.get('/', allowRoles('teacher'), requireOwnerTeacher, listPayments);
router.post('/generate', allowRoles('teacher'), requireOwnerTeacher, generateMonthlyPayments);
router.patch('/:id', allowRoles('teacher'), requireOwnerTeacher, updatePayment);

export default router;
