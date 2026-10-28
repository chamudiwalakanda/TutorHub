import { Router } from 'express';
import {
  createClass,
  listMyClasses,
  listEnrolledClasses,
  listPublishedClasses,
  getClass,
  updateClass,
  requestEnrollment,
  listEnrollments,
  respondToEnrollment,
} from '../controllers/classGroupController.js';
import { protect, allowRoles } from '../middleware/auth.js';
import { loadClassGroup, requireOwnerTeacher } from '../middleware/classAccess.js';

const router = Router();

router.use(protect);

// Literal paths first - Express matches routes top-to-bottom, and these
// would otherwise be swallowed by the ":classGroupId" param route below.
router.post('/', allowRoles('teacher'), createClass);
router.get('/mine', allowRoles('teacher'), listMyClasses);
router.get('/enrolled', allowRoles('student'), listEnrolledClasses);
router.get('/published', allowRoles('student'), listPublishedClasses);

router.get('/:classGroupId', loadClassGroup, getClass);
router.patch('/:classGroupId', allowRoles('teacher'), loadClassGroup, requireOwnerTeacher, updateClass);

router.post('/:classGroupId/enroll', allowRoles('student'), loadClassGroup, requestEnrollment);
router.get('/:classGroupId/enrollments', allowRoles('teacher'), loadClassGroup, requireOwnerTeacher, listEnrollments);
router.patch(
  '/:classGroupId/enrollments/:enrollmentId',
  allowRoles('teacher'),
  loadClassGroup,
  requireOwnerTeacher,
  respondToEnrollment
);

export default router;
