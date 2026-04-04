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
    // Clear existing test users
    await User.deleteMany({ 
      $or: [
        { email: 'admin@bdu.edu.et' },
        { email: 'sarah.johnson@bdu.edu.et' },
        { email: 'abebe.kebede@bdu.edu.et' }
      ]
    });
    console.log('Cleared existing test users');

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
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@bdu.edu.et',
        password: 'faculty123',
        employeeId: 'TG2024001',
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
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.email} with role: ${userData.role}`);
    }

    // Verify users were created
    const allUsers = await User.find({});
    console.log(`Total users in database: ${allUsers.length}`);
    allUsers.forEach(u => console.log(`  - ${u.email} (${u.role}, studentId: ${u.studentId || 'none'}, employeeId: ${u.employeeId || 'none'})`));

    console.log('\n✅ Seeding completed successfully!');
    console.log('\nTest Accounts:');
    console.log('  Admin: admin@bdu.edu.et / admin123');
    console.log('  Teacher: sarah.johnson@bdu.edu.et / faculty123 (or TG2024001)');
    console.log('  Student: abebe.kebede@bdu.edu.et / student123 (or BDU2024001)');
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