import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { announcementService, scheduleService, assignmentService, courseService } from '../services/api';
import FloatingAI from '../components/FloatingAI';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
        const [annData, schedData, allSchedData, assignData, upcomingData, courseData] = await Promise.all([
          announcementService.getAll({ limit: 10 }),
          scheduleService.getAll({ day: today }),
          scheduleService.getAll({}),
          assignmentService.getAll(),
          assignmentService.getUpcoming(),
          courseService.getAll({})
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
            <span></span>
            <span></span>
            <span></span>
          </button>
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
      </main>
      <FloatingAI />
    </div>
  );
};

export default StudentDashboard;
