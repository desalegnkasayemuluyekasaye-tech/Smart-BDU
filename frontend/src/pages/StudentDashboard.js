import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { announcementService, scheduleService, assignmentService, courseService, fileService } from '../services/api';
import FloatingAI from '../components/FloatingAI';
import './Admin.css';
import './StudentDashboard.css';

const SIDEBAR_NAV = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
  { id: 'courses', icon: '📚', label: 'My Courses' },
  { id: 'schedule', icon: '📅', label: 'Schedule' },
  { id: 'assignments', icon: '📝', label: 'Assignments' },
  { id: 'announcements', icon: '📢', label: 'Announcements' },
];

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
  const [profileOpen, setProfileOpen] = useState(false);
  const [courseFiles, setCourseFiles] = useState([]);
  const [uploadFiles, setUploadFiles] = useState({});
  const [notifCount, setNotifCount] = useState(0);
  const [notifList, setNotifList] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [submitMsg, setSubmitMsg] = useState('');
  const [acceptingId, setAcceptingId] = useState(null);

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  const [selectedDay, setSelectedDay] = useState(today);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const switchTab = (id) => {
    setActiveTab(id);
    setMenuOpen(false);
    setProfileOpen(false);
    if (id !== 'courseDetail') setSelectedCourse(null);
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

  const handleSubmitAssignment = async (id) => {
    const file = uploadFiles[id];
    if (!file) {
      setSubmitMsg('Please select a file to submit');
      return;
    }

    setSubmittingId(id);
    setSubmitMsg('');
    try {
      // First upload the file
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', `Assignment Submission - ${id}`);
      fd.append('description', 'Student assignment submission');
      fd.append('courseCode', 'ASSIGNMENT');
      fd.append('department', user?.department || '');
      fd.append('year', user?.year || '');
      fd.append('semester', '1');
      fd.append('section', user?.section || '');
      fd.append('category', 'assignment');

      const uploadRes = await fileService.upload(fd);
      if (!uploadRes.success || !uploadRes.file) {
        throw new Error('File upload failed');
      }

      // Then submit the assignment with file reference
      await assignmentService.submit(id, { fileId: uploadRes.file._id, accepted: true });
      setSubmitMsg('Assignment submitted successfully!');
      
      // Clear the uploaded file
      setUploadFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[id];
        return newFiles;
      });

      const [assignData, upcomingData] = await Promise.all([
        assignmentService.getAll(),
        assignmentService.getUpcoming(),
      ]);
      setAllAssignments(assignData || []);
      setUpcomingAssignments(upcomingData || []);
    } catch (err) {
      setSubmitMsg('Failed to submit. Try again.');
    }
    setSubmittingId(null);
  };

  const handleAcceptAssignment = async (id) => {
    setAcceptingId(id);
    try {
      const res = await assignmentService.accept(id);
      if (res.success) {
        // Refresh assignments to show updated status
        await fetchAssignments();
        setSubmitMsg('Assignment accepted successfully!');
      } else {
        setSubmitMsg('Failed to accept assignment. Try again.');
      }
    } catch (err) {
      setSubmitMsg('Failed to accept assignment. Try again.');
    }
    setAcceptingId(null);
  };

  const fetchCourseFiles = async (courseCode) => {
    try {
      const data = await fileService.getAll({ courseCode });
      setCourseFiles(data.files || data || []);
    } catch (e) {
      setCourseFiles([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await announcementService.getNotifications();
      setNotifCount(data.unreadCount || 0);
      setNotifList(data.notifications || []);
    } catch (e) { /* silent */ }
  };

  const handleOpenNotif = async () => {
    setNotifOpen((v) => !v);
    if (!notifOpen && notifList.length > 0) {
      const ids = notifList.map((n) => n._id);
      await announcementService.markAsRead(ids);
      setNotifCount(0);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDepartment = user?.department || '';
        const [annData, schedData, allSchedData, assignData, upcomingData, courseData] = await Promise.all([
          announcementService.getAll({ limit: 10 }),
          scheduleService.getAll({ day: today, department: user?.department, year: user?.year, section: user?.section }),
          scheduleService.getAll({ department: user?.department, year: user?.year, section: user?.section }),
          assignmentService.getAll(),
          assignmentService.getUpcoming(),
          courseService.getAll({ department: userDepartment }),
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

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const pageTitle =
    activeTab === 'courseDetail'
      ? selectedCourse?.name || 'Course'
      : SIDEBAR_NAV.find((n) => n.id === activeTab)?.label || 'Student';

  const sidebarActive = (id) =>
    id === 'courses' ? activeTab === 'courses' || activeTab === 'courseDetail' : activeTab === id;

  const renderDashboard = () => (
    <div className="tab-content">
      <div className="admin-quick-actions" style={{ marginBottom: 24 }}>
        <h3>Quick actions</h3>
        <div className="admin-quick-grid">
          <button type="button" className="admin-quick-btn" onClick={() => switchTab('courses')}>📚 My courses</button>
          <button type="button" className="admin-quick-btn" onClick={() => switchTab('schedule')}>📅 Schedule</button>
          <button type="button" className="admin-quick-btn" onClick={() => switchTab('assignments')}>📝 Assignments</button>
          <button type="button" className="admin-quick-btn" onClick={() => switchTab('announcements')}>📢 Announcements</button>
        </div>
      </div>

      <p style={{ color: '#555', marginBottom: 20, fontSize: 15 }}>
        Welcome back, <strong>{user?.name?.split(' ')[0]}</strong> · {user?.department} · Year {user?.year}
        {user?.section ? ` · Section ${user.section}` : ''}
      </p>

      <div className="admin-stats-grid">
        {[
          { icon: '📅', val: todaySchedule.length, label: 'Classes today', tab: 'schedule' },
          { icon: '📝', val: upcomingAssignments.length, label: 'Upcoming tasks', tab: 'assignments' },
          { icon: '📚', val: myCourses.length, label: 'My courses', tab: 'courses' },
          { icon: '📢', val: announcements.length, label: 'Announcements', tab: 'announcements' },
        ].map((s, i) => (
          <div key={i} className="admin-stat-card" onClick={() => switchTab(s.tab)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && switchTab(s.tab)}>
            <div className="admin-stat-icon">{s.icon}</div>
            <div className="admin-stat-value">{s.val}</div>
            <div className="admin-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="data-section" style={{ marginTop: 8 }}>
        <div className="section-header">
          <h2>📅 Today&apos;s schedule</h2>
          <button type="button" className="refresh-btn" style={{ background: '#1565c0' }} onClick={() => switchTab('schedule')}>View week</button>
        </div>
        {todaySchedule.length > 0 ? (
          <div className="data-table">
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
                    <td><span className="time-badge">{sched.startTime} – {sched.endTime}</span></td>
                    <td>
                      <div className="assignment-title" style={{ margin: 0 }}>{sched.courseName}</div>
                      <div className="assignment-course">{sched.courseCode}</div>
                    </td>
                    <td>{sched.room || 'TBA'}</td>
                    <td>{sched.building || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">No classes scheduled for today</div>
        )}
      </div>

      <div className="data-section">
        <div className="section-header">
          <h2>📝 Upcoming assignments</h2>
          <button type="button" className="refresh-btn" style={{ background: '#1565c0' }} onClick={() => switchTab('assignments')}>View all</button>
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
                  <div className={`due-badge ${getUrgencyClass(assign.dueDate)}`}>{getDaysUntil(assign.dueDate)}</div>
                  <div className="due-date">Due: {formatDate(assign.dueDate)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No upcoming assignments</div>
        )}
      </div>

      <div className="data-section">
        <div className="section-header">
          <h2>📢 Recent announcements</h2>
          <button type="button" className="refresh-btn" style={{ background: '#1565c0' }} onClick={() => switchTab('announcements')}>View all</button>
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
      </div>
    </div>
  );

  const renderSchedule = () => {
    const daySchedules = allSchedule.filter((s) => s.day === selectedDay);
    return (
      <div className="tab-content">
        <div className="data-section">
          <div className="section-header">
            <h2>📅 Weekly schedule</h2>
          </div>
          <div className="tab-container">
            {days.slice(1, 6).map((day) => (
              <button
                key={day}
                type="button"
                className={`tab ${selectedDay === day ? 'active' : ''}`}
                onClick={() => setSelectedDay(day)}
              >
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </button>
            ))}
          </div>
          {daySchedules.length > 0 ? (
            <div className="data-table">
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
                      <td><span className="time-badge">{sched.startTime} – {sched.endTime}</span></td>
                      <td>{sched.courseName}</td>
                      <td>{sched.courseCode || '—'}</td>
                      <td>{sched.room || 'TBA'}</td>
                      <td>{sched.building || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">No classes scheduled for {selectedDay}</div>
          )}
        </div>
      </div>
    );
  };

  const renderAssignments = () => (
    <div className="tab-content">
      {submitMsg && <div className="success-message" style={{ marginBottom: 12 }}>{submitMsg}</div>}
      <div className="data-section">
        <div className="section-header">
          <h2>📝 Assignments</h2>
        </div>
        {allAssignments.length > 0 ? (
          <div className="assignments-list">
            {allAssignments.map((assign, idx) => (
              <div key={idx} className={`assignment-card ${getUrgencyClass(assign.dueDate)}`}>
                <div className="assignment-info">
                  <div className="assignment-title">{assign.title}</div>
                  <div className="assignment-course">{assign.courseName} ({assign.courseCode})</div>
                  <div className="assignment-desc">{assign.description}</div>
                  {assign.points != null && <div className="assignment-desc">Points: {assign.points}</div>}
                </div>
                <div className="assignment-due">
                  <div className={`due-badge ${getUrgencyClass(assign.dueDate)}`}>{getDaysUntil(assign.dueDate)}</div>
                  <div className="due-date">Due: {formatDate(assign.dueDate)}</div>
                  <div className={`status-badge ${assign.status}`}>{assign.status}</div>
                  {assign.lecturerAccepted === true && <div className="status-badge accepted">Accepted by Lecturer</div>}
                  {assign.lecturerAccepted === false && <div className="status-badge rejected">Rejected by Lecturer</div>}
                  {assign.lecturerFeedback && (
                    <div className="due-date" style={{ color: '#ff9800', fontStyle: 'italic', marginTop: 4 }}>
                      Feedback: {assign.lecturerFeedback}
                    </div>
                  )}
                  {assign.status === 'pending' && !assign.accepted && (
                    <button
                      type="button"
                      className="submit-btn"
                      style={{ marginTop: 8, padding: '6px 14px', fontSize: 13, maxWidth: 140, marginLeft: 'auto', background: '#4caf50' }}
                      disabled={acceptingId === assign._id}
                      onClick={() => handleAcceptAssignment(assign._id)}
                    >
                      {acceptingId === assign._id ? 'Accepting...' : '✅ Accept'}
                    </button>
                  )}
                  {assign.status === 'pending' && assign.accepted && (
                    <div style={{ marginTop: 8 }}>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.zip,.rar,.txt,.jpg,.png"
                        onChange={(e) => setUploadFiles(prev => ({ ...prev, [assign._id]: e.target.files[0] }))}
                        style={{ marginBottom: 4, fontSize: 12 }}
                        required
                      />
                      <button
                        type="button"
                        className="submit-btn"
                        style={{ padding: '6px 14px', fontSize: 13, maxWidth: 140, marginLeft: 'auto' }}
                        disabled={submittingId === assign._id || !uploadFiles[assign._id]}
                        onClick={() => handleSubmitAssignment(assign._id)}
                      >
                        {submittingId === assign._id ? 'Submitting...' : '📤 Submit Assignment'}
                      </button>
                      {!uploadFiles[assign._id] && (
                        <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                          Please select a file to submit
                        </div>
                      )}
                    </div>
                  )}
                  {assign.status === 'graded' && assign.grade !== undefined && (
                    <div className="due-date" style={{ color: '#2e7d32', fontWeight: 700 }}>Grade: {assign.grade}</div>
                  )}
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
    <div className="tab-content">
      <div className="data-section">
        <div className="section-header">
          <h2>📚 My courses</h2>
        </div>
        {myCourses.length > 0 ? (
          <div className="courses-grid">
            {myCourses.map((course, idx) => (
              <div
                key={idx}
                className="course-card"
                onClick={() => {
                  setSelectedCourse(course);
                  setActiveTab('courseDetail');
                  fetchCourseFiles(course.code);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSelectedCourse(course);
                    setActiveTab('courseDetail');
                    fetchCourseFiles(course.code);
                  }
                }}
              >
                <div className="course-code-badge">{course.code}</div>
                <div className="course-name">{course.name}</div>
                <div className="course-meta">
                  <span>Year {course.year}</span> • <span>Sem {course.semester}</span> • <span>{course.credits} cr</span>
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
    <div className="tab-content">
      <div className="data-section">
        <div className="section-header">
          <h2>Course detail</h2>
          <button type="button" className="refresh-btn" style={{ background: '#6c757d' }} onClick={() => switchTab('courses')}>← Back to courses</button>
        </div>
        {selectedCourse && (
          <div className="course-detail">
            <div className="detail-header">
              <span className="detail-code-badge">{selectedCourse.code}</span>
              <h3>{selectedCourse.name}</h3>
            </div>
            <div className="detail-grid">
              <div className="detail-item"><span className="detail-label">Instructor</span><span className="detail-value">{selectedCourse.instructor}</span></div>
              <div className="detail-item"><span className="detail-label">Department</span><span className="detail-value">{selectedCourse.department}</span></div>
              <div className="detail-item"><span className="detail-label">Year / Semester</span><span className="detail-value">Year {selectedCourse.year} / Sem {selectedCourse.semester}</span></div>
              <div className="detail-item"><span className="detail-label">Credits</span><span className="detail-value">{selectedCourse.credits}</span></div>
            </div>

            <h4 className="section-title">📁 Course materials</h4>
            {courseFiles.length > 0 ? (
              <div className="assignments-list">
                {courseFiles.map((f, idx) => (
                  <div key={idx} className="assignment-card normal">
                    <div className="assignment-info">
                      <div className="assignment-title">{f.title}</div>
                      <div className="assignment-course">{f.category} · {f.uploadedBy?.name || 'Instructor'}</div>
                    </div>
                    <div className="assignment-due">
                      <button type="button" className="refresh-btn" style={{ background: '#1565c0' }} onClick={() => fileService.download(f._id)}>⬇ Download</button>
                      <div className="due-date">{formatDate(f.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No materials uploaded yet</div>
            )}

            <h4 className="section-title">📝 Assignments for this course</h4>
            {allAssignments.filter((a) => a.courseCode === selectedCourse.code).length > 0 ? (
              <div className="assignments-list">
                {allAssignments.filter((a) => a.courseCode === selectedCourse.code).map((assign, idx) => (
                  <div key={idx} className={`assignment-card ${getUrgencyClass(assign.dueDate)}`}>
                    <div className="assignment-info">
                      <div className="assignment-title">{assign.title}</div>
                      <div className="assignment-desc">{assign.description}</div>
                    </div>
                    <div className="assignment-due">
                      <div className={`due-badge ${getUrgencyClass(assign.dueDate)}`}>{getDaysUntil(assign.dueDate)}</div>
                      <div className="due-date">Due: {formatDate(assign.dueDate)}</div>
                      <div className={`status-badge ${assign.status}`}>{assign.status}</div>
                      {assign.lecturerAccepted === true && <div className="status-badge accepted">Accepted by Lecturer</div>}
                      {assign.lecturerAccepted === false && <div className="status-badge rejected">Rejected by Lecturer</div>}
                      {assign.lecturerFeedback && (
                        <div className="due-date" style={{ color: '#ff9800', fontStyle: 'italic', marginTop: 4 }}>
                          Feedback: {assign.lecturerFeedback}
                        </div>
                      )}
                      {assign.status === 'pending' && !assign.accepted && (
                        <button
                          type="button"
                          className="submit-btn"
                          style={{ marginTop: 8, padding: '6px 14px', fontSize: 13, maxWidth: 140, marginLeft: 'auto', background: '#4caf50' }}
                          disabled={acceptingId === assign._id}
                          onClick={() => handleAcceptAssignment(assign._id)}
                        >
                          {acceptingId === assign._id ? 'Accepting...' : '✅ Accept'}
                        </button>
                      )}
                      {assign.status === 'pending' && assign.accepted && (
                        <div style={{ marginTop: 8 }}>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.zip,.rar,.txt,.jpg,.png"
                            onChange={(e) => setUploadFiles(prev => ({ ...prev, [assign._id]: e.target.files[0] }))}
                            style={{ marginBottom: 4, fontSize: 12 }}
                            required
                          />
                          <button
                            type="button"
                            className="submit-btn"
                            style={{ padding: '6px 14px', fontSize: 13, maxWidth: 140, marginLeft: 'auto' }}
                            disabled={submittingId === assign._id || !uploadFiles[assign._id]}
                            onClick={() => handleSubmitAssignment(assign._id)}
                          >
                            {submittingId === assign._id ? 'Submitting...' : '📤 Submit Assignment'}
                          </button>
                          {!uploadFiles[assign._id] && (
                            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                              Please select a file to submit
                            </div>
                          )}
                        </div>
                      )}
                      {assign.status === 'graded' && assign.grade !== undefined && (
                        <div className="due-date" style={{ color: '#2e7d32', fontWeight: 700 }}>Grade: {assign.grade}</div>
                      )}
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
    <div className="tab-content">
      <div className="data-section">
        <div className="section-header">
          <h2>📢 Announcements</h2>
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
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header" />
        <ul className="admin-sidebar-menu">
          {SIDEBAR_NAV.map((n) => (
            <li
              key={n.id}
              className={`admin-menu-item ${sidebarActive(n.id) ? 'active' : ''}`}
              onClick={() => switchTab(n.id)}
            >
              <span className="admin-menu-icon">{n.icon}</span>
              <span>{n.label}</span>
            </li>
          ))}
        </ul>
      </aside>

      {menuOpen && <div className="admin-overlay" onClick={() => setMenuOpen(false)} />}

      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header-left">
            <button type="button" className="admin-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">
              <span /><span /><span />
            </button>
            <span className="admin-header-brand">
              <img src="/logo.png" alt="SmartBDU" className="admin-header-logo-img" />
            </span>
          </div>

          <h1 className="admin-header-title">{pageTitle}</h1>

          <div className="admin-header-right">
            <div className="notif-wrap">
              <button type="button" className="notif-bell" onClick={handleOpenNotif} title="Notifications" aria-label="Notifications">
                🔔
                {notifCount > 0 && <span className="notif-badge">{notifCount > 9 ? '9+' : notifCount}</span>}
              </button>
              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span>Notifications</span>
                    <button type="button" className="notif-close" onClick={() => setNotifOpen(false)} aria-label="Close">✕</button>
                  </div>
                  {notifList.length === 0 ? (
                    <div className="notif-empty">No new notifications</div>
                  ) : (
                    notifList.map((n, idx) => (
                      <div
                        key={idx}
                        className={`notif-item priority-${n.priority}`}
                        onClick={() => { setNotifOpen(false); switchTab('announcements'); }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setNotifOpen(false);
                            switchTab('announcements');
                          }
                        }}
                      >
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-meta">
                          <span className={`badge tag-${n.category}`}>{n.category}</span>
                          <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                  <button type="button" className="notif-view-all" onClick={() => { setNotifOpen(false); switchTab('announcements'); }}>
                    View all announcements →
                  </button>
                </div>
              )}
            </div>

            <div className="admin-profile-wrap">
              <button type="button" className="admin-profile-btn" onClick={() => setProfileOpen((v) => !v)} title="Profile">
                <span className="admin-header-avatar">{user?.name?.charAt(0)}</span>
                <span className="admin-profile-name">{user?.name?.split(' ')[0]}</span>
                <span className="admin-profile-caret">{profileOpen ? '▲' : '▼'}</span>
              </button>
              {profileOpen && (
                <div className="admin-profile-dropdown">
                  <div className="admin-profile-info">
                    <div className="admin-profile-avatar-lg">{user?.name?.charAt(0)}</div>
                    <div>
                      <div className="admin-profile-fullname">{user?.name}</div>
                      <div className="admin-profile-email">{user?.email}</div>
                      <div className="admin-profile-role">Student · {user?.department} · Year {user?.year}</div>
                    </div>
                  </div>
                  <hr className="admin-profile-divider" />
                  <button type="button" className="admin-profile-action logout" onClick={handleLogout}>🚪 Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="admin-content">
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
