import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['teacher', 'student'], required: true },

    // Student-only fields (ignored for teachers)
    grade: { type: String, default: null }, // e.g. "Grade 11" - the student's own grade
    guardianPhone: { type: String, default: null },
    // A student can now belong to many classes (see the Enrollment model) and a
    // teacher can own many classes (see ClassGroup.teacher), so there is no
    // single classGroup on the user anymore.
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
