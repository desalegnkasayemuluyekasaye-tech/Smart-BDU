const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['cafeteria', 'dormitory', 'transport', 'library', 'health'], required: true },
  description: { type: String },
  location: { type: String },
  hours: { type: String },
  contact: { type: String },
  menu: [{
    day: { type: String },
    breakfast: [{ type: String }],
    lunch: [{ type: String }],
    dinner: [{ type: String }]
  }],
  routes: [{
    routeName: { type: String },
    schedule: [{ type: String }],
    stops: [{ type: String }]
  }],
  rooms: [{
    building: { type: String },
    roomNumber: { type: String },
    capacity: { type: Number },
    available: { type: Boolean, default: true }
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
