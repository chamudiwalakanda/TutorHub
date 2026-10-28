import mongoose from 'mongoose';

// Links one student to one class, with a status the teacher controls.
// A student requests ("pending"); the teacher approves or rejects it.
// Only an "approved" enrollment grants access to that class's quizzes,
// materials, attendance, payments, etc. (see middleware/classAccess.js).
const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    classGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    requestedAt: { type: Date, default: Date.now },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// A student can only have one enrollment record per class - re-requesting
// after a rejection reuses/updates this same document rather than duplicating it.
enrollmentSchema.index({ student: 1, classGroup: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);
