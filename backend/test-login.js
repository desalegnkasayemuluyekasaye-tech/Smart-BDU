const axios = require('axios');

const testLogin = async () => {
  try {
    // Test admin login
    console.log('Testing admin login...');
    const adminRes = await axios.post('http://localhost:5000/api/auth/login', {
      id: 'admin@bdu.edu.et',
      password: 'admin123'
    });
    console.log('Admin login:', adminRes.data);
    
    // Test student login
    console.log('\nTesting student login...');
    const studentRes = await axios.post('http://localhost:5000/api/auth/login', {
      id: 'BDU2024001',
      password: 'student123'
    });
    console.log('Student login:', studentRes.data);
    
    // Test teacher login
    console.log('\nTesting teacher login...');
    const teacherRes = await axios.post('http://localhost:5000/api/auth/login', {
      id: 'TG2024001',
      password: 'faculty123'
    });
    console.log('Teacher login:', teacherRes.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

testLogin();