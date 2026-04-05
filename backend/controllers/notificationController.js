const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

const notifyStudents = async (students, title, message, type, relatedId) => {
  try {
    const notifications = students.map(student => ({
      userId: student._id,
      title,
      message,
      type,
      relatedId,
      relatedType: type
    }));
    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Error notifying students:', error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  createNotification,
  notifyStudents
};
