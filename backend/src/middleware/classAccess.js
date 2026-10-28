import ClassGroup from '../models/ClassGroup.js';
import Enrollment from '../models/Enrollment.js';

/**
 * Every class-scoped route is mounted under /api/classes/:classGroupId/...
 * This middleware loads that class once and attaches it to req.targetClass,
 * so the guards below (and the controllers) don't each re-fetch it.
 */
export async function loadClassGroup(req, res, next) {
  try {
    const classGroup = await ClassGroup.findById(req.params.classGroupId);
    if (!classGroup) return res.status(404).json({ message: 'Class not found' });
    req.targetClass = classGroup;
    req.classGroupId = classGroup._id;
    next();
  } catch (err) {
    next(err);
  }
}

/** Teacher-only write actions: you must be the teacher who owns this class. */
export function requireOwnerTeacher(req, res, next) {
  if (String(req.targetClass.teacher) !== String(req.user._id)) {
    return res.status(403).json({ message: 'You do not own this class' });
  }
  next();
}

/** Student-only actions that require an approved seat in this class. */
export async function requireApprovedStudent(req, res, next) {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      classGroup: req.targetClass._id,
      status: 'approved',
    });
    if (!enrollment) {
      return res.status(403).json({ message: 'You are not enrolled in this class yet' });
    }
    req.enrollment = enrollment;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Shared read access for things both roles view inside a class (quizzes,
 * materials, notices, sessions): the owning teacher, or a student with an
 * approved enrollment. Everyone else is forbidden.
 */
export async function requireClassMember(req, res, next) {
  try {
    if (req.user.role === 'teacher') {
      if (String(req.targetClass.teacher) !== String(req.user._id)) {
        return res.status(403).json({ message: 'You do not own this class' });
      }
      return next();
    }
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      classGroup: req.targetClass._id,
      status: 'approved',
    });
    if (!enrollment) {
      return res.status(403).json({ message: 'You are not enrolled in this class yet' });
    }
    req.enrollment = enrollment;
    next();
  } catch (err) {
    next(err);
  }
}
