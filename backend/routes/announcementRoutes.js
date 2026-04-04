const express = require('express');
const router = express.Router();
const { getAnnouncements, createAnnouncement, getAnnouncementById, deleteAnnouncement, getNotifications, markAsRead } = require('../controllers/announcementController');
const { protect, admin, lecturer } = require('../middleware/authMiddleware');

router.get('/', protect, getAnnouncements);
router.get('/notifications', protect, getNotifications);
router.put('/mark-read', protect, markAsRead);
router.get('/:id', getAnnouncementById);
router.post('/', protect, (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'lecturer') return next();
  res.status(403).json({ message: 'Not authorized to post announcements' });
}, createAnnouncement);
router.delete('/:id', protect, (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'lecturer') return next();
  res.status(403).json({ message: 'Not authorized' });
}, deleteAnnouncement);

module.exports = router;
