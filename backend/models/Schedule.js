const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  courseName: { type: String, required: true },
  courseCode: { type: String },
  instructor: { type: String },
  room: { type: String },
  building: { type: String },
  year: { type: Number },
  semester: { type: Number },
  section: { type: String },
  department: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
