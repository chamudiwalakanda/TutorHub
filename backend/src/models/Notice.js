import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    classGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup', required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Notice', noticeSchema);
