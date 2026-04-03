const mongoose = require('mongoose');
const User = require('./models/User');
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
    // Check if admin user already exists
    const adminExists = await User.findOne({ email: 'admin@bdu.edu.et' });
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    // Create default users
    const users = [
      {
        name: 'System Admin',
        email: 'admin@bdu.edu.et',
        password: 'admin123',
        role: 'admin',
        department: 'IT',
        phone: '+251911000000'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@bdu.edu.et',
        password: 'faculty123',
        role: 'faculty',
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
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.email}`);
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedUsers();
  process.exit(0);
};

runSeed();