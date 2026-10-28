import mongoose from 'mongoose';

const classGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // "Grade 11 - Combined Maths"
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    grade: { type: String, default: '' }, // e.g. "Grade 11" - which grade this class targets
    subjects: { type: [String], default: [] }, // e.g. ["Pure Maths", "Applied Maths", "Statistics"]
    description: { type: String, default: '' },
    schedule: { type: String, default: 'Sat-Sun, 2:00-6:00 PM' },
    monthlyFee: { type: Number, required: true, default: 3000 },
    maxStudents: { type: Number, default: 15 },
    // A placeholder slot for a cover photo. No upload pipeline yet - the
    // frontend shows a styled PhotoPlaceholder wherever this would render,
    // and coverImageUrl simply stays null until that's wired up.
    coverImageUrl: { type: String, default: null },
    // A class only shows up for students to browse/request once published.
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('ClassGroup', classGroupSchema);
