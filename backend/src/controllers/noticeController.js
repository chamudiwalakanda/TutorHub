import Notice from '../models/Notice.js';

// GET /api/notices
export async function listNotices(req, res) {
  const notices = await Notice.find({ classGroup: req.classGroupId }).sort({ createdAt: -1 }).limit(20);
  res.json(notices);
}

// POST /api/notices  (teacher only)
export async function createNotice(req, res) {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ message: 'title and body are required' });

  const notice = await Notice.create({
    classGroup: req.classGroupId,
    title,
    body,
    postedBy: req.user._id,
  });
  res.status(201).json(notice);
}
