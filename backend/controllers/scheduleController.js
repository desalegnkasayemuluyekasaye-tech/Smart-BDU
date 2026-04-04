const Schedule = require('../models/Schedule');

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const getMySchedule = async (req, res) => {
  try {
    const name = (req.user.name || '').trim();
    const first = name.split(/\s+/)[0] || '';
    const or = [];
    if (name) {
      or.push({ instructor: new RegExp(`^${escapeRegex(name)}$`, 'i') });
    }
    if (first.length >= 2) {
      or.push({ instructor: new RegExp(escapeRegex(first), 'i') });
    }
    if (or.length === 0) {
      return res.json([]);
    }
    const schedules = await Schedule.find({ $or: or }).sort({ day: 1, startTime: 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSchedule = async (req, res) => {
  try {
    const { day, year, department, section, semester } = req.query;
    const query = {};
    if (day) query.day = day;
    if (year) query.year = parseInt(year);
    if (department) query.department = department;
    if (section) query.section = section;
    if (semester) query.semester = parseInt(semester);

    const schedules = await Schedule.find(query).sort({ day: 1, startTime: 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a full batch schedule at once (array of entries sharing dept/year/section/semester)
const createBatchSchedule = async (req, res) => {
  try {
    const { department, year, semester, section, entries } = req.body;
    if (!department || !year || !entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ message: 'department, year, and entries are required' });
    }
    const docs = entries.map(e => ({
      department,
      year: parseInt(year),
      semester: semester ? parseInt(semester) : undefined,
      section: section || undefined,
      day: e.day,
      startTime: e.startTime,
      endTime: e.endTime,
      courseName: e.courseName,
      courseCode: e.courseCode || undefined,
      instructor: e.instructor || undefined,
      room: e.room || undefined,
      building: e.building || undefined,
    }));
    const created = await Schedule.insertMany(docs);
    res.status(201).json({ message: `${created.length} schedule entries created`, schedules: created });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.create(req.body);
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSchedule, getMySchedule, createSchedule, createBatchSchedule, updateSchedule, deleteSchedule };
