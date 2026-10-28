import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    classGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup', required: true },
    month: { type: String, required: true }, // "2026-11"
    amount: { type: Number, required: true },
    status: { type: String, enum: ['paid', 'due', 'overdue'], default: 'due' },
    dueDate: { type: Date, required: true },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// A student can now be in several classes at once, so "one payment per
// student per month" isn't right anymore - it's one per student, per
// class, per month.
paymentSchema.index({ student: 1, classGroup: 1, month: 1 }, { unique: true });

export default mongoose.model('Payment', paymentSchema);
