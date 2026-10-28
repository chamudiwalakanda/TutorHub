import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
  {
    classGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup', required: true },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Material', materialSchema);
