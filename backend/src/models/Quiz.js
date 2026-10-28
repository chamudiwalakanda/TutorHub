import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    options: { type: [String], required: true, validate: (v) => v.length >= 2 },
    correctIndex: { type: Number, required: true },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    classGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup', required: true },
    title: { type: String, required: true },
    subject: { type: String, required: true }, // "Pure Maths" | "Applied Maths" | "Statistics"
    order: { type: Number, default: 1 }, // 1..5, used for the progress chart x-axis
    dueDate: { type: Date, required: true },
    durationMinutes: { type: Number, default: 20 },
    questions: { type: [questionSchema], default: [] },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Quiz', quizSchema);
