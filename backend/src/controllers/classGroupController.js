import ClassGroup from '../models/ClassGroup.js';
import Enrollment from '../models/Enrollment.js';

function classSummary(classGroup) {
  return {
    id: classGroup._id,
    name: classGroup.name,
    grade: classGroup.grade,
    subjects: classGroup.subjects,
    description: classGroup.description,
    schedule: classGroup.schedule,
    monthlyFee: classGroup.monthlyFee,
    maxStudents: classGroup.maxStudents,
    coverImageUrl: classGroup.coverImageUrl,
    published: classGroup.published,
    teacher: classGroup.teacher,
    createdAt: classGroup.createdAt,
  };
}

// POST /api/classes  (teacher) - create a new class they'll own
export async function createClass(req, res) {
  const { name, grade, subjects, description, schedule, monthlyFee, maxStudents, published } = req.body;
  if (!name) return res.status(400).json({ message: 'name is required' });

  const classGroup = await ClassGroup.create({
    name,
    teacher: req.user._id,
    grade: grade || '',
    subjects: Array.isArray(subjects) ? subjects.filter(Boolean) : [],
    description: description || '',
    schedule: schedule || 'Sat-Sun, 2:00-6:00 PM',
    monthlyFee: monthlyFee || 3000,
    maxStudents: maxStudents || 15,
    published: Boolean(published),
  });
  res.status(201).json(classSummary(classGroup));
}

// GET /api/classes/mine  (teacher) - every class this teacher owns, with enrollment counts
export async function listMyClasses(req, res) {
  const classes = await ClassGroup.find({ teacher: req.user._id }).sort({ createdAt: -1 });

  const withCounts = await Promise.all(
    classes.map(async (c) => {
      const approvedCount = await Enrollment.countDocuments({ classGroup: c._id, status: 'approved' });
      const pendingCount = await Enrollment.countDocuments({ classGroup: c._id, status: 'pending' });
      return { ...classSummary(c), approvedCount, pendingCount };
    })
  );
  res.json(withCounts);
}

// GET /api/classes/enrolled  (student) - every class this student has requested/joined, with status
export async function listEnrolledClasses(req, res) {
  const enrollments = await Enrollment.find({ student: req.user._id }).populate({
    path: 'classGroup',
    populate: { path: 'teacher', select: 'name' },
  });

  const results = enrollments
    .filter((e) => e.classGroup) // guard against a class that was since removed
    .map((e) => ({
      ...classSummary(e.classGroup),
      teacherName: e.classGroup.teacher?.name || 'Unknown teacher',
      enrollmentId: e._id,
      enrollmentStatus: e.status,
    }));
  res.json(results);
}

// GET /api/classes/published  (student) - classes open to browse & request, excluding ones already requested
export async function listPublishedClasses(req, res) {
  const classes = await ClassGroup.find({ published: true })
    .populate('teacher', 'name')
    .sort({ createdAt: -1 });

  const myEnrollments = await Enrollment.find({ student: req.user._id });
  const statusByClass = new Map(myEnrollments.map((e) => [String(e.classGroup), e.status]));

  const results = classes.map((c) => ({
    ...classSummary(c),
    teacherName: c.teacher?.name || 'Unknown teacher',
    enrollmentStatus: statusByClass.get(String(c._id)) || null, // null = not requested yet
  }));
  res.json(results);
}

// GET /api/classes/:classGroupId  (owner teacher, approved/pending student, or anyone if published)
export async function getClass(req, res) {
  const classGroup = req.targetClass;
  const isOwner = String(classGroup.teacher) === String(req.user._id);

  if (!isOwner && !classGroup.published) {
    const enrollment = req.user.role === 'student'
      ? await Enrollment.findOne({ student: req.user._id, classGroup: classGroup._id })
      : null;
    if (!enrollment) return res.status(403).json({ message: 'This class is not published' });
  }

  await classGroup.populate('teacher', 'name email');
  res.json({ ...classSummary(classGroup), teacherName: classGroup.teacher?.name });
}

// PATCH /api/classes/:classGroupId  (owner teacher only)
export async function updateClass(req, res) {
  const allowed = ['name', 'grade', 'subjects', 'description', 'schedule', 'monthlyFee', 'maxStudents', 'published', 'coverImageUrl'];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const classGroup = await ClassGroup.findByIdAndUpdate(req.targetClass._id, updates, { new: true });
  res.json(classSummary(classGroup));
}

// POST /api/classes/:classGroupId/enroll  (student) - request a seat
export async function requestEnrollment(req, res) {
  const classGroup = req.targetClass;
  if (!classGroup.published) {
    return res.status(404).json({ message: 'This class is not open for enrollment' });
  }

  let enrollment = await Enrollment.findOne({ student: req.user._id, classGroup: classGroup._id });
  if (enrollment) {
    if (enrollment.status === 'approved') {
      return res.status(409).json({ message: 'You are already enrolled in this class' });
    }
    if (enrollment.status === 'pending') {
      return res.status(409).json({ message: 'Your request is already pending approval' });
    }
    // Previously rejected - let them ask again.
    enrollment.status = 'pending';
    enrollment.requestedAt = new Date();
    enrollment.respondedAt = null;
    await enrollment.save();
  } else {
    enrollment = await Enrollment.create({ student: req.user._id, classGroup: classGroup._id });
  }
  res.status(201).json({ id: enrollment._id, status: enrollment.status });
}

// GET /api/classes/:classGroupId/enrollments  (owner teacher) - pending first, then approved/rejected
export async function listEnrollments(req, res) {
  const enrollments = await Enrollment.find({ classGroup: req.targetClass._id })
    .populate('student', 'name email grade')
    .sort({ requestedAt: -1 });

  // Pending requests need attention first; stable sort keeps requestedAt order within each group.
  const order = { pending: 0, approved: 1, rejected: 2 };
  enrollments.sort((a, b) => order[a.status] - order[b.status]);

  res.json(
    enrollments.map((e) => ({
      id: e._id,
      status: e.status,
      requestedAt: e.requestedAt,
      respondedAt: e.respondedAt,
      student: e.student ? { id: e.student._id, name: e.student.name, email: e.student.email, grade: e.student.grade } : null,
    }))
  );
}

// PATCH /api/classes/:classGroupId/enrollments/:enrollmentId  (owner teacher) - approve or reject
export async function respondToEnrollment(req, res) {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'status must be approved or rejected' });
  }

  const enrollment = await Enrollment.findOneAndUpdate(
    { _id: req.params.enrollmentId, classGroup: req.targetClass._id },
    { status, respondedAt: new Date() },
    { new: true }
  ).populate('student', 'name email grade');

  if (!enrollment) return res.status(404).json({ message: 'Enrollment request not found' });
  res.json(enrollment);
}
