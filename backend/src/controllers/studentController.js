import Enrollment from '../models/Enrollment.js';
import Attendance from '../models/Attendance.js';
import Payment from '../models/Payment.js';
import Session from '../models/Session.js';

// GET /api/classes/:classGroupId/students  (owner teacher) - every APPROVED student in this class,
// with their attendance % and this month's payment status, scoped to this class only.
export async function listStudents(req, res) {
  const enrollments = await Enrollment.find({ classGroup: req.classGroupId, status: 'approved' }).populate(
    'student',
    'name email grade'
  );

  const sessions = await Session.find({ classGroup: req.classGroupId }).select('_id');
  const sessionIds = sessions.map((s) => s._id);

  const month = new Date().toISOString().slice(0, 7);

  const results = await Promise.all(
    enrollments
      .filter((e) => e.student)
      .map(async (e) => {
        const s = e.student;
        const total = await Attendance.countDocuments({ student: s._id, session: { $in: sessionIds } });
        const present = await Attendance.countDocuments({
          student: s._id,
          session: { $in: sessionIds },
          status: { $in: ['present', 'late'] },
        });
        const attendancePct = total ? Math.round((present / total) * 100) : 0;

        const payment = await Payment.findOne({ student: s._id, classGroup: req.classGroupId, month });

        return {
          id: s._id,
          name: s.name,
          email: s.email,
          grade: s.grade,
          attendancePct,
          paymentStatus: payment ? payment.status : 'due',
        };
      })
  );

  res.json(results);
}

// GET /api/classes/:classGroupId/students/:id  (owner teacher) - one approved student's basic info
export async function getStudent(req, res) {
  const enrollment = await Enrollment.findOne({
    classGroup: req.classGroupId,
    student: req.params.id,
    status: 'approved',
  }).populate('student', 'name email grade');
  if (!enrollment || !enrollment.student) {
    return res.status(404).json({ message: 'Student not found in this class' });
  }
  res.json(enrollment.student);
}
