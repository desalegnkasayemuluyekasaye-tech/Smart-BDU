const Course = require('../models/Course');

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
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $push: { materials: req.body } },
      { new: true }
    );
    res.json(course);
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

module.exports = { getCourses, createCourse, createCourseByLecturer, getCourseById, addMaterial, deleteCourse, updateCourse };
