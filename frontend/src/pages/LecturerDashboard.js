import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseService, postService } from '../services/api';
=======
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { scheduleService, assignmentService, announcementService, courseService } from '../services/api';
import FloatingAI from '../components/FloatingAI';
import './LecturerDashboard.css';
>>>>>>> a74f83fcc58b2b161ca991477191bc1bd28f91a2

const LecturerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
<<<<<<< HEAD
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
=======
  const [activeTab, setActiveTab] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [myCourses, setMyCourses] = useState([]);
  const [mySchedule, setMySchedule] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [materialForm, setMaterialForm] = useState({ title: '', url: '', type: 'link' });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', category: 'academic', priority: 'normal', department: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schedData, courseData, assignData, annData] = await Promise.all([
          scheduleService.getAll({}),
          courseService.getAll({}),
          assignmentService.getAll(),
          announcementService.getAll({ limit: 10 })
        ]);
        
        const lecturerCourses = (courseData || []).filter(c => 
          c.instructor && user?.name && c.instructor.toLowerCase().includes(user.name.split(' ').pop()?.toLowerCase() || '')
        );
        setMyCourses(lecturerCourses.length > 0 ? lecturerCourses : courseData?.slice(0, 3) || []);
        setMySchedule(schedData || []);
        setAssignments(assignData || []);
        setAnnouncements(annData.announcements || annData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };
    if (user) fetchData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDaysUntil = (dueDate) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return 'Overdue';
    if (diff === 1) return 'Tomorrow';
    return `${diff} days`;
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !materialForm.title || !materialForm.url) return;
    
    setSubmitting(true);
    try {
      await courseService.addMaterial(selectedCourse._id, materialForm);
      setMessage('Material added successfully!');
      setMaterialForm({ title: '', url: '', type: 'link' });
      const courseData = await courseService.getAll({});
      const lecturerCourses = (courseData || []).filter(c => 
        c.instructor && user?.name && c.instructor.toLowerCase().includes(user.name.split(' ').pop()?.toLowerCase() || '')
      );
      setMyCourses(lecturerCourses.length > 0 ? lecturerCourses : courseData?.slice(0, 3) || []);
    } catch (error) {
      setMessage('Failed to add material. Please try again.');
    }
    setSubmitting(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementForm.title || !announcementForm.content) return;
    
    setSubmitting(true);
    try {
      await announcementService.createAnnouncement({
        ...announcementForm,
        department: announcementForm.department || user?.department
      });
      setMessage('Announcement posted successfully!');
      setAnnouncementForm({ title: '', content: '', category: 'academic', priority: 'normal', department: '' });
      const annData = await announcementService.getAll({ limit: 10 });
      setAnnouncements(annData.announcements || annData || []);
    } catch (error) {
      setMessage('Failed to post announcement. Please try again.');
    }
    setSubmitting(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const renderDashboard = () => (
    <>
      <div className="welcome-banner lecturer-banner">
        <div className="welcome-content">
          <h1>Welcome back, Dr. {user?.name?.split(' ').slice(-1)[0]}! 👨‍🏫</h1>
          <p>{user?.department || 'Computer Science'} • Lecturer</p>
        </div>
        <div className="welcome-illustration">📚</div>
      </div>

      <div className="quick-stats">
        <div className="stat-card" onClick={() => setActiveTab('courses')}>
          <div className="stat-icon">📖</div>
          <div>
            <div className="stat-value">{myCourses.length}</div>
            <div className="stat-label">My Courses</div>
          </div>
        </div>
        <div className="stat-card accent" onClick={() => setActiveTab('schedule')}>
          <div className="stat-icon">📅</div>
          <div>
            <div className="stat-value">{mySchedule.filter(s => s.day === today).length}</div>
            <div className="stat-label">Classes Today</div>
          </div>
        </div>
        <div className="stat-card success" onClick={() => setActiveTab('assignments')}>
          <div className="stat-icon">📝</div>
          <div>
            <div className="stat-value">{assignments.filter(a => a.status === 'pending').length}</div>
            <div className="stat-label">Pending Grading</div>
          </div>
        </div>
        <div className="stat-card info" onClick={() => setActiveTab('announcements')}>
          <div className="stat-icon">📢</div>
          <div>
            <div className="stat-value">{announcements.length}</div>
            <div className="stat-label">Notices</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="main-content">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📅 Today's Schedule</h3>
              <button className="view-all-btn" onClick={() => setActiveTab('schedule')}>View All →</button>
            </div>
            {mySchedule.filter(s => s.day === today).length > 0 ? (
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Course</th>
                    <th>Room</th>
                    <th>Building</th>
                  </tr>
                </thead>
                <tbody>
                  {mySchedule.filter(s => s.day === today).slice(0, 4).map((sched, idx) => (
                    <tr key={idx}>
                      <td><span className="time-badge">{sched.startTime} - {sched.endTime}</span></td>
                      <td>
                        <div className="course-name">{sched.courseName}</div>
                        <div className="course-code">{sched.courseCode}</div>
                      </td>
                      <td>{sched.room || 'TBA'}</td>
                      <td>{sched.building || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">No classes scheduled for today</div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📝 Assignments to Grade</h3>
              <button className="view-all-btn" onClick={() => setActiveTab('assignments')}>View All →</button>
            </div>
            {assignments.filter(a => a.status === 'pending').length > 0 ? (
              <div className="assignments-list">
                {assignments.filter(a => a.status === 'pending').slice(0, 4).map((assign, idx) => (
                  <div key={idx} className="assignment-card pending">
                    <div className="assignment-info">
                      <div className="assignment-title">{assign.title}</div>
                      <div className="assignment-course">{assign.courseName} ({assign.courseCode})</div>
                    </div>
                    <div className="assignment-due">
                      <div className="due-badge pending">
                        {getDaysUntil(assign.dueDate)} left
                      </div>
                      <div className="due-date">Due: {formatDate(assign.dueDate)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No pending assignments to grade</div>
            )}
>>>>>>> a74f83fcc58b2b161ca991477191bc1bd28f91a2
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

<<<<<<< HEAD
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
=======
        <div className="sidebar">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">⚡ Quick Actions</h3>
            </div>
            <div className="quick-links-grid">
              <div className="quick-link-item" onClick={() => setActiveTab('courses')}>
                <span className="ql-icon">📚</span>
                <span>My Courses</span>
              </div>
              <div className="quick-link-item" onClick={() => setActiveTab('schedule')}>
                <span className="ql-icon">📅</span>
                <span>Schedule</span>
              </div>
              <div className="quick-link-item" onClick={() => setActiveTab('postMaterial')}>
                <span className="ql-icon">📎</span>
                <span>Add Material</span>
              </div>
              <div className="quick-link-item" onClick={() => setActiveTab('announcements')}>
                <span className="ql-icon">📢</span>
                <span>Post Notice</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderCourses = () => (
    <div className="page-content">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📚 My Courses - Click to Add Materials</h3>
        </div>
        {myCourses.length > 0 ? (
          <div className="courses-grid">
            {myCourses.map((course, idx) => (
              <div key={idx} className="course-card clickable" onClick={() => { setSelectedCourse(course); setActiveTab('postMaterial'); }}>
                <div className="course-code-badge">{course.code}</div>
                <div className="course-name">{course.name}</div>
                <div className="course-meta">
                  <span>Year {course.year}</span> • <span>Sem {course.semester}</span> • <span>{course.credits} Credits</span>
                </div>
                <div className="course-instructor">👨‍🏫 {course.instructor}</div>
                <div className="course-materials">
                  📚 {course.materials?.length || 0} materials
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No courses assigned</div>
        )}
      </div>
    </div>
  );

  const renderPostMaterial = () => (
    <div className="page-content">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📎 Add Course Material</h3>
        </div>
        
        {selectedCourse ? (
          <div>
            <div className="selected-course-info">
              <span className="course-code-badge">{selectedCourse.code}</span>
              <span>{selectedCourse.name}</span>
              <button className="change-course-btn" onClick={() => setSelectedCourse(null)}>Change</button>
            </div>
            
            {message && <div className="success-message">{message}</div>}
            
            <form onSubmit={handleAddMaterial} className="material-form">
              <div className="form-group">
                <label>Material Title *</label>
                <input 
                  type="text" 
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({...materialForm, title: e.target.value})}
                  placeholder="e.g., Lecture 1 - Introduction"
                  required
                />
              </div>
              <div className="form-group">
                <label>URL *</label>
                <input 
                  type="url" 
                  value={materialForm.url}
                  onChange={(e) => setMaterialForm({...materialForm, url: e.target.value})}
                  placeholder="https://..."
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={materialForm.type} onChange={(e) => setMaterialForm({...materialForm, type: e.target.value})}>
                  <option value="link">Link</option>
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Material'}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <p>Select a course to add materials:</p>
            <div className="courses-grid">
              {myCourses.map((course, idx) => (
                <div key={idx} className="course-card clickable" onClick={() => setSelectedCourse(course)}>
                  <div className="course-code-badge">{course.code}</div>
                  <div className="course-name">{course.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="page-content">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📢 Post Announcement for Your Department</h3>
        </div>
        
        {message && <div className="success-message">{message}</div>}
        
        <form onSubmit={handleCreateAnnouncement} className="announcement-form">
          <div className="form-group">
            <label>Title *</label>
            <input 
              type="text" 
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
              placeholder="Announcement title"
              required
            />
          </div>
          <div className="form-group">
            <label>Content *</label>
            <textarea 
              value={announcementForm.content}
              onChange={(e) => setAnnouncementForm({...announcementForm, content: e.target.value})}
              placeholder="Write your announcement..."
              rows="4"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select value={announcementForm.category} onChange={(e) => setAnnouncementForm({...announcementForm, category: e.target.value})}>
                <option value="general">General</option>
                <option value="academic">Academic</option>
                <option value="event">Event</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={announcementForm.priority} onChange={(e) => setAnnouncementForm({...announcementForm, priority: e.target.value})}>
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Department (auto-filled from your profile)</label>
            <input 
              type="text" 
              value={announcementForm.department || user?.department || ''}
              onChange={(e) => setAnnouncementForm({...announcementForm, department: e.target.value})}
              placeholder={user?.department}
            />
          </div>
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post Announcement'}
          </button>
        </form>

        <h4 style={{marginTop: '30px', marginBottom: '15px'}}>Previous Announcements</h4>
        {announcements.length > 0 ? (
          <div>
            {announcements.map((ann, idx) => (
              <div key={idx} className={`announcement-full ${ann.priority}`}>
                <div className="announcement-full-header">
                  <h4>{ann.title}</h4>
                  <span className="tag">{ann.category}</span>
                </div>
                <p className="announcement-full-content">{ann.content}</p>
                <div className="announcement-full-date">{formatDate(ann.createdAt)} • {ann.department}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No announcements yet</div>
        )}
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="page-content">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📅 Weekly Schedule</h3>
        </div>
        <div className="tab-container">
          {days.slice(1, 6).map(day => (
            <button key={day} className={`tab ${today === day ? 'active' : ''}`}>
              {day.charAt(0).toUpperCase() + day.slice(1)}
>>>>>>> a74f83fcc58b2b161ca991477191bc1bd28f91a2
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
<<<<<<< HEAD

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
=======
        {mySchedule.filter(s => s.day === today).length > 0 ? (
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Course</th>
                <th>Code</th>
                <th>Room</th>
                <th>Building</th>
              </tr>
            </thead>
            <tbody>
              {mySchedule.filter(s => s.day === today).map((sched, idx) => (
                <tr key={idx}>
                  <td><span className="time-badge">{sched.startTime} - {sched.endTime}</span></td>
                  <td>{sched.courseName}</td>
                  <td>{sched.courseCode || '-'}</td>
                  <td>{sched.room || 'TBA'}</td>
                  <td>{sched.building || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">No classes scheduled for today</div>
        )}
      </div>
>>>>>>> a74f83fcc58b2b161ca991477191bc1bd28f91a2
    </div>
  );

  const renderAssignments = () => (
    <div className="page-content">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📝 All Assignments</h3>
        </div>
        {assignments.length > 0 ? (
          <div className="assignments-list">
            {assignments.map((assign, idx) => (
              <div key={idx} className={`assignment-card ${assign.status}`}>
                <div className="assignment-info">
                  <div className="assignment-title">{assign.title}</div>
                  <div className="assignment-course">{assign.courseName} ({assign.courseCode})</div>
                </div>
                <div className="assignment-due">
                  <div className={`status-badge ${assign.status}`}>{assign.status}</div>
                  <div className="due-date">Due: {formatDate(assign.dueDate)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No assignments</div>
        )}
      </div>
    </div>
  );

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="student-layout">
      <aside className={`student-sidebar lecturer-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">📚 <span>SmartBDU</span></div>
        </div>
        <ul className="sidebar-menu">
          <li className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setMenuOpen(false); }}>
            <span className="menu-icon">🏠</span><span>Dashboard</span>
          </li>
          <li className={`menu-item ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => { setActiveTab('courses'); setMenuOpen(false); }}>
            <span className="menu-icon">📚</span><span>My Courses</span>
          </li>
          <li className={`menu-item ${activeTab === 'postMaterial' ? 'active' : ''}`} onClick={() => { setActiveTab('postMaterial'); setMenuOpen(false); }}>
            <span className="menu-icon">📎</span><span>Add Materials</span>
          </li>
          <li className={`menu-item ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => { setActiveTab('schedule'); setMenuOpen(false); }}>
            <span className="menu-icon">📅</span><span>Schedule</span>
          </li>
          <li className={`menu-item ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => { setActiveTab('assignments'); setMenuOpen(false); }}>
            <span className="menu-icon">📝</span><span>Assignments</span>
          </li>
          <li className={`menu-item ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => { setActiveTab('announcements'); setMenuOpen(false); }}>
            <span className="menu-icon">📢</span><span>Announcements</span>
          </li>
        </ul>
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar lecturer-avatar">{user?.name?.charAt(0)}</div>
            <div className="user-info">
              <div className="user-name">Dr. {user?.name}</div>
              <div className="user-role">{user?.department}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>

      {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)}></div>}

      <main className="student-main">
        <header className="student-header">
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </button>
          <h1>{activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'postMaterial' ? 'Add Materials' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="header-user">
            <span className="header-avatar">{user?.name?.charAt(0)}</span>
          </div>
        </header>

        <div className="student-content">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'courses' && renderCourses()}
          {activeTab === 'postMaterial' && renderPostMaterial()}
          {activeTab === 'schedule' && renderSchedule()}
          {activeTab === 'assignments' && renderAssignments()}
          {activeTab === 'announcements' && renderAnnouncements()}
        </div>
      </main>
    </div>
  );
};

export default LecturerDashboard;