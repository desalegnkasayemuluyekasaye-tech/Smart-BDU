const express = require('express');
const router = express.Router();
const { getSchedule, createSchedule, updateSchedule, deleteSchedule } = require('../controllers/scheduleController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getSchedule);
router.post('/', protect, admin, createSchedule);
router.put('/:id', protect, admin, updateSchedule);
router.delete('/:id', protect, admin, deleteSchedule);

module.exports = router;
