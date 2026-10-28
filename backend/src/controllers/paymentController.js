import Payment from '../models/Payment.js';
import Enrollment from '../models/Enrollment.js';

// GET /api/classes/:classGroupId/payments/me  (approved student) - this student's payments, this class only
export async function getMyPayments(req, res) {
  const payments = await Payment.find({ student: req.user._id, classGroup: req.classGroupId }).sort({ month: -1 });
  res.json(payments);
}

// GET /api/classes/:classGroupId/payments  (owner teacher) - every approved student's payment for a given month
export async function listPayments(req, res) {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  const payments = await Payment.find({ classGroup: req.classGroupId, month }).populate('student', 'name email');
  res.json(payments);
}

// POST /api/classes/:classGroupId/payments/generate  (owner teacher)
// Creates this month's "due" record for every approved student who doesn't have one yet.
export async function generateMonthlyPayments(req, res) {
  const month = req.body.month || new Date().toISOString().slice(0, 7);
  const classGroup = req.targetClass;

  const approved = await Enrollment.find({ classGroup: req.classGroupId, status: 'approved' }).select('student');
  const dueDate = new Date(`${month}-05`);

  const created = [];
  for (const { student } of approved) {
    const existing = await Payment.findOne({ student, classGroup: req.classGroupId, month });
    if (existing) continue;
    const payment = await Payment.create({
      student,
      classGroup: req.classGroupId,
      month,
      amount: classGroup.monthlyFee,
      status: 'due',
      dueDate,
    });
    created.push(payment);
  }
  res.status(201).json({ createdCount: created.length, payments: created });
}

// PATCH /api/classes/:classGroupId/payments/:id  (owner teacher) - mark paid / due / overdue
export async function updatePayment(req, res) {
  const { status } = req.body;
  if (!['paid', 'due', 'overdue'].includes(status)) {
    return res.status(400).json({ message: 'status must be paid, due or overdue' });
  }
  const payment = await Payment.findOneAndUpdate(
    { _id: req.params.id, classGroup: req.classGroupId },
    { status, paidAt: status === 'paid' ? new Date() : null },
    { new: true }
  );
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  res.json(payment);
}
