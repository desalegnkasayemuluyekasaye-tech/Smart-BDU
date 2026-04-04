const express = require('express');
const router = express.Router();
const { getAnnouncements, createAnnouncement, getAnnouncementById } = require('../controllers/announcementController');
const { protect, admin, lecturer } = require('../middleware/authMiddleware');

router.get('/', getAnnouncements);
router.get('/:id', getAnnouncementById);
router.post('/', protect, (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'lecturer') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized to post announcements' });
  }
}, createAnnouncement);

module.exports = router;
