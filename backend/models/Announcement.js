const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['general', 'academic', 'event', 'urgent'], default: 'general' },
  targetType: { type: String, enum: ['all', 'department', 'batch', 'section', 'teachers'], default: 'all' },
  department: { type: String },
  batch: { type: String },
  section: { type: String },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  priority: { type: String, enum: ['normal', 'important', 'urgent'], default: 'normal' },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  attachments: [{ type: String }],
  expiresAt: { type: Date },
}, { timestamps: true });

announcementSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
