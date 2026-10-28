import { Router } from 'express';
import { listStudents, getStudent } from '../controllers/studentController.js';
import { protect, allowRoles } from '../middleware/auth.js';
import { loadClassGroup, requireOwnerTeacher } from '../middleware/classAccess.js';

const router = Router({ mergeParams: true });

router.use(protect, loadClassGroup, allowRoles('teacher'), requireOwnerTeacher);
router.get('/', listStudents);
router.get('/:id', getStudent);

export default router;
