import Quiz from '../models/Quiz.js';
import Attempt from '../models/Attempt.js';

function stripAnswers(quiz, forStudent) {
  const obj = quiz.toObject();
  if (forStudent) {
    obj.questions = obj.questions.map(({ text, options }) => ({ text, options }));
  }
  return obj;
}

// GET /api/quizzes  (both roles; students only see published quizzes)
export async function listQuizzes(req, res) {
  const filter = { classGroup: req.classGroupId };
  if (req.user.role === 'student') filter.published = true;

  const quizzes = await Quiz.find(filter).sort({ dueDate: 1 });

  if (req.user.role === 'student') {
    const attempts = await Attempt.find({ student: req.user._id, quiz: { $in: quizzes.map((q) => q._id) } });
    const attemptsByQuiz = new Map(attempts.map((attempt) => [String(attempt.quiz), attempt]));
    return res.json(
      quizzes.map((q) => {
        const attempt = attemptsByQuiz.get(String(q._id));
        return { ...stripAnswers(q, true), attempted: Boolean(attempt), attemptScore: attempt?.score ?? null };
      })
    );
  }

  // teacher view: include attempt counts
  const withCounts = await Promise.all(
    quizzes.map(async (q) => {
      const attemptCount = await Attempt.countDocuments({ quiz: q._id });
      return { ...q.toObject(), attemptCount };
    })
  );
  res.json(withCounts);
}

// GET /api/quizzes/:id
export async function getQuiz(req, res) {
  const quiz = await Quiz.findOne({ _id: req.params.id, classGroup: req.classGroupId });
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  if (req.user.role === 'student' && !quiz.published) {
    return res.status(403).json({ message: 'This quiz is not published yet' });
  }
  res.json(req.user.role === 'student' ? stripAnswers(quiz, true) : quiz);
}

// POST /api/quizzes  (teacher only)
export async function createQuiz(req, res) {
  const { title, subject, order, dueDate, durationMinutes, questions, published } = req.body;
  if (!title || !subject || !dueDate) {
    return res.status(400).json({ message: 'title, subject and dueDate are required' });
  }
  const quiz = await Quiz.create({
    classGroup: req.classGroupId,
    title,
    subject,
    order: order || 1,
    dueDate,
    durationMinutes: durationMinutes || 20,
    questions: questions || [],
    published: Boolean(published),
  });
  res.status(201).json(quiz);
}

// PATCH /api/quizzes/:id  (teacher only)
export async function updateQuiz(req, res) {
  const quiz = await Quiz.findOneAndUpdate(
    { _id: req.params.id, classGroup: req.classGroupId },
    req.body,
    { new: true }
  );
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  res.json(quiz);
}

// DELETE /api/quizzes/:id  (teacher only)
export async function deleteQuiz(req, res) {
  const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, classGroup: req.classGroupId });
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  res.json({ message: 'Quiz deleted' });
}
