import { Router } from 'express';
import { listNotices, createNotice } from '../controllers/noticeController.js';
import { protect, allowRoles } from '../middleware/auth.js';
import { loadClassGroup, requireOwnerTeacher, requireClassMember } from '../middleware/classAccess.js';

const router = Router({ mergeParams: true });

router.use(protect, loadClassGroup);
router.get('/', requireClassMember, listNotices);
router.post('/', allowRoles('teacher'), requireOwnerTeacher, createNotice);

export default router;
