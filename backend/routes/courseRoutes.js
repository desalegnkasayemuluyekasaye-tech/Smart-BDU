const express = require('express');
const router = express.Router();
const {
  getCourses,
  getMyCourses,
  createCourse,
  createCourseByLecturer,
  getCourseById,
  addMaterial,
  deleteCourse,
  updateCourse,
} = require('../controllers/courseController');
const { protect, admin, lecturer } = require('../middleware/authMiddleware');

// static routes FIRST — before any /:id patterns
router.get('/', getCourses);
router.get('/me', protect, lecturer, getMyCourses);
router.post('/', protect, admin, createCourse);
router.post('/lecturer', protect, lecturer, createCourseByLecturer);

// dynamic routes AFTER
router.get('/:id', getCourseById);
router.put('/:id', protect, admin, updateCourse);
router.delete('/:id', protect, admin, deleteCourse);
router.post('/:id/materials', protect, lecturer, addMaterial);

module.exports = router;
