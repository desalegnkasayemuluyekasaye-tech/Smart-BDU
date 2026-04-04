import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseService, postService } from '../services/api';

const LecturerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [courses, setCourses] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [uploadModal, setUploadModal] = useState(false);
  const [announcementModal, setAnnouncementModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', course: '', file: null });
  const [announcementForm, setAnnouncementForm] = useState({ 
    title: '', 
    content: '', 
    targetType: 'department',
    targetDepartment: '',
    targetYear: '',
    category: 'announcement'
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarOpen && !e.target.closest('.harvard-nav') && !e.target.closest('.hamburger-btn')) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [sidebarOpen]);

  const fetchData = async () => {
    try {
      const [courseData, postsData] = await Promise.all([
        courseService.getAll(),
        postService.getMyPosts()
      ]);
      setCourses(courseData.courses || courseData || []);
      setMyPosts(postsData.posts || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.course) {
      alert('Please fill required fields');
      return;
    }
    // File upload would use fileService here
    alert('File upload - Use the Post section to create posts with materials');
    setUploadModal(false);
    setUploadForm({ title: '', description: '', course: '', file: null });
  };

  const handleAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementForm.title || !announcementForm.content) {
      alert('Please fill required fields');
      return;
    }
    try {
      const postData = {
        ...announcementForm,
        targetYear: announcementForm.targetYear ? parseInt(announcementForm.targetYear) : undefined
      };
      await postService.create(postData);
      alert('Post published successfully!');
      setAnnouncementModal(false);
      setAnnouncementForm({ title: '', content: '', targetType: 'department', targetDepartment: '', targetYear: '', category: 'announcement' });
      fetchData();
    } catch (error) {
      console.error('Error posting:', error);
      alert('Failed to create post');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'DR';

  const mockCourses = [
    { code: 'CSE 401', name: 'Mobile App Development', students: 45, schedule: 'Sun/Tue 9:00 AM' },
    { code: 'CSE 402', name: 'AI & Machine Learning', students: 38, schedule: 'Mon/Wed 11:00 AM' },
    { code: 'CSE 403', name: 'Database Systems', students: 52, schedule: 'Tue/Thu 2:00 PM' },
    { code: 'CSE 404', name: 'Software Engineering', students: 41, schedule: 'Mon/Wed 2:00 PM' }
  ];

  const mockTasks = [
    { icon: '📝', color: '#d32f2f', text: 'Grade Assignment 3 — Mobile App', due: 'Due Apr 28' },
    { icon: '📋', color: '#f57c00', text: 'Submit Exam Questions — AI Course', due: 'Due Apr 25' },
    { icon: '👥', color: '#1976d2', text: 'Advising Session — 5 Students', due: 'Apr 22' },
    { icon: '📊', color: '#388e3c', text: 'Submit Midterm Results', due: 'Due Apr 30' }
  ];

  const quickLinks = [
    { icon: '📚', label: 'My Courses', path: '/app/courses' },
    { icon: '📤', label: 'Upload Materials', action: () => setUploadModal(true) },
    { icon: '📢', label: 'Post Announcement', action: () => setAnnouncementModal(true) },
    { icon: '👥', label: 'My Students', path: '/app/directory' },
    { icon: '📅', label: 'Schedule', path: '/app/schedule' },
    { icon: '📊', label: 'Analytics', path: '/app' }
  ];

  return (
    <div className="harvard-dashboard lecturer-dashboard">
      {/* TOP NAVIGATION */}
      <header className="harvard-header">
        <div className="harvard-header-left">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="harvard-logo">
            <img src="/logo.png" alt="SmartBDU" className="logo-img" />
          </div>
        </div>
        
        <nav className={`harvard-nav ${sidebarOpen ? 'open' : ''}`}>
          <button className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveSection('dashboard'); setSidebarOpen(false); }}>
            <span className="nav-icon">🏠</span> Dashboard
          </button>
          <button className={`nav-item ${activeSection === 'courses' ? 'active' : ''}`} onClick={() => { setActiveSection('courses'); setSidebarOpen(false); }}>
            <span className="nav-icon">📚</span> Courses
          </button>
          <button className={`nav-item ${activeSection === 'students' ? 'active' : ''}`} onClick={() => { setActiveSection('students'); setSidebarOpen(false); }}>
            <span className="nav-icon">👥</span> Students
          </button>
          <button className={`nav-item ${activeSection === 'materials' ? 'active' : ''}`} onClick={() => { setActiveSection('materials'); setSidebarOpen(false); }}>
            <span className="nav-icon">📁</span> Materials
          </button>
          <button className={`nav-item ${activeSection === 'announcements' ? 'active' : ''}`} onClick={() => { setAnnouncementModal(true); setSidebarOpen(false); }}>
            <span className="nav-icon">📢</span> Announce
          </button>
        </nav>

        <div className="harvard-header-right">
          <div className="harvard-user-info">
            <div className="harvard-user-details">
              <span className="harvard-user-name">Dr. {user?.name?.split(' ').slice(-1)[0] || 'Professor'}</span>
              <span className="harvard-user-id">{user?.department || 'Software Engineering'}</span>
            </div>
            <div className="harvard-avatar professor" onClick={handleLogout}>
              {getInitials(user?.name)}
            </div>
          </div>
        </div>
      </header>

      <main className="harvard-main">
        {/* WELCOME SECTION */}
        <section className="harvard-welcome">
          <div className="welcome-content">
            <h1>{getGreeting()}, Dr. {user?.name?.split(' ').slice(-1)[0] || 'Professor'}!</h1>
            <p>You have 4 classes today. 3 assignments pending review.</p>
          </div>
          <div className="welcome-stats">
            <div className="stat-card">
              <span className="stat-number">{mockCourses.length}</span>
              <span className="stat-label">Active Courses</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">176</span>
              <span className="stat-label">Total Students</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">4</span>
              <span className="stat-label">Pending Tasks</span>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="harvard-quick-actions">
          {quickLinks.map((link, idx) => (
            <button 
              key={idx} 
              className="quick-action-btn"
              onClick={link.action || (() => navigate(link.path))}
            >
              <span className="quick-action-icon">{link.icon}</span>
              <span className="quick-action-label">{link.label}</span>
            </button>
          ))}
        </section>

        {/* MAIN CONTENT GRID */}
        <div className="harvard-grid">
          
          {/* MY COURSES CARD */}
          <div className="harvard-card">
            <div className="card-header">
              <h3><span className="card-icon">📚</span> My Courses</h3>
              <button className="view-all-btn" onClick={() => setActiveSection('courses')}>View All →</button>
            </div>
            <div className="card-body">
              <div className="courses-list">
                {mockCourses.slice(0, 4).map((course, idx) => (
                  <div key={idx} className="course-item">
                    <div className="course-code">{course.code}</div>
                    <div className="course-info">
                      <span className="course-name">{course.name}</span>
                      <span className="course-instructor">{course.schedule}</span>
                    </div>
                    <div className="course-grade">
                      <span className="grade-badge" style={{ background: '#e3f2fd', color: '#1565c0' }}>{course.students}</span>
                      <span className="credits">students</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PENDING TASKS CARD */}
          <div className="harvard-card">
            <div className="card-header">
              <h3><span className="card-icon">📌</span> Pending Tasks</h3>
              <button className="view-all-btn">See More →</button>
            </div>
            <div className="card-body">
              <div className="courses-list">
                {mockTasks.map((task, idx) => (
                  <div key={idx} className="course-item">
                    <span className="course-code" style={{ background: task.color, minWidth: 'auto', padding: '8px 12px' }}>{task.icon}</span>
                    <div className="course-info">
                      <span className="course-name">{task.text}</span>
                      <span className="course-instructor">{task.due}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* UPLOAD MATERIALS CARD */}
          <div className="harvard-card upload-card">
            <div className="card-header">
              <h3><span className="card-icon">📤</span> Upload Teaching Materials</h3>
            </div>
            <div className="card-body">
              <div className="upload-zone" onClick={() => setUploadModal(true)}>
                <span className="upload-icon">📁</span>
                <span className="upload-text">Click to upload course materials</span>
                <span className="upload-hint">PDF, DOC, PPT, ZIP up to 50MB</span>
              </div>
              <div className="recent-uploads">
                <h4>Recent Uploads</h4>
                <div className="upload-item">
                  <span className="upload-file-icon">📄</span>
                  <div className="upload-file-info">
                    <span className="upload-file-name">Lecture 5 - Neural Networks.pdf</span>
                    <span className="upload-file-meta">AI & ML · Uploaded 2 days ago</span>
                  </div>
                </div>
                <div className="upload-item">
                  <span className="upload-file-icon">📄</span>
                  <div className="upload-file-info">
                    <span className="upload-file-name">Assignment 3 - Questions.docx</span>
                    <span className="upload-file-meta">Mobile App Dev · Uploaded 5 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ANNOUNCEMENTS CARD */}
          <div className="harvard-card">
            <div className="card-header">
              <h3><span className="card-icon">📢</span> Recent Announcements</h3>
              <button className="view-all-btn" onClick={() => setAnnouncementModal(true)}>Post New →</button>
            </div>
            <div className="card-body">
              <div className="announcements-list">
                {mockTasks.slice(0, 3).map((task, idx) => (
                  <div key={idx} className="announcement-item">
                    <div className="announcement-content">
                      <span className="announcement-title">New {task.text.split('—')[0]}</span>
                      <span className="announcement-date">{task.due}</span>
                    </div>
                    <span className="announcement-arrow">→</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM INFO */}
        <section className="harvard-footer-info">
          <div className="info-card">
            <span className="info-icon">📅</span>
            <div className="info-content">
              <h4>Today's Classes</h4>
              <p>4 Classes · 6 Hours Total Teaching Time</p>
            </div>
          </div>
          <div className="info-card">
            <span className="info-icon">📊</span>
            <div className="info-content">
              <h4>Department</h4>
              <p>{user?.department || 'Computer Science & Engineering'}</p>
            </div>
          </div>
          <div className="info-card">
            <span className="info-icon">📧</span>
            <div className="info-content">
              <h4>Contact</h4>
              <p>{user?.email || 'faculty@bdu.edu.et'}</p>
            </div>
          </div>
        </section>
      </main>

      {/* Upload Modal */}
      {uploadModal && (
        <div className="modal-overlay" onClick={() => setUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Teaching Materials</h3>
              <button className="modal-close" onClick={() => setUploadModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label>Material Title</label>
                <input type="text" className="form-control" value={uploadForm.title} onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})} placeholder="Enter material title" required />
              </div>
              <div className="form-group">
                <label>Select Course</label>
                <select className="form-control" value={uploadForm.course} onChange={(e) => setUploadForm({...uploadForm, course: e.target.value})} required>
                  <option value="">Select a course</option>
                  {mockCourses.map((c, idx) => (<option key={idx} value={c.code}>{c.code} - {c.name}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" value={uploadForm.description} onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})} rows="3" placeholder="Brief description of the material"></textarea>
              </div>
              <div className="form-group">
                <label>File</label>
                <input type="file" className="form-control" onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Upload Material</button>
            </form>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {announcementModal && (
        <div className="modal-overlay" onClick={() => setAnnouncementModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Post Announcement</h3>
              <button className="modal-close" onClick={() => setAnnouncementModal(false)}>×</button>
            </div>
            <form onSubmit={handleAnnouncement}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" className="form-control" value={announcementForm.title} onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})} placeholder="Announcement title" required />
              </div>
              <div className="form-group">
                <label>Target Department</label>
                <select className="form-control" value={announcementForm.department} onChange={(e) => setAnnouncementForm({...announcementForm, department: e.target.value})}>
                  <option value="">All Departments</option>
                  <option value="CSE">Computer Science & Engineering</option>
                  <option value="EE">Electrical Engineering</option>
                  <option value="ME">Mechanical Engineering</option>
                </select>
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea className="form-control" value={announcementForm.content} onChange={(e) => setAnnouncementForm({...announcementForm, content: e.target.value})} rows="5" placeholder="Write your announcement..." required></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Post Announcement</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerDashboard;