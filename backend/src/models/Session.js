import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    classGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup', required: true },
    date: { type: Date, required: true },
    topic: { type: String, default: '' },
    status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
  },
  { timestamps: true }
);

export default mongoose.model('Session', sessionSchema);
