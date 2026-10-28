import Quiz from '../models/Quiz.js';
import Attempt from '../models/Attempt.js';

// POST /api/classes/:classGroupId/attempts  (approved student) - submit answers, auto-graded
// body: { quizId, answers: [optionIndex, ...] }
export async function submitAttempt(req, res) {
  const { quizId, answers } = req.body;
  if (!quizId || !Array.isArray(answers)) {
    return res.status(400).json({ message: 'quizId and answers[] are required' });
  }

  const quiz = await Quiz.findOne({ _id: quizId, classGroup: req.classGroupId, published: true });
  if (!quiz) return res.status(404).json({ message: 'Quiz not found or not published' });

  const already = await Attempt.findOne({ quiz: quizId, student: req.user._id });
  if (already) return res.status(409).json({ message: 'You have already attempted this quiz' });

  let correct = 0;
  quiz.questions.forEach((q, i) => {
    if (answers[i] === q.correctIndex) correct += 1;
  });
  const score = quiz.questions.length ? Math.round((correct / quiz.questions.length) * 100) : 0;

  const attempt = await Attempt.create({
    quiz: quizId,
    student: req.user._id,
    answers,
    score,
  });

  res.status(201).json({ score, correct, total: quiz.questions.length, attempt });
}

// GET /api/classes/:classGroupId/attempts/me/progress  (approved student) - subject progress chart data, this class only
// Returns: { "Pure Maths": [{order, score, title}], "Applied Maths": [...], ... }
export async function getMyProgress(req, res) {
  const quizzesInClass = await Quiz.find({ classGroup: req.classGroupId }).select('_id');
  const quizIds = quizzesInClass.map((q) => q._id);

  const attempts = await Attempt.find({ student: req.user._id, quiz: { $in: quizIds } }).populate(
    'quiz',
    'subject order title'
  );

  const bySubject = {};
  for (const a of attempts) {
    if (!a.quiz) continue;
    const subject = a.quiz.subject;
    if (!bySubject[subject]) bySubject[subject] = [];
    bySubject[subject].push({ order: a.quiz.order, title: a.quiz.title, score: a.score });
  }
  Object.values(bySubject).forEach((list) => list.sort((x, y) => x.order - y.order));

  res.json(bySubject);
}
