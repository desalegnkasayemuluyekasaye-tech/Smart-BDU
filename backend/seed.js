const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Schedule = require('./models/Schedule');
const Announcement = require('./models/Announcement');
const Assignment = require('./models/Assignment');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    const users = [
      {
        name: 'System Admin',
        email: 'admin@bdu.edu.et',
        password: 'admin123',
        employeeId: 'ADM001',
        role: 'admin',
        department: 'IT',
        phone: '+251911000000'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@bdu.edu.et',
        password: 'faculty123',
        employeeId: 'LEC001',
        role: 'lecturer',
        department: 'Computer Science',
        phone: '+251911111111'
      },
      {
        name: 'Abebe Kebede',
        email: 'abebe.kebede@bdu.edu.et',
        password: 'student123',
        studentId: 'BDU2024001',
        role: 'student',
        department: 'Computer Science',
        year: 3,
        phone: '+251922222222'
      }
    ];

    for (const userData of users) {
      const { email, studentId, employeeId } = userData;
      let existingUser = await User.findOne({
        $or: [
          { email },
          { studentId },
          { employeeId }
        ].filter(q => q[Object.keys(q)[0]] !== undefined)
      });
      
      if (existingUser) {
        existingUser.name = userData.name;
        existingUser.password = userData.password;
        existingUser.role = userData.role;
        existingUser.department = userData.department;
        existingUser.phone = userData.phone;
        if (userData.employeeId) existingUser.employeeId = userData.employeeId;
        if (userData.studentId) existingUser.studentId = userData.studentId;
        await existingUser.save();
        console.log(`Updated user: ${email}`);
      } else {
        const user = new User(userData);
        await user.save();
        console.log(`Created user: ${email}`);
      }
    }
  } catch (error) {
    console.error('User seeding error:', error);
  }
};

const seedCourses = async () => {
  try {
    const courses = [
      { name: 'Data Structures and Algorithms', code: 'CSE301', department: 'Computer Science', year: 3, semester: 1, credits: 4, instructor: 'Sarah Johnson' },
      { name: 'Database Management Systems', code: 'CSE302', department: 'Computer Science', year: 3, semester: 1, credits: 3, instructor: 'Dr. Solomon Tadesse' },
      { name: 'Computer Networks', code: 'CSE303', department: 'Computer Science', year: 3, semester: 1, credits: 3, instructor: 'Dr. Lemma Abera' },
      { name: 'Software Engineering', code: 'CSE304', department: 'Computer Science', year: 3, semester: 1, credits: 4, instructor: 'Sarah Johnson' },
      { name: 'Operating Systems', code: 'CSE305', department: 'Computer Science', year: 3, semester: 1, credits: 3, instructor: 'Dr. Alemu Gebre' },
    ];

    for (const courseData of courses) {
      const existing = await Course.findOne({ code: courseData.code });
      if (!existing) {
        await Course.create(courseData);
        console.log(`Created course: ${courseData.code}`);
      } else {
        console.log(`Course already exists: ${courseData.code}`);
      }
    }
  } catch (error) {
    console.error('Course seeding error:', error);
  }
};

const seedSchedules = async () => {
  try {
    const schedules = [
      { day: 'monday', startTime: '08:00', endTime: '09:30', courseName: 'Data Structures and Algorithms', courseCode: 'CSE301', room: 'Room 101', building: 'CS Building', year: 3, department: 'Computer Science' },
      { day: 'monday', startTime: '10:00', endTime: '11:30', courseName: 'Database Management Systems', courseCode: 'CSE302', room: 'Lab 1', building: 'CS Building', year: 3, department: 'Computer Science' },
      { day: 'monday', startTime: '14:00', endTime: '15:30', courseName: 'Computer Networks', courseCode: 'CSE303', room: 'Room 205', building: 'CS Building', year: 3, department: 'Computer Science' },
      { day: 'tuesday', startTime: '08:00', endTime: '09:30', courseName: 'Software Engineering', courseCode: 'CSE304', room: 'Room 101', building: 'CS Building', year: 3, department: 'Computer Science' },
      { day: 'tuesday', startTime: '10:00', endTime: '11:30', courseName: 'Operating Systems', courseCode: 'CSE305', room: 'Lab 2', building: 'CS Building', year: 3, department: 'Computer Science' },
      { day: 'wednesday', startTime: '08:00', endTime: '09:30', courseName: 'Data Structures and Algorithms', courseCode: 'CSE301', room: 'Room 101', building: 'CS Building', year: 3, department: 'Computer Science' },
      { day: 'wednesday', startTime: '10:00', endTime: '11:30', courseName: 'Database Management Systems', courseCode: 'CSE302', room: 'Lab 1', building: 'CS Building', year: 3, department: 'Computer Science' },
      { day: 'thursday', startTime: '08:00', endTime: '09:30', courseName: 'Computer Networks', courseCode: 'CSE303', room: 'Room 205', building: 'CS Building', year: 3, department: 'Computer Science' },
      { day: 'thursday', startTime: '10:00', endTime: '11:30', courseName: 'Software Engineering', courseCode: 'CSE304', room: 'Room 101', building: 'CS Building', year: 3, department: 'Computer Science' },
      { day: 'friday', startTime: '08:00', endTime: '09:30', courseName: 'Operating Systems', courseCode: 'CSE305', room: 'Lab 2', building: 'CS Building', year: 3, department: 'Computer Science' },
    ];

    for (const sched of schedules) {
      const existing = await Schedule.findOne({ day: sched.day, startTime: sched.startTime, courseCode: sched.courseCode });
      if (!existing) {
        await Schedule.create(sched);
        console.log(`Created schedule: ${sched.day} ${sched.startTime} ${sched.courseCode}`);
      }
    }
  } catch (error) {
    console.error('Schedule seeding error:', error);
  }
};

const seedAnnouncements = async () => {
  try {
    const announcements = [
      { title: 'Mid-Term Exam Schedule', content: 'The mid-term exams for all 3rd year courses will be held from May 15-20, 2024. Detailed schedule will be posted soon.', category: 'academic', priority: 'important', department: 'Computer Science' },
      { title: 'Library Hours Extended', content: 'During exam preparation period, the main library will remain open 24/7 for students.', category: 'general', priority: 'normal', department: '' },
      { title: 'Campus WiFi Maintenance', content: 'The IT department will perform maintenance on campus WiFi on Saturday from 2 AM to 6 AM. Expect temporary interruptions.', category: 'urgent', priority: 'urgent', department: '' },
      { title: 'Guest Lecture by Industry Expert', content: 'Dr. Michael Chen from Google will give a guest lecture on "AI in Software Development" on Friday at 2 PM in Room 301.', category: 'event', priority: 'normal', department: 'Computer Science' },
      { title: 'Course Registration Opens', content: 'Course registration for the next semester opens on April 1st. Please consult with your academic advisor.', category: 'academic', priority: 'important', department: '' },
    ];

    for (const ann of announcements) {
      const existing = await Announcement.findOne({ title: ann.title });
      if (!existing) {
        await Announcement.create(ann);
        console.log(`Created announcement: ${ann.title}`);
      }
    }
  } catch (error) {
    console.error('Announcement seeding error:', error);
  }
};

const seedAssignments = async () => {
  try {
    const dueDate1 = new Date();
    dueDate1.setDate(dueDate1.getDate() + 7);
    const dueDate2 = new Date();
    dueDate2.setDate(dueDate2.getDate() + 14);
    const dueDate3 = new Date();
    dueDate3.setDate(dueDate3.getDate() + 21);

    const assignments = [
      { title: 'Implement Binary Search Tree', description: 'Implement a complete BST with insert, delete, and search operations in C++', courseName: 'Data Structures and Algorithms', courseCode: 'CSE301', dueDate: dueDate1, points: 100 },
      { title: 'Design ER Diagram for Library System', description: 'Create an ER diagram for a library management system and normalize to 3NF', courseName: 'Database Management Systems', courseCode: 'CSE302', dueDate: dueDate2, points: 50 },
      { title: 'Configure Network Topology', description: 'Design and configure a network topology with routers and switches using Cisco Packet Tracer', courseName: 'Computer Networks', courseCode: 'CSE303', dueDate: dueDate3, points: 50 },
    ];

    for (const assign of assignments) {
      const existing = await Assignment.findOne({ title: assign.title });
      if (!existing) {
        await Assignment.create(assign);
        console.log(`Created assignment: ${assign.title}`);
      }
    }
  } catch (error) {
    console.error('Assignment seeding error:', error);
  }
};

const runSeed = async () => {
  await connectDB();
  console.log('Starting seeding...');
  await seedUsers();
  await seedCourses();
  await seedSchedules();
  await seedAnnouncements();
  await seedAssignments();
  console.log('All seeding completed successfully');
  process.exit(0);
};

runSeed();
