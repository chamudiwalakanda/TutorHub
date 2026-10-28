import Enrollment from '../models/Enrollment.js';
import Attendance from '../models/Attendance.js';
import Payment from '../models/Payment.js';
import Quiz from '../models/Quiz.js';
import Session from '../models/Session.js';

// GET /api/classes/:classGroupId/stats/student  (student, approved in this class)
export async function studentStats(req, res) {
  const sessions = await Session.find({ classGroup: req.classGroupId }).select('_id');
  const sessionIds = sessions.map((s) => s._id);

  const records = await Attendance.find({ student: req.user._id, session: { $in: sessionIds } });
  const total = records.length;
  const present = records.filter((r) => r.status === 'present' || r.status === 'late').length;
  const attendancePct = total ? Math.round((present / total) * 100) : 0;

  const month = new Date().toISOString().slice(0, 7);
  const payment = await Payment.findOne({ student: req.user._id, classGroup: req.classGroupId, month });

  const upcomingQuizzes = await Quiz.find({
    classGroup: req.classGroupId,
    published: true,
    dueDate: { $gte: new Date() },
  })
    .sort({ dueDate: 1 })
    .limit(5);

  res.json({
    attendancePct,
    feeDue: payment ? { amount: payment.amount, status: payment.status, dueDate: payment.dueDate } : null,
    upcomingQuizCount: upcomingQuizzes.length,
    nextQuiz: upcomingQuizzes[0] || null,
  });
}

// GET /api/classes/:classGroupId/stats/admin  (owner teacher)
export async function adminStats(req, res) {
  const totalStudents = await Enrollment.countDocuments({ classGroup: req.classGroupId, status: 'approved' });
  const pendingRequests = await Enrollment.countDocuments({ classGroup: req.classGroupId, status: 'pending' });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaySession = await Session.findOne({
    classGroup: req.classGroupId,
    date: { $gte: today, $lt: tomorrow },
  });

  let todayAttendancePct = 0;
  if (todaySession) {
    const records = await Attendance.find({ session: todaySession._id });
    const present = records.filter((r) => r.status === 'present' || r.status === 'late').length;
    todayAttendancePct = totalStudents ? Math.round((present / totalStudents) * 100) : 0;
  }

  const month = new Date().toISOString().slice(0, 7);
  const payments = await Payment.find({ classGroup: req.classGroupId, month });
  const pending = payments.filter((p) => p.status !== 'paid');
  const pendingAmount = pending.reduce((sum, p) => sum + p.amount, 0);

  const activeQuizzes = await Quiz.countDocuments({
    classGroup: req.classGroupId,
    published: true,
    dueDate: { $gte: new Date() },
  });

  res.json({
    totalStudents,
    pendingRequests,
    todayAttendancePct,
    hasSessionToday: Boolean(todaySession),
    pendingPaymentsCount: pending.length,
    pendingPaymentsAmount: pendingAmount,
    activeQuizzes,
  });
}
