import { Router } from 'express';
import { listSessions, createSession, updateSession } from '../controllers/sessionController.js';
import { protect, allowRoles } from '../middleware/auth.js';
import { loadClassGroup, requireOwnerTeacher, requireClassMember } from '../middleware/classAccess.js';

// mergeParams: true lets this router read :classGroupId from the parent
// mount path in server.js (/api/classes/:classGroupId/sessions).
const router = Router({ mergeParams: true });

router.use(protect, loadClassGroup);
router.get('/', requireClassMember, listSessions);
router.post('/', allowRoles('teacher'), requireOwnerTeacher, createSession);
router.patch('/:id', allowRoles('teacher'), requireOwnerTeacher, updateSession);

export default router;
