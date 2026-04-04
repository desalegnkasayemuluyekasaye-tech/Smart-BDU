const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  studentId: { type: String, unique: true, sparse: true },
  employeeId: { type: String, unique: true, sparse: true },
  department: { type: String },
  year: { type: Number },
  phone: { type: String },
  role: { type: String, enum: ['student', 'admin', 'faculty', 'lecturer'], default: 'student' },
  avatar: { type: String },
  // For teachers - can teach multiple departments/classes
  departments: [{ type: String }],
  classes: [{ 
    department: String,
    year: Number,
    section: String
  }],
}, { timestamps: true });


userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
