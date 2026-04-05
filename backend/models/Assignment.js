const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  // Targeting criteria instead of specific course
  department: { type: String, required: true },
  year: { type: Number, required: true }, // batch/year
  semester: { type: String, enum: ['1', '2'], required: true },
  section: { type: String }, // optional section targeting
  // Legacy course reference (for backward compatibility)
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  courseName: { type: String },
  courseCode: { type: String },
  dueDate: { type: Date, required: true },
  dueTime: { type: String },
  points: { type: Number },
  instructions: { type: String },
  attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
  accepted: { type: Boolean, default: false },
  submittedFile: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lecturerAccepted: { type: Boolean, default: null }, // null = not reviewed, true = accepted, false = rejected
  lecturerAcceptedAt: { type: Date },
  lecturerAcceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lecturerFeedback: { type: String }, // feedback before grading
  status: { type: String, enum: ['pending', 'submitted', 'reviewed', 'graded', 'late'], default: 'pending' },
  submittedAt: { type: Date },
  grade: { type: Number },
  feedback: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
