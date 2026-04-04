const Assignment = require('../models/Assignment');

const getAssignments = async (req, res) => {
  try {
    const { course, status, dueDate, section } = req.query;
    const query = {};
    if (course) query.course = course;
    if (status) query.status = status;
    if (section) query.$or = [
      { section },
      { section: '' },
      { section: { $exists: false } }
    ];

    const assignments = await Assignment.find(query).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAssignment = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.dueDate) {
      const due = new Date(payload.dueDate);
      if (payload.dueTime) {
        const [hours, minutes] = payload.dueTime.split(':').map(Number);
        due.setHours(hours, minutes, 0, 0);
      }
      payload.dueDate = due;
    }
    const assignment = await Assignment.create(payload);
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitAssignment = async (req, res) => {
  try {
    const { fileId, section, accepted } = req.body || {};
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const now = new Date();
    const status = assignment.dueDate && assignment.dueDate < now ? 'late' : 'submitted';
    assignment.status = status;
    assignment.submittedAt = now;
    assignment.submittedBy = req.user._id;
    if (fileId) assignment.submittedFile = fileId;
    if (accepted) assignment.accepted = true;
    if (section) assignment.section = section;
    await assignment.save();

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const acceptAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { accepted: true },
      { new: true }
    );
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reviewSubmission = async (req, res) => {
  try {
    const { accepted, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    if (assignment.status !== 'submitted') {
      return res.status(400).json({ message: 'Assignment must be submitted before review' });
    }

    assignment.lecturerAccepted = accepted;
    assignment.lecturerAcceptedAt = new Date();
    assignment.lecturerAcceptedBy = req.user._id;
    assignment.lecturerFeedback = feedback || undefined;
    assignment.status = 'reviewed';
    
    await assignment.save();
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUpcomingAssignments = async (req, res) => {
  try {
    const { section } = req.query;
    const query = {
      dueDate: { $gte: new Date() },
      status: { $ne: 'submitted' }
    };
    if (section) query.$or = [
      { section },
      { section: '' },
      { section: { $exists: false } }
    ];

    const assignments = await Assignment.find(query).sort({ dueDate: 1 }).limit(5);
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

module.exports = { getAssignments, createAssignment, submitAssignment, acceptAssignment, reviewSubmission, getUpcomingAssignments, deleteAssignment, gradeAssignment };
