import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { scheduleService, courseService, announcementService, aiService } from '../services/api';
=======
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { announcementService, scheduleService, assignmentService, courseService } from '../services/api';
import FloatingAI from '../components/FloatingAI';
import './StudentDashboard.css';
>>>>>>> a74f83fcc58b2b161ca991477191bc1bd28f91a2

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
<<<<<<< HEAD
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
=======
  const [activeTab, setActiveTab] = useState('dashboard');
  const [announcements, setAnnouncements] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [allSchedule, setAllSchedule] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  const [selectedDay, setSelectedDay] = useState(today);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysUntil = (dueDate) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return 'Overdue';
    if (diff === 1) return 'Tomorrow';
    return `${diff} days left`;
  };

  const getUrgencyClass = (dueDate) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    if (diff <= 1) return 'urgent';
    if (diff <= 3) return 'warning';
    return 'normal';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDepartment = user?.department || '';
        const [annData, schedData, allSchedData, assignData, upcomingData, courseData] = await Promise.all([
          announcementService.getAll({ department: userDepartment, limit: 10 }),
          scheduleService.getAll({ day: today, department: user?.department }),
          scheduleService.getAll({ department: user?.department }),
          assignmentService.getAll(),
          assignmentService.getUpcoming(),
          courseService.getAll({ department: userDepartment })
        ]);
        setAnnouncements(annData.announcements || annData || []);
        setTodaySchedule(schedData || []);
        setAllSchedule(allSchedData || []);
        setAllAssignments(assignData || []);
        setUpcomingAssignments(upcomingData || []);
        setMyCourses(courseData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
      setLoading(false);
    };
    if (user) fetchData();
  }, [today, user]);

  const renderDashboard = () => (
    <>
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>{user?.department} • Year {user?.year}</p>
        </div>
        <div className="welcome-illustration">🎓</div>
      </div>

      <div className="quick-stats">
        <div className="stat-card" onClick={() => setActiveTab('schedule')}>
          <div className="stat-icon">📅</div>
          <div>
            <div className="stat-value">{todaySchedule.length}</div>
            <div className="stat-label">Classes Today</div>
          </div>
        </div>
        <div className="stat-card accent" onClick={() => setActiveTab('assignments')}>
          <div className="stat-icon">📝</div>
          <div>
            <div className="stat-value">{upcomingAssignments.length}</div>
            <div className="stat-label">Pending Tasks</div>
          </div>
        </div>
        <div className="stat-card success" onClick={() => setActiveTab('courses')}>
          <div className="stat-icon">📚</div>
          <div>
            <div className="stat-value">{myCourses.length}</div>
            <div className="stat-label">My Courses</div>
          </div>
        </div>
        <div className="stat-card info" onClick={() => setActiveTab('announcements')}>
          <div className="stat-icon">📢</div>
          <div>
            <div className="stat-value">{announcements.length}</div>
            <div className="stat-label">Announcements</div>
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
            {todaySchedule.length > 0 ? (
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
                  {todaySchedule.map((sched, idx) => (
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
              <h3 className="card-title">📝 Upcoming Assignments</h3>
              <button className="view-all-btn" onClick={() => setActiveTab('assignments')}>View All →</button>
            </div>
            {upcomingAssignments.length > 0 ? (
              <div className="assignments-list">
                {upcomingAssignments.map((assign, idx) => (
                  <div key={idx} className={`assignment-card ${getUrgencyClass(assign.dueDate)}`}>
                    <div className="assignment-info">
                      <div className="assignment-title">{assign.title}</div>
                      <div className="assignment-course">{assign.courseName} ({assign.courseCode})</div>
                    </div>
                    <div className="assignment-due">
                      <div className={`due-badge ${getUrgencyClass(assign.dueDate)}`}>
                        {getDaysUntil(assign.dueDate)}
                      </div>
                      <div className="due-date">Due: {formatDate(assign.dueDate)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No upcoming assignments</div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📚 My Courses</h3>
              <button className="view-all-btn" onClick={() => setActiveTab('courses')}>View All →</button>
            </div>
            {myCourses.length > 0 ? (
              <div className="courses-grid">
                {myCourses.slice(0, 4).map((course, idx) => (
                  <div key={idx} className="course-card" onClick={() => { setSelectedCourse(course); setActiveTab('courseDetail'); }}>
                    <div className="course-code-badge">{course.code}</div>
                    <div className="course-name">{course.name}</div>
                    <div className="course-meta">
                      <span>Year {course.year}</span> • <span>Sem {course.semester}</span>
                    </div>
                    <div className="course-instructor">👨‍🏫 {course.instructor}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No courses assigned</div>
            )}
          </div>
        </div>

        <div className="sidebar">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📢 Recent Announcements</h3>
            </div>
            {announcements.length > 0 ? (
              <div className="announcements-list">
                {announcements.slice(0, 5).map((ann, idx) => (
                  <div key={idx} className={`announcement-item ${ann.priority}`}>
                    <div className="announcement-title">{ann.title}</div>
                    <div className="announcement-meta">
                      <span className="tag">{ann.category}</span>
                      <span>{formatDate(ann.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No announcements</div>
            )}
            <button className="view-all-announcement" onClick={() => setActiveTab('announcements')}>View All Announcements →</button>
          </div>

          <div className="card quick-access">
            <h3 className="card-title">⚡ Quick Access</h3>
            <div className="quick-links-grid">
              <div className="quick-link-item" onClick={() => setActiveTab('courses')}>
                <span className="ql-icon">📖</span>
                <span>My Courses</span>
              </div>
              <div className="quick-link-item" onClick={() => setActiveTab('schedule')}>
                <span className="ql-icon">📅</span>
                <span>Schedule</span>
              </div>
              <div className="quick-link-item" onClick={() => setActiveTab('assignments')}>
                <span className="ql-icon">📝</span>
                <span>Assignments</span>
              </div>
              <div className="quick-link-item" onClick={() => setActiveTab('announcements')}>
                <span className="ql-icon">📢</span>
                <span>Notices</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderSchedule = () => {
    const daySchedules = allSchedule.filter(s => s.day === selectedDay);
    
    return (
      <div className="page-content">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📅 Weekly Class Schedule</h3>
          </div>
          <div className="tab-container">
            {days.slice(1, 6).map(day => (
              <button
                key={day}
                className={`tab ${selectedDay === day ? 'active' : ''}`}
                onClick={() => setSelectedDay(day)}
              >
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </button>
            ))}
          </div>
          {daySchedules.length > 0 ? (
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
                {daySchedules.map((sched, idx) => (
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
            <div className="empty-state">No classes scheduled for {selectedDay}</div>
          )}
        </div>
      </div>
    );
  };

  const renderAssignments = () => (
    <div className="page-content">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📝 All Assignments</h3>
        </div>
        {allAssignments.length > 0 ? (
          <div className="assignments-list">
            {allAssignments.map((assign, idx) => (
              <div key={idx} className={`assignment-card ${getUrgencyClass(assign.dueDate)}`}>
                <div className="assignment-info">
                  <div className="assignment-title">{assign.title}</div>
                  <div className="assignment-course">{assign.courseName} ({assign.courseCode})</div>
                  <div className="assignment-desc">{assign.description}</div>
                </div>
                <div className="assignment-due">
                  <div className={`due-badge ${getUrgencyClass(assign.dueDate)}`}>
                    {getDaysUntil(assign.dueDate)}
                  </div>
                  <div className="due-date">Due: {formatDate(assign.dueDate)}</div>
                  <div className="assignment-status">{assign.status}</div>
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

  const renderCourses = () => (
    <div className="page-content">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📚 All Courses</h3>
        </div>
        {myCourses.length > 0 ? (
          <div className="courses-grid">
            {myCourses.map((course, idx) => (
              <div key={idx} className="course-card" onClick={() => { setSelectedCourse(course); setActiveTab('courseDetail'); }}>
                <div className="course-code-badge">{course.code}</div>
                <div className="course-name">{course.name}</div>
                <div className="course-meta">
                  <span>Year {course.year}</span> • <span>Sem {course.semester}</span> • <span>{course.credits} Credits</span>
                </div>
                <div className="course-instructor">👨‍🏫 {course.instructor}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No courses enrolled</div>
        )}
      </div>
    </div>
  );

  const renderCourseDetail = () => (
    <div className="page-content">
      <div className="card">
        <div className="card-header">
          <button className="back-btn" onClick={() => setActiveTab('courses')}>← Back to Courses</button>
        </div>
        {selectedCourse && (
          <div className="course-detail">
            <div className="detail-header">
              <span className="detail-code-badge">{selectedCourse.code}</span>
              <h3>{selectedCourse.name}</h3>
            </div>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Instructor</span>
                <span className="detail-value">{selectedCourse.instructor}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Department</span>
                <span className="detail-value">{selectedCourse.department}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Year/Semester</span>
                <span className="detail-value">Year {selectedCourse.year} / Semester {selectedCourse.semester}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Credits</span>
                <span className="detail-value">{selectedCourse.credits}</span>
              </div>
            </div>
            
            <h4 className="section-title">📝 Course Assignments</h4>
            {allAssignments.filter(a => a.courseCode === selectedCourse.code).length > 0 ? (
              <div className="assignments-list">
                {allAssignments.filter(a => a.courseCode === selectedCourse.code).map((assign, idx) => (
                  <div key={idx} className={`assignment-card ${getUrgencyClass(assign.dueDate)}`}>
                    <div className="assignment-info">
                      <div className="assignment-title">{assign.title}</div>
                      <div className="assignment-desc">{assign.description}</div>
                    </div>
                    <div className="assignment-due">
                      <div className={`due-badge ${getUrgencyClass(assign.dueDate)}`}>
                        {getDaysUntil(assign.dueDate)}
                      </div>
                      <div className="due-date">Due: {formatDate(assign.dueDate)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No assignments for this course</div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="page-content">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📢 All Announcements</h3>
        </div>
        {announcements.length > 0 ? (
          <div>
            {announcements.map((ann, idx) => (
              <div key={idx} className={`announcement-full ${ann.priority}`}>
                <div className="announcement-full-header">
                  <h4>{ann.title}</h4>
                  <div className="announcement-badges">
                    <span className="tag">{ann.category}</span>
                    <span className={`priority-badge ${ann.priority}`}>{ann.priority}</span>
                  </div>
                </div>
                <p className="announcement-full-content">{ann.content}</p>
                <div className="announcement-full-date">Posted on {formatDate(ann.createdAt)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No announcements</div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="student-layout">
      <aside className={`student-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">🎓 <span>SmartBDU</span></div>
        </div>
        <ul className="sidebar-menu">
          <li className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setMenuOpen(false); }}>
            <span className="menu-icon">🏠</span>
            <span>Dashboard</span>
          </li>
          <li className={`menu-item ${activeTab === 'courses' || activeTab === 'courseDetail' ? 'active' : ''}`} onClick={() => { setActiveTab('courses'); setMenuOpen(false); }}>
            <span className="menu-icon">📚</span>
            <span>My Courses</span>
          </li>
          <li className={`menu-item ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => { setActiveTab('schedule'); setMenuOpen(false); }}>
            <span className="menu-icon">📅</span>
            <span>Schedule</span>
          </li>
          <li className={`menu-item ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => { setActiveTab('assignments'); setMenuOpen(false); }}>
            <span className="menu-icon">📝</span>
            <span>Assignments</span>
          </li>
          <li className={`menu-item ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => { setActiveTab('announcements'); setMenuOpen(false); }}>
            <span className="menu-icon">📢</span>
            <span>Announcements</span>
          </li>
        </ul>
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{user?.name?.charAt(0)}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.department} - Year {user?.year}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>

      {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)}></div>}

      <main className="student-main">
        <header className="student-header">
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
>>>>>>> a74f83fcc58b2b161ca991477191bc1bd28f91a2
            <span></span>
            <span></span>
            <span></span>
          </button>
<<<<<<< HEAD
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
=======
          <h1>{activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'courseDetail' ? selectedCourse?.name : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="header-user">
            <span className="header-avatar">{user?.name?.charAt(0)}</span>
          </div>
        </header>

        <div className="student-content">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'schedule' && renderSchedule()}
          {activeTab === 'assignments' && renderAssignments()}
          {activeTab === 'courses' && renderCourses()}
          {activeTab === 'courseDetail' && renderCourseDetail()}
          {activeTab === 'announcements' && renderAnnouncements()}
        </div>
>>>>>>> a74f83fcc58b2b161ca991477191bc1bd28f91a2
      </main>
    </div>
  );
};

<<<<<<< HEAD
export default StudentDashboard;
=======
export default StudentDashboard;
>>>>>>> a74f83fcc58b2b161ca991477191bc1bd28f91a2
