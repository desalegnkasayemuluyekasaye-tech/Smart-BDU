const mongoose = require('mongoose');

const directorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  role: { type: String, enum: ['student', 'faculty', 'staff', 'admin'], required: true },
  department: { type: String },
  office: { type: String },
  position: { type: String },
  studentId: { type: String },
  year: { type: Number },
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

directorySchema.index({ name: 'text', department: 'text', studentId: 'text' });

module.exports = mongoose.model('Directory', directorySchema);
