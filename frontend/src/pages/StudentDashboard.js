import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { scheduleService, courseService, announcementService, aiService } from '../services/api';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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
      const [scheduleData, courseData, announcementData] = await Promise.all([
        scheduleService.getAll(),
        courseService.getAll(),
        announcementService.getAll()
      ]);
      setSchedules(scheduleData.schedules || scheduleData || []);
      setCourses(courseData.courses || courseData || []);
      setAnnouncements(announcementData.announcements || announcementData || []);
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'ST';

  const mockCourses = [
    { code: 'CSE 301', name: 'Data Structures', credits: 4, grade: 'A', instructor: 'Dr. Alem' },
    { code: 'CSE 302', name: 'Algorithms', credits: 4, grade: 'A-', instructor: 'Dr. Mulu' },
    { code: 'CSE 303', name: 'Database Systems', credits: 3, grade: 'B+', instructor: 'Dr. Sintayehu' },
    { code: 'MATH 201', name: 'Linear Algebra', credits: 3, grade: 'B', instructor: 'Prof. Tadesse' },
    { code: 'ENG 101', name: 'Technical Writing', credits: 2, grade: 'A', instructor: 'Dr. Tigist' }
  ];

  const mockSchedule = [
    { time: '08:00 - 09:30', course: 'Data Structures', room: 'Room 201', days: ['Sun', 'Tue'] },
    { time: '10:00 - 11:30', course: 'Algorithms', room: 'Lab 3', days: ['Mon', 'Wed'] },
    { time: '14:00 - 15:30', course: 'Database Systems', room: 'Room 105', days: ['Tue', 'Thu'] }
  ];

  const mockAnnouncements = [
    { title: 'Midterm Exam Schedule', date: 'Apr 5, 2026', type: 'academic' },
    { title: 'Library Hours Extended', date: 'Apr 3, 2026', type: 'general' },
    { title: 'Research Symposium 2026', date: 'Apr 1, 2026', type: 'event' }
  ];

  const quickLinks = [
    { icon: '📚', label: 'My Courses', path: '/app/courses' },
    { icon: '📅', label: 'Schedule', path: '/app/schedule' },
    { icon: '📢', label: 'Announcements', path: '/app/announcements' },
    { icon: '🤖', label: 'AI Assistant', path: '/app/ai-assistant' },
    { icon: '👥', label: 'Directory', path: '/app/directory' },
    { icon: '️', label: 'Services', path: '/app/services' }
  ];

  return (
    <div className="harvard-dashboard">
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
          <button className={`nav-item ${activeSection === 'schedule' ? 'active' : ''}`} onClick={() => { setActiveSection('schedule'); setSidebarOpen(false); }}>
            <span className="nav-icon">📅</span> Schedule
          </button>
          <button className={`nav-item ${activeSection === 'announcements' ? 'active' : ''}`} onClick={() => { setActiveSection('announcements'); setSidebarOpen(false); }}>
            <span className="nav-icon">📢</span> Announcements
          </button>
          <button className={`nav-item ${activeSection === 'ai' ? 'active' : ''}`} onClick={() => { navigate('/app/ai-assistant'); setSidebarOpen(false); }}>
            <span className="nav-icon">🤖</span> AI Assistant
          </button>
        </nav>

        <div className="harvard-header-right">
          <div className="harvard-user-info">
            <div className="harvard-user-details">
              <span className="harvard-user-name">{user?.name || 'Student'}</span>
              <span className="harvard-user-id">{user?.studentId || 'BDU123456'}</span>
            </div>
            <div className="harvard-avatar" onClick={handleLogout}>
              {getInitials(user?.name)}
            </div>
          </div>
        </div>
      </header>

      <main className="harvard-main">
        {/* WELCOME SECTION */}
        <section className="harvard-welcome">
          <div className="welcome-content">
            <h1>{getGreeting()}, {user?.name?.split(' ')[0] || 'Student'}!</h1>
            <p>Welcome to your personalized student portal. Here's what's happening today.</p>
          </div>
          <div className="welcome-stats">
            <div className="stat-card">
              <span className="stat-number">{mockCourses.length}</span>
              <span className="stat-label">Active Courses</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">18</span>
              <span className="stat-label">Credits This Semester</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">3.8</span>
              <span className="stat-label">GPA</span>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="harvard-quick-actions">
          {quickLinks.map((link, idx) => (
            <button key={idx} className="quick-action-btn" onClick={() => navigate(link.path)}>
              <span className="quick-action-icon">{link.icon}</span>
              <span className="quick-action-label">{link.label}</span>
            </button>
          ))}
        </section>

        {/* MAIN CONTENT GRID */}
        <div className="harvard-grid">
          
          {/* COURSES CARD */}
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
                      <span className="course-instructor">{course.instructor}</span>
                    </div>
                    <div className="course-grade">
                      <span className="grade-badge">{course.grade}</span>
                      <span className="credits">{course.credits} cr</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SCHEDULE CARD */}
          <div className="harvard-card">
            <div className="card-header">
              <h3><span className="card-icon">📅</span> Today's Schedule</h3>
              <button className="view-all-btn" onClick={() => setActiveSection('schedule')}>Full Schedule →</button>
            </div>
            <div className="card-body">
              <div className="schedule-timeline">
                {mockSchedule.map((item, idx) => (
                  <div key={idx} className="schedule-item">
                    <div className="schedule-time">{item.time}</div>
                    <div className="schedule-bar">
                      <span className="schedule-course">{item.course}</span>
                      <span className="schedule-room">📍 {item.room}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ANNOUNCEMENTS CARD */}
          <div className="harvard-card">
            <div className="card-header">
              <h3><span className="card-icon">📢</span> Latest Announcements</h3>
              <button className="view-all-btn" onClick={() => setActiveSection('announcements')}>View All →</button>
            </div>
            <div className="card-body">
              <div className="announcements-list">
                {mockAnnouncements.map((ann, idx) => (
                  <div key={idx} className={`announcement-item ${ann.type}`}>
                    <div className="announcement-content">
                      <span className="announcement-title">{ann.title}</span>
                      <span className="announcement-date">{ann.date}</span>
                    </div>
                    <span className="announcement-arrow">→</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI ASSISTANT CARD */}
          <div className="harvard-card ai-card">
            <div className="card-header">
              <h3><span className="card-icon">🤖</span> SmartBDU AI</h3>
            </div>
            <div className="card-body">
              <p className="ai-description">Your personal AI academic assistant. Get help with courses, generate learning roadmaps, and more!</p>
              <div className="ai-features">
                <button className="ai-feature-btn" onClick={() => navigate('/app/ai-assistant')}>
                  <span>💬</span> Chat with AI
                </button>
                <button className="ai-feature-btn" onClick={() => navigate('/app/ai-assistant')}>
                  <span>🗺️</span> Learning Roadmap
                </button>
                <button className="ai-feature-btn" onClick={() => navigate('/app/ai-assistant')}>
                  <span>📄</span> Generate CV
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM INFO */}
        <section className="harvard-footer-info">
          <div className="info-card">
            <span className="info-icon">🎯</span>
            <div className="info-content">
              <h4>Academic Progress</h4>
              <p>3.8 GPA • 72 Credits Completed • 18 More to Graduate</p>
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
              <h4>Email</h4>
              <p>{user?.email || 'student@bdu.edu.et'}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;