const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  courseName: { type: String },
  courseCode: { type: String },
  dueDate: { type: Date, required: true },
  dueTime: { type: String },
  points: { type: Number },
  instructions: { type: String },
  attachments: [{ type: String }],
  status: { type: String, enum: ['pending', 'submitted', 'graded', 'late'], default: 'pending' },
  submittedAt: { type: Date },
  grade: { type: Number },
  feedback: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
