const express = require('express');
const router = express.Router();
const { getAssignments, createAssignment, submitAssignment, getUpcomingAssignments } = require('../controllers/assignmentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getAssignments);
router.get('/upcoming', getUpcomingAssignments);
router.post('/', protect, admin, createAssignment);
router.put('/:id/submit', protect, submitAssignment);

module.exports = router;
