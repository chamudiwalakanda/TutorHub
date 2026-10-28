import Session from '../models/Session.js';

// GET /api/sessions
export async function listSessions(req, res) {
  const sessions = await Session.find({ classGroup: req.classGroupId }).sort({ date: 1 });
  res.json(sessions);
}

// POST /api/sessions  (teacher only)
export async function createSession(req, res) {
  const { date, topic } = req.body;
  if (!date) return res.status(400).json({ message: 'date is required' });

  const session = await Session.create({
    classGroup: req.classGroupId,
    date,
    topic: topic || '',
  });
  res.status(201).json(session);
}

// PATCH /api/sessions/:id  (teacher only)
export async function updateSession(req, res) {
  const session = await Session.findOneAndUpdate(
    { _id: req.params.id, classGroup: req.classGroupId },
    req.body,
    { new: true }
  );
  if (!session) return res.status(404).json({ message: 'Session not found' });
  res.json(session);
}
