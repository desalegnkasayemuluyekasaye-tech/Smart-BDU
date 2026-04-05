const Course = require('../models/Course');

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function canManageCourse(course, user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (course.instructorId && course.instructorId.toString() === user._id.toString()) return true;
  if (!course.instructorId && course.instructor && user.name) {
    const ins = String(course.instructor).trim().toLowerCase();
    const uname = String(user.name).trim().toLowerCase();
    const first = String(user.name).split(/\s+/)[0]?.toLowerCase() || '';
    return ins === uname || (first.length >= 2 && ins.includes(first));
  }
  return false;
}

const getMyCourses = async (req, res) => {
  try {
    const uid = req.user._id;
    const name = (req.user.name || '').trim();
    const first = name.split(/\s+/)[0] || '';

    let courses;
    if (req.user.role === 'lecturer') {
      const or = [{ instructorId: uid }];
      if (name) {
        or.push({ instructor: new RegExp(`^${escapeRegex(name)}$`, 'i') });
      }
      if (first.length >= 2) {
        or.push({ instructor: new RegExp(escapeRegex(first), 'i') });
      }
      courses = await Course.find({ $or: or }).populate('enrolledStudents.studentId', 'name studentId email').sort({ code: 1 });
    } else {
      // For students, find courses where they are enrolled (pending or accepted)
      courses = await Course.find({
        'enrolledStudents.studentId': uid
      }).sort({ code: 1 });
    }
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCourses = async (req, res) => {
  try {
    const { year, department, semester, section, instructor } = req.query;
    const query = {};
    if (year)       query.year       = parseInt(year);
    if (department) query.department = department;
    if (semester)   query.semester   = parseInt(semester);
    if (section)    query.section    = section;
    if (instructor) query.instructor = { $regex: instructor, $options: 'i' };
    const courses = await Course.find(query);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lecturer creates their own course for a specific batch/dept/sem/section
const createCourseByLecturer = async (req, res) => {
  try {
    const { name, code, department, year, semester, section, credits, description } = req.body;
    if (!name || !code || !department || !year || !semester) {
      return res.status(400).json({ message: 'name, code, department, year and semester are required' });
    }
    const course = await Course.create({
      name, code, department,
      year: parseInt(year),
      semester: parseInt(semester),
      section: section || '',
      credits: credits ? parseInt(credits) : undefined,
      description,
      instructor: req.user.name,
      instructorId: req.user._id,
      createdBy: 'lecturer',
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if (!canManageCourse(course, req.user)) {
      return res.status(403).json({ message: 'Not authorized to add materials to this course' });
    }
    const material = { ...req.body, uploadedAt: req.body.uploadedAt || new Date() };
    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      { $push: { materials: material } },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    const isEnrolled = course.enrolledStudents.some(s => s.studentId.toString() === req.user._id.toString());
    if (isEnrolled) return res.status(400).json({ message: 'Already enrolled' });

    course.enrolledStudents.push({
      studentId: req.user._id,
      status: 'pending'
    });
    await course.save();
    res.json({ message: 'Enrollment requested', status: 'pending' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const acceptStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    if (!canManageCourse(course, req.user)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const student = course.enrolledStudents.find(s => s.studentId.toString() === studentId);
    if (!student) return res.status(404).json({ message: 'Student not found in enrollment' });

    student.status = 'accepted';
    await course.save();
    res.json({ message: 'Student enrollment accepted', status: 'accepted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCourses,
  getMyCourses,
  createCourse,
  createCourseByLecturer,
  getCourseById,
  addMaterial,
  deleteCourse,
  updateCourse,
  enrollCourse,
  acceptStudent
};
