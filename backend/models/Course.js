const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  instructor: { type: String },
  department: { type: String },
  year: { type: Number },
  semester: { type: Number },
  credits: { type: Number },
  description: { type: String },
  materials: [{
    title: { type: String },
    url: { type: String },
    type: { type: String, enum: ['pdf', 'link', 'video'] },
    uploadedAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
