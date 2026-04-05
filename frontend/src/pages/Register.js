import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    department: '',
    year: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = await authService.register(formData);
      if (data.token) {
        login(data, data.token);
        navigate('/app');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">
          <h2>Smart<span>BDU</span></h2>
          <p>Create Your Account</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} placeholder="Enter your name" required />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} placeholder="Enter your email" required />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} placeholder="Create a password" required />
          </div>
          
          <div className="form-group">
            <label>Student ID</label>
            <input type="text" name="studentId" className="form-control" value={formData.studentId} onChange={handleChange} placeholder="Enter student ID" />
          </div>
          
          <div className="form-group">
            <label>Department</label>
            <input type="text" name="department" className="form-control" value={formData.department} onChange={handleChange} placeholder="Enter department" />
          </div>
          
          <div className="form-group">
            <label>Year</label>
            <input type="number" name="year" className="form-control" value={formData.year} onChange={handleChange} placeholder="Enter year" min="1" max="5" />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
        
        <p style={{ marginTop: '15px', textAlign: 'center' }}>
          <Link to="/" style={{ color: '#666', textDecoration: 'none' }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
