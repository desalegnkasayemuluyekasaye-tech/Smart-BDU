const express = require('express');
const router = express.Router();
const { getAnnouncements, createAnnouncement, getAnnouncementById } = require('../controllers/announcementController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getAnnouncements);
router.get('/:id', getAnnouncementById);
router.post('/', protect, admin, createAnnouncement);

module.exports = router;
