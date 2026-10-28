import { Router } from 'express';
import { listQuizzes, getQuiz, createQuiz, updateQuiz, deleteQuiz } from '../controllers/quizController.js';
import { protect, allowRoles } from '../middleware/auth.js';
import { loadClassGroup, requireOwnerTeacher, requireClassMember } from '../middleware/classAccess.js';

const router = Router({ mergeParams: true });

router.use(protect, loadClassGroup);
router.get('/', requireClassMember, listQuizzes);
router.get('/:id', requireClassMember, getQuiz);
router.post('/', allowRoles('teacher'), requireOwnerTeacher, createQuiz);
router.patch('/:id', allowRoles('teacher'), requireOwnerTeacher, updateQuiz);
router.delete('/:id', allowRoles('teacher'), requireOwnerTeacher, deleteQuiz);

export default router;
