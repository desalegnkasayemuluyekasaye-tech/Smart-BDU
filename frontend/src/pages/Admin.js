import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminService, courseService, announcementService } from '../services/api';
import './Admin.css';

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  // ================= USERS STATE =================
  const [studentForm, setStudentForm] = useState({
    name: '', email: '', password: '', studentId: '', department: '', year: '', phone: ''
  });
  const [teacherForm, setTeacherForm] = useState({
    name: '', email: '', password: '', department: '', phone: ''
  });
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [studentLoading, setStudentLoading] = useState(false);
  const [teacherLoading, setTeacherLoading] = useState(false);

  // ================= COURSES STATE =================
  const [courseForm, setCourseForm] = useState({
    name: '', code: '', department: '', year: '', semester: '', credits: ''
  });
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState(false);

  // ================= ANNOUNCEMENTS STATE =================
  const [announcementForm, setAnnouncementForm] = useState({
    title: '', content: '', category: 'general', priority: 'normal', department: ''
  });
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementLoading, setAnnouncementLoading] = useState(false);

  // ================= GENERAL STATE =================
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'courses') fetchCourses();
    else if (activeTab === 'announcements') fetchAnnouncements();
    
    // Clear messages when switching tabs
    setMessage('');
    setError('');
  }, [activeTab]);

  // ================= FETCHERS =================
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const userData = await adminService.getUsers();
      setUsers(userData);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const courseData = await courseService.getAll();
      setCourses(courseData);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    setAnnouncementsLoading(true);
    try {
      const annData = await announcementService.getAll();
      // the api returns { announcements: [], totalPages, currentPage }
      setAnnouncements(annData.announcements || []);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    } finally {
      setAnnouncementsLoading(false);
    }
  };


  // ================= HANDLERS: USERS =================
  const handleStudentChange = (e) => setStudentForm({ ...studentForm, [e.target.name]: e.target.value });
  const handleTeacherChange = (e) => setTeacherForm({ ...teacherForm, [e.target.name]: e.target.value });

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.email || !studentForm.password || !studentForm.studentId || !studentForm.department || !studentForm.year) {
      setError('Please fill in all required fields');
      return;
    }
    setStudentLoading(true);
    try {
      const studentData = { ...studentForm, role: 'student', year: parseInt(studentForm.year) || undefined };
      await adminService.createUser(studentData);
      setMessage('Student added successfully!');
      setStudentForm({ name: '', email: '', password: '', studentId: '', department: '', year: '', phone: '' });
      setError('');
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to add student');
      setMessage('');
    } finally {
      setStudentLoading(false);
    }
  };

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    if (!teacherForm.name || !teacherForm.email || !teacherForm.password || !teacherForm.department) {
      setError('Please fill in all required fields');
      return;
    }
    setTeacherLoading(true);
    try {
      await adminService.createUser({ ...teacherForm, role: 'faculty' });
      setMessage('Teacher added successfully!');
      setTeacherForm({ name: '', email: '', password: '', department: '', phone: '' });
      setError('');
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to add teacher');
      setMessage('');
    } finally {
      setTeacherLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminService.deleteUser(id);
        setMessage('User deleted successfully');
        fetchUsers();
      } catch (err) {
        setError(err.message || 'Failed to delete user');
      }
    }
  };

  // ================= HANDLERS: COURSES =================
  const handleCourseChange = (e) => setCourseForm({ ...courseForm, [e.target.name]: e.target.value });

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setCourseLoading(true);
    try {
      await courseService.createCourse(courseForm);
      setMessage('Course created successfully!');
      setCourseForm({ name: '', code: '', department: '', year: '', semester: '', credits: '' });
      setError('');
      fetchCourses();
    } catch (err) {
      setError(err.message || 'Failed to add course');
      setMessage('');
    } finally {
      setCourseLoading(false);
    }
  };

  // ================= HANDLERS: ANNOUNCEMENTS =================
  const handleAnnouncementChange = (e) => setAnnouncementForm({ ...announcementForm, [e.target.name]: e.target.value });

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setAnnouncementLoading(true);
    try {
      await announcementService.createAnnouncement(announcementForm);
      setMessage('Announcement created successfully!');
      setAnnouncementForm({ title: '', content: '', category: 'general', priority: 'normal', department: '' });
      setError('');
      fetchAnnouncements();
    } catch (err) {
      setError(err.message || 'Failed to add announcement');
      setMessage('');
    } finally {
      setAnnouncementLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return <div className="admin-access-denied">Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      
      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
        <button className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>Courses</button>
        <button className={`tab-btn ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => setActiveTab('announcements')}>Announcements</button>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* ================= USERS TAB ================= */}
      {activeTab === 'users' && (
        <div className="tab-content">
          <div className="admin-forms">
            <div className="form-section">
              <h2>Add Student</h2>
              <form onSubmit={handleStudentSubmit}>
                <div className="form-group"><label>Name: *</label><input type="text" name="name" value={studentForm.name} onChange={handleStudentChange} required /></div>
                <div className="form-group"><label>Email: *</label><input type="email" name="email" value={studentForm.email} onChange={handleStudentChange} required /></div>
                <div className="form-group"><label>Password: *</label><input type="password" name="password" value={studentForm.password} onChange={handleStudentChange} required /></div>
                <div className="form-group"><label>Student ID: *</label><input type="text" name="studentId" value={studentForm.studentId} onChange={handleStudentChange} required /></div>
                <div className="form-group"><label>Department: *</label><input type="text" name="department" value={studentForm.department} onChange={handleStudentChange} required /></div>
                <div className="form-group"><label>Year: *</label><input type="number" name="year" value={studentForm.year} onChange={handleStudentChange} required /></div>
                <div className="form-group"><label>Phone:</label><input type="text" name="phone" value={studentForm.phone} onChange={handleStudentChange} /></div>
                <button type="submit" className="submit-btn" disabled={studentLoading}>{studentLoading ? 'Adding...' : 'Add Student'}</button>
              </form>
            </div>

            <div className="form-section">
              <h2>Add Teacher</h2>
              <form onSubmit={handleTeacherSubmit}>
                <div className="form-group"><label>Name: *</label><input type="text" name="name" value={teacherForm.name} onChange={handleTeacherChange} required /></div>
                <div className="form-group"><label>Email: *</label><input type="email" name="email" value={teacherForm.email} onChange={handleTeacherChange} required /></div>
                <div className="form-group"><label>Password: *</label><input type="password" name="password" value={teacherForm.password} onChange={handleTeacherChange} required /></div>
                <div className="form-group"><label>Department: *</label><input type="text" name="department" value={teacherForm.department} onChange={handleTeacherChange} required /></div>
                <div className="form-group"><label>Phone:</label><input type="text" name="phone" value={teacherForm.phone} onChange={handleTeacherChange} /></div>
                <button type="submit" className="submit-btn" disabled={teacherLoading}>{teacherLoading ? 'Adding...' : 'Add Teacher'}</button>
              </form>
            </div>
          </div>

          <div className="data-section">
            <div className="section-header">
              <h2>Users Management</h2>
              <button onClick={fetchUsers} className="refresh-btn" disabled={usersLoading}>Refresh</button>
            </div>
            {usersLoading ? <div className="loading">Loading...</div> : (
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Student ID</th><th>Created</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>{u.name}</td><td>{u.email}</td><td className={`role-${u.role}`}>{u.role}</td>
                        <td>{u.department || '-'}</td><td>{u.studentId || '-'}</td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button className="delete-btn" onClick={() => handleDeleteUser(u._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= COURSES TAB ================= */}
      {activeTab === 'courses' && (
        <div className="tab-content">
          <div className="admin-forms single-form">
            <div className="form-section">
              <h2>Create New Course</h2>
              <form onSubmit={handleCourseSubmit}>
                <div className="form-group"><label>Course Title: *</label><input type="text" name="name" value={courseForm.name} onChange={handleCourseChange} required /></div>
                <div className="form-group"><label>Course Code: *</label><input type="text" name="code" value={courseForm.code} onChange={handleCourseChange} required /></div>
                <div className="form-group"><label>Department: *</label><input type="text" name="department" value={courseForm.department} onChange={handleCourseChange} required /></div>
                <div className="form-group"><label>Target Year: *</label><input type="number" name="year" value={courseForm.year} onChange={handleCourseChange} required /></div>
                <div className="form-group"><label>Semester: *</label><input type="number" name="semester" value={courseForm.semester} onChange={handleCourseChange} required /></div>
                <div className="form-group"><label>Credits: *</label><input type="number" name="credits" value={courseForm.credits} onChange={handleCourseChange} required /></div>
                <button type="submit" className="submit-btn" disabled={courseLoading}>{courseLoading ? 'Creating...' : 'Create Course'}</button>
              </form>
            </div>
          </div>

          <div className="data-section">
            <div className="section-header">
              <h2>Courses List</h2>
              <button onClick={fetchCourses} className="refresh-btn" disabled={coursesLoading}>Refresh</button>
            </div>
            {coursesLoading ? <div className="loading">Loading...</div> : (
              <div className="data-table">
                <table>
                  <thead>
                    <tr><th>Code</th><th>Title</th><th>Department</th><th>Year/Sem</th><th>Credits</th></tr>
                  </thead>
                  <tbody>
                    {courses.map((c) => (
                      <tr key={c._id}>
                        <td><strong>{c.code}</strong></td><td>{c.name}</td><td>{c.department}</td>
                        <td>Y{c.year} / S{c.semester}</td><td>{c.credits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= ANNOUNCEMENTS TAB ================= */}
      {activeTab === 'announcements' && (
        <div className="tab-content">
          <div className="admin-forms single-form">
            <div className="form-section">
              <h2>Post Announcement</h2>
              <form onSubmit={handleAnnouncementSubmit}>
                <div className="form-group"><label>Title: *</label><input type="text" name="title" value={announcementForm.title} onChange={handleAnnouncementChange} required /></div>
                <div className="form-group">
                  <label>Content: *</label>
                  <textarea name="content" value={announcementForm.content} onChange={handleAnnouncementChange} rows="4" required></textarea>
                </div>
                <div className="form-group">
                  <label>Category:</label>
                  <select name="category" value={announcementForm.category} onChange={handleAnnouncementChange}>
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="event">Event</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority:</label>
                  <select name="priority" value={announcementForm.priority} onChange={handleAnnouncementChange}>
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="form-group"><label>Department (Optional):</label><input type="text" name="department" value={announcementForm.department} onChange={handleAnnouncementChange} /></div>
                <button type="submit" className="submit-btn" disabled={announcementLoading}>{announcementLoading ? 'Posting...' : 'Post Announcement'}</button>
              </form>
            </div>
          </div>

          <div className="data-section">
            <div className="section-header">
              <h2>Announcements List</h2>
              <button onClick={fetchAnnouncements} className="refresh-btn" disabled={announcementsLoading}>Refresh</button>
            </div>
            {announcementsLoading ? <div className="loading">Loading...</div> : (
              <div className="data-table">
                <table>
                  <thead>
                    <tr><th>Title</th><th>Category</th><th>Priority</th><th>Date Posted</th></tr>
                  </thead>
                  <tbody>
                    {announcements.map((a) => (
                      <tr key={a._id}>
                        <td>{a.title}</td>
                        <td><span className={`badge tag-${a.category}`}>{a.category}</span></td>
                        <td><span className={`badge prio-${a.priority}`}>{a.priority}</span></td>
                        <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;