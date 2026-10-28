import { Router } from 'express';
import { listMaterials, uploadMaterial, deleteMaterial } from '../controllers/materialController.js';
import { protect, allowRoles } from '../middleware/auth.js';
import { loadClassGroup, requireOwnerTeacher, requireClassMember } from '../middleware/classAccess.js';
import { upload } from '../middleware/upload.js';

const router = Router({ mergeParams: true });

router.use(protect, loadClassGroup);
router.get('/', requireClassMember, listMaterials);
router.post('/', allowRoles('teacher'), requireOwnerTeacher, upload.single('file'), uploadMaterial);
router.delete('/:id', allowRoles('teacher'), requireOwnerTeacher, deleteMaterial);

export default router;
