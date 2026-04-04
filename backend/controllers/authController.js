const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'smartbdu_secret_key_2024', { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, studentId, employeeId, department, year, phone, role } = req.body;
    
    let existingUser = await User.findOne({ 
      $or: [
        { email: email },
        { studentId: studentId },
        { employeeId: employeeId }
      ].filter(q => q[Object.keys(q)[0]] !== undefined)
    });
    
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, studentId, employeeId, department, year, phone, role });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { id, password } = req.body;
    
    let user = await User.findOne({ studentId: id });
    if (!user) {
      user = await User.findOne({ employeeId: id });
    }
    if (!user) {
      user = await User.findOne({ email: id });
    }
    
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
        employeeId: user.employeeId,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid ID or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.department = req.body.department || user.department;
      if (req.body.password) user.password = req.body.password;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, studentId, employeeId, department, year, phone, role, departments, classes } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Auto-generate initial password from ID
    let initialPassword;
    if (role === 'faculty' && employeeId) {
      initialPassword = employeeId; // Teacher password = employeeId
    } else if (studentId) {
      initialPassword = studentId; // Student password = studentId
    } else {
      initialPassword = email.split('@')[0]; // Fallback
    }

    const user = await User.create({ 
      name, 
      email, 
      password: initialPassword, 
      studentId: role === 'student' ? studentId : undefined,
      employeeId: role === 'faculty' ? employeeId : undefined,
      department, 
      year, 
      phone,
      role: role || 'student',
      departments: role === 'faculty' ? departments : undefined,
      classes: role === 'faculty' ? classes : undefined
    });
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      employeeId: user.employeeId,
      initialPassword: initialPassword // Return this so admin can inform user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if current password matches (unless it's initial login)
    const isMatch = await user.matchPassword(currentPassword);
    
    // Allow password change if:
    // 1. Current password matches, OR
    // 2. User is using their initial password (studentId or employeeId)
    const isInitialPassword = (user.studentId && currentPassword === user.studentId) ||
                             (user.employeeId && currentPassword === user.employeeId);
    
    if (!isMatch && !isInitialPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile, createUserByAdmin, getAllUsers, deleteUser, changePassword };
