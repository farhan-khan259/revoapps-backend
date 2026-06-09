import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now },
});

configSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Config = mongoose.model('Config', configSchema);
export default Config;
