const express = require('express');
const router = express.Router();
const { getAssignments, createAssignment, submitAssignment, getUpcomingAssignments, deleteAssignment, gradeAssignment } = require('../controllers/assignmentController');
const { protect, admin, lecturer } = require('../middleware/authMiddleware');

router.get('/', getAssignments);
router.get('/upcoming', getUpcomingAssignments);
router.post('/', protect, (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'lecturer') return next();
  res.status(403).json({ message: 'Not authorized' });
}, createAssignment);
router.put('/:id/submit', protect, submitAssignment);
router.put('/:id/grade', protect, (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'lecturer') return next();
  res.status(403).json({ message: 'Not authorized' });
}, gradeAssignment);
router.delete('/:id', protect, (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'lecturer') return next();
  res.status(403).json({ message: 'Not authorized' });
}, deleteAssignment);

module.exports = router;
