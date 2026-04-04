const express = require('express');
const router = express.Router();
const { getSchedule, getMySchedule, createSchedule, createBatchSchedule, updateSchedule, deleteSchedule } = require('../controllers/scheduleController');
const { protect, admin, lecturer } = require('../middleware/authMiddleware');

router.get('/me', protect, lecturer, getMySchedule);
router.get('/', protect, getSchedule);
router.post('/', protect, admin, createSchedule);
router.post('/batch', protect, admin, createBatchSchedule);
router.put('/:id', protect, admin, updateSchedule);
router.delete('/:id', protect, admin, deleteSchedule);

module.exports = router;
