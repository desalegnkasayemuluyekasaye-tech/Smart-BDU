const Directory = require('../models/Directory');

const getDirectory = async (req, res) => {
  try {
    const { role, department, search } = req.query;
    const query = { isActive: true };
    if (role) query.role = role;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    const directory = await Directory.find(query);
    res.json(directory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createDirectoryEntry = async (req, res) => {
  try {
    const entry = await Directory.create(req.body);
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDirectory, createDirectoryEntry };
