import mongoose from 'mongoose';

const formSubmissionSchema = new mongoose.Schema({
  formType: { type: String, required: true },
  data: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const FormSubmission = mongoose.model('FormSubmission', formSubmissionSchema);
export default FormSubmission;
