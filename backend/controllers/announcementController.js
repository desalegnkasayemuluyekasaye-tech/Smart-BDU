const Announcement = require('../models/Announcement');

// Build a query that matches announcements relevant to the requesting user
const buildUserQuery = (user) => {
  if (!user) return {};
  if (user.role === 'admin') return {};

  if (user.role === 'lecturer') {
    return {
      $or: [
        { targetType: 'all' },
        { targetType: 'teachers' },
        { targetType: 'department', department: user.department }
      ]
    };
  }

  // student
  const conditions = [{ targetType: 'all' }];
  if (user.department) conditions.push({ targetType: 'department', department: user.department });
  if (user.department && user.year) conditions.push({ targetType: 'batch', department: user.department, batch: String(user.year) });
  if (user.department && user.year && user.section) {
    conditions.push({ targetType: 'section', department: user.department, batch: String(user.year), section: user.section });
  }
  return { $or: conditions };
};

const getAnnouncements = async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const query = buildUserQuery(req.user);
    if (category) query.category = category;

    const announcements = await Announcement.find(query)
      .populate('postedBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const count = await Announcement.countDocuments(query);

    // attach unread flag per announcement
    const userId = req.user?._id?.toString();
    const result = announcements.map(a => ({
      ...a.toObject(),
      isRead: userId ? a.readBy.map(id => id.toString()).includes(userId) : true
    }));

    res.json({ announcements: result, totalPages: Math.ceil(count / limit), currentPage: page, total: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Returns unread count + latest 5 unread for notification bell
const getNotifications = async (req, res) => {
  try {
    const query = buildUserQuery(req.user);
    const userId = req.user._id;

    const unreadQuery = { ...query, readBy: { $ne: userId } };
    const [unreadCount, latest] = await Promise.all([
      Announcement.countDocuments(unreadQuery),
      Announcement.find(unreadQuery).sort({ createdAt: -1 }).limit(5).populate('postedBy', 'name')
    ]);

    res.json({ unreadCount, notifications: latest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { ids } = req.body; // array of announcement IDs
    await Announcement.updateMany(
      { _id: { $in: ids } },
      { $addToSet: { readBy: req.user._id } }
    );
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create({ ...req.body, postedBy: req.user._id });
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate('postedBy', 'name role');
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnnouncements, createAnnouncement, getAnnouncementById, deleteAnnouncement, getNotifications, markAsRead };
