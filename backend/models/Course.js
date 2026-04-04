const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  instructor: { type: String },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  department: { type: String },
  year: { type: Number },
  semester: { type: Number },
  section: { type: String },
  credits: { type: Number },
  description: { type: String },
  createdBy: { type: String, enum: ['admin', 'lecturer'], default: 'admin' },
  materials: [{
    title: { type: String },
    url: { type: String },
    type: { type: String, enum: ['pdf', 'link', 'video'] },
    uploadedAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
