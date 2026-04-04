import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { scheduleService, assignmentService, announcementService, courseService } from '../services/api';
import FloatingAI from '../components/FloatingAI';
import './LecturerDashboard.css';

const LecturerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
          </div>
        </div>

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
            </button>
          ))}
        </div>
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
