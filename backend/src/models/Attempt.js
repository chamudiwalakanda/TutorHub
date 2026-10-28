import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: { type: [Number], default: [] }, // selected option index per question
    score: { type: Number, required: true }, // percentage, 0-100
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

attemptSchema.index({ quiz: 1, student: 1 }, { unique: true });

export default mongoose.model('Attempt', attemptSchema);
