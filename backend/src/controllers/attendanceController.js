import Attendance from '../models/Attendance.js';
import Session from '../models/Session.js';

// GET /api/classes/:classGroupId/attendance/session/:sessionId  (owner teacher) - all students' marks for one session
export async function getBySession(req, res) {
  const session = await Session.findOne({ _id: req.params.sessionId, classGroup: req.classGroupId });
  if (!session) return res.status(404).json({ message: 'Session not found in this class' });

  const records = await Attendance.find({ session: session._id }).populate('student', 'name email');
  res.json(records);
}

// GET /api/classes/:classGroupId/attendance/me  (approved student) - this student's history + % within THIS class only
export async function getMyAttendance(req, res) {
  const sessions = await Session.find({ classGroup: req.classGroupId }).select('_id');
  const sessionIds = sessions.map((s) => s._id);

  const records = await Attendance.find({ student: req.user._id, session: { $in: sessionIds } })
    .populate('session', 'date topic')
    .sort({ createdAt: -1 });

  const total = records.length;
  const present = records.filter((r) => r.status === 'present' || r.status === 'late').length;
  const late = records.filter((r) => r.status === 'late').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const pct = total ? Math.round((present / total) * 100) : 0;

  res.json({ records, summary: { total, present: present - late, late, absent, pct } });
}

// POST /api/classes/:classGroupId/attendance  (owner teacher) - mark/update one student's attendance for a session
// body: { sessionId, studentId, status }
export async function markAttendance(req, res) {
  const { sessionId, studentId, status } = req.body;
  if (!sessionId || !studentId || !status) {
    return res.status(400).json({ message: 'sessionId, studentId and status are required' });
  }
  if (!['present', 'late', 'absent'].includes(status)) {
    return res.status(400).json({ message: 'status must be present, late or absent' });
  }

  const session = await Session.findOne({ _id: sessionId, classGroup: req.classGroupId });
  if (!session) return res.status(404).json({ message: 'Session not found in this class' });

  const record = await Attendance.findOneAndUpdate(
    { session: sessionId, student: studentId },
    { status, markedAt: new Date() },
    { new: true, upsert: true }
  );
  res.json(record);
}
