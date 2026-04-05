const Assignment = require('../models/Assignment');
const User = require('../models/User');
const Notification = require('../models/Notification');

const getAssignments = async (req, res) => {
  try {
    const { course, status, dueDate, section, department, year, semester, createdBy } = req.query;
    const query = {};
    
    // Legacy course-based filtering
    if (course) query.course = course;
    
    // New targeting-based filtering
    if (department) query.department = department;
    if (year) query.year = parseInt(year);
    if (semester) query.semester = semester;
    
    // Section filtering - show assignments for student's section OR no section (general)
    if (section) {
      query.$or = [
        { section: section },
        { section: { $exists: false } },
        { section: '' },
        { section: null }
      ];
    }
    
    // Created by current user
    if (createdBy === 'true') query.createdBy = req.user._id;
    
    // Status filtering
    if (status) query.status = status;
    
    console.log('Getting assignments with params - dept:', department, 'year:', year, 'semester:', semester, 'section:', section);
    console.log('Query:', JSON.stringify(query));
    const assignments = await Assignment.find(query).sort({ dueDate: 1 });
    console.log('Found assignments:', assignments.length);
    
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAssignment = async (req, res) => {
  try {
    const payload = { ...req.body, createdBy: req.user._id };
    if (payload.dueDate) {
      const due = new Date(payload.dueDate);
      if (payload.dueTime) {
        const [hours, minutes] = payload.dueTime.split(':').map(Number);
        due.setHours(hours, minutes, 0, 0);
      }
      payload.dueDate = due;
    }
    const assignment = await Assignment.create(payload);

    // Find targeted students and send notifications
    const studentQuery = { role: 'student', department: payload.department };
    if (payload.year) studentQuery.year = payload.year;
    if (payload.semester) studentQuery.semester = payload.semester;
    if (payload.section) {
      // Match students with specific section OR no section (optional)
      studentQuery.$or = [
        { section: payload.section },
        { section: { $exists: false } },
        { section: '' },
        { section: null }
      ];
    }
    
    const students = await User.find(studentQuery).select('_id');
    console.log('Found students for assignment notification:', students.length, 'dept:', payload.department, 'year:', payload.year, 'sem:', payload.semester, 'section:', payload.section);
    
    if (students.length > 0) {
      const dueDateStr = new Date(payload.dueDate).toLocaleDateString();
      const notifications = students.map(student => ({
        userId: student._id,
        title: `New Assignment: ${payload.title}`,
        message: `A new assignment "${payload.title}" has been posted for ${payload.department} - Year ${payload.year}, Semester ${payload.semester}. Due Date: ${dueDateStr}`,
        type: 'assignment',
        relatedId: assignment._id,
        relatedType: 'Assignment'
      }));
      
      await Notification.insertMany(notifications);
      console.log('Assignment notifications sent:', notifications.length);
    }

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
    const { section, department, year, semester } = req.query;
    const query = {
      dueDate: { $gte: new Date() },
      status: { $ne: 'submitted' }
    };
    
    // Add targeting filters
    if (department) query.department = department;
    if (year) query.year = parseInt(year);
    if (semester) query.semester = semester;
    if (section) {
      query.$or = [
        { section: section },
        { section: { $exists: false } },
        { section: '' },
        { section: null }
      ];
    }

    console.log('Getting upcoming assignments with query:', JSON.stringify(query));
    const assignments = await Assignment.find(query).sort({ dueDate: 1 }).limit(5);
    console.log('Found upcoming assignments:', assignments.length);
    
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
