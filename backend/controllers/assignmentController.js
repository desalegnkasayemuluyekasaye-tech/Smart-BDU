const Assignment = require('../models/Assignment');

const getAssignments = async (req, res) => {
  try {
    const { course, status, dueDate } = req.query;
    const query = {};
    if (course) query.course = course;
    if (status) query.status = status;

    const assignments = await Assignment.find(query).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.create(req.body);
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { status: 'submitted', submittedAt: new Date() },
      { new: true }
    );
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUpcomingAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      dueDate: { $gte: new Date() },
      status: { $ne: 'submitted' }
    }).sort({ dueDate: 1 }).limit(5);
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const gradeAssignment = async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { grade, feedback, status: 'graded' },
      { new: true }
    );
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAssignments, createAssignment, submitAssignment, getUpcomingAssignments, deleteAssignment, gradeAssignment };
