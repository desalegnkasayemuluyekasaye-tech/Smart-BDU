const express = require('express');
const router = express.Router();
const { getSchedule, createSchedule, createBatchSchedule, updateSchedule, deleteSchedule } = require('../controllers/scheduleController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getSchedule);
router.post('/', protect, admin, createSchedule);
router.post('/batch', protect, admin, createBatchSchedule);
router.put('/:id', protect, admin, updateSchedule);
router.delete('/:id', protect, admin, deleteSchedule);

module.exports = router;
