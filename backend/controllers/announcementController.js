const Announcement = require('../models/Announcement');

const getAnnouncements = async (req, res) => {
  try {
    const { category, department, page = 1, limit = 10 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (department) query.department = department;
    
    const announcements = await Announcement.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const count = await Announcement.countDocuments(query);
    res.json({ announcements, totalPages: Math.ceil(count / limit), currentPage: page });
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
    const announcement = await Announcement.findById(req.params.id);
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnnouncements, createAnnouncement, getAnnouncementById };
