const Course = require('../models/Course');

const getCourses = async (req, res) => {
  try {
    const { year, department, semester } = req.query;
    const query = {};
    if (year) query.year = parseInt(year);
    if (department) query.department = department;
    if (semester) query.semester = parseInt(semester);

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

module.exports = { getCourses, createCourse, getCourseById, addMaterial };
