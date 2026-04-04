const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Target specific department or class
  targetType: {
    type: String,
    enum: ['all', 'department', 'class', 'year'],
    default: 'all'
  },
  targetDepartment: String,
  targetYear: Number,
  targetClass: String,
  // For file attachments
  attachments: [{
    fileName: String,
    originalName: String,
    fileUrl: String,
    mimeType: String,
    size: Number
  }],
  category: {
    type: String,
    enum: ['announcement', 'assignment', 'material', 'notice'],
    default: 'announcement'
  },
  priority: {
    type: String,
    enum: ['normal', 'important', 'urgent'],
    default: 'normal'
  },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);