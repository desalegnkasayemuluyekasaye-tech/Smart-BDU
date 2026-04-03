const express = require('express');
const router = express.Router();
const { getCourses, createCourse, getCourseById, addMaterial } = require('../controllers/courseController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/', protect, admin, createCourse);
router.post('/:id/materials', protect, admin, addMaterial);

module.exports = router;
