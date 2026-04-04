import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService, courseService, announcementService, scheduleService } from '../services/api';
import './Admin.css';

const EMPTY_STUDENT = { name: '', email: '', studentId: '', department: '', year: '', section: '', phone: '' };
const EMPTY_TEACHER = { name: '', email: '', employeeId: '', department: '', phone: '', departments: '', batches: '', sections: '' };
const EMPTY_COURSE_ROW = { name: '', code: '', semester: '', credits: '', instructor: '' };
const EMPTY_SCHED_ROW = { day: 'monday', startTime: '', endTime: '', courseName: '', courseCode: '', instructor: '', room: '', building: '' };

const NAV = [
  { id: 'dashboard',     icon: '🏠', label: 'Dashboard' },
  { id: 'students',      icon: '🎓', label: 'Students' },
  { id: 'teachers',      icon: '👩‍🏫', label: 'Teachers' },
  { id: 'courses',       icon: '📚', label: 'Courses' },
  { id: 'announcements', icon: '📢', label: 'Announcements' },
  { id: 'schedule',      icon: '📅', label: 'Schedule' },
];

const SIDEBAR_NAV = [
  { id: 'dashboard',     icon: '🏠', label: 'Dashboard' },
  { id: 'students',      icon: '🎓', label: 'Students' },
  { id: 'teachers',      icon: '👩‍🏫', label: 'Teachers' },
  { id: 'courses',       icon: '📚', label: 'Courses' },
  { id: 'announcements', icon: '📢', label: 'Announcements' },
  { id: 'schedule',      icon: '📅', label: 'Schedule' },
];

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);

  const [studentForm, setStudentForm] = useState(EMPTY_STUDENT);
  const [teacherForm, setTeacherForm] = useState(EMPTY_TEACHER);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);
  const [studentLoading, setStudentLoading] = useState(false);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [createdUserPassword, setCreatedUserPassword] = useState(null);

  const [courseHeader, setCourseHeader] = useState({ department: '', year: '' });
  const [courseRows, setCourseRows] = useState([{ ...EMPTY_COURSE_ROW }, { ...EMPTY_COURSE_ROW }]);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState(false);

  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', category: 'general', priority: 'normal', targetType: 'all', department: '', batch: '', section: '' });
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementLoading, setAnnouncementLoading] = useState(false);

  const [schedHeader, setSchedHeader] = useState({ department: '', year: '', semester: '', section: '' });
  const [schedRows, setSchedRows] = useState([{ ...EMPTY_SCHED_ROW }, { ...EMPTY_SCHED_ROW }]);
  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [schedFilter, setSchedFilter] = useState({ department: '', year: '', section: '' });

  const [profileForm, setProfileForm] = useState({ name: '', phone: '', currentPassword: '', newPassword: '' });
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'students' || activeTab === 'teachers') fetchUsers();
    else if (activeTab === 'courses') fetchCourses();
    else if (activeTab === 'announcements') fetchAnnouncements();
    else if (activeTab === 'schedule') fetchSchedules();
    setMessage(''); setError(''); setCreatedUserPassword(null);
  }, [activeTab]);

  const fetchUsers = async () => { setUsersLoading(true); try { setUsers(await adminService.getUsers()); } catch (e) { console.error(e); } setUsersLoading(false); };
  const fetchCourses = async () => { setCoursesLoading(true); try { setCourses(await courseService.getAll()); } catch (e) { console.error(e); } setCoursesLoading(false); };
  const fetchAnnouncements = async () => { setAnnouncementsLoading(true); try { const d = await announcementService.getAll(); setAnnouncements(d.announcements || []); } catch (e) { console.error(e); } setAnnouncementsLoading(false); };
  const fetchSchedules = async () => { setSchedulesLoading(true); try { setSchedules(await scheduleService.getAll()); } catch (e) { console.error(e); } setSchedulesLoading(false); };

  const handleLogout = () => { logout(); navigate('/login'); };
  const switchTab = (id) => { setActiveTab(id); setMenuOpen(false); setMessage(''); setError(''); setCreatedUserPassword(null); };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.email || !studentForm.studentId || !studentForm.department || !studentForm.year) { setError('Fill all required fields'); return; }
    setStudentLoading(true); setCreatedUserPassword(null);
    try {
      await adminService.createUser({ ...studentForm, role: 'student', year: parseInt(studentForm.year) });
      setMessage('Student added! Initial password = Student ID');
      setCreatedUserPassword({ name: studentForm.name, id: studentForm.studentId, password: studentForm.studentId });
      setStudentForm(EMPTY_STUDENT); setError(''); setModal(null); fetchUsers();
    } catch (err) { setError(err.message || 'Failed'); setMessage(''); }
    setStudentLoading(false);
  };

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    if (!teacherForm.name || !teacherForm.email || !teacherForm.department || !teacherForm.employeeId) { setError('Fill all required fields'); return; }
    setTeacherLoading(true); setCreatedUserPassword(null);
    try {
      const departments = teacherForm.departments ? teacherForm.departments.split(',').map(d => d.trim()).filter(Boolean) : [teacherForm.department];
      const batches = teacherForm.batches ? teacherForm.batches.split(',').map(b => b.trim()).filter(Boolean) : [];
      const sections = teacherForm.sections ? teacherForm.sections.split(',').map(s => s.trim()).filter(Boolean) : [];
      await adminService.createUser({ ...teacherForm, role: 'lecturer', departments, batches, sections });
      setMessage('Teacher added! Initial password = Employee ID');
      setCreatedUserPassword({ name: teacherForm.name, id: teacherForm.employeeId, password: teacherForm.employeeId });
      setTeacherForm(EMPTY_TEACHER); setError(''); setModal(null); fetchUsers();
    } catch (err) { setError(err.message || 'Failed'); setMessage(''); }
    setTeacherLoading(false);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await adminService.deleteUser(id); setMessage('User deleted'); fetchUsers(); } catch (err) { setError(err.message || 'Failed'); }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    if (!courseHeader.department || !courseHeader.year) { setError('Department and Year are required'); return; }
    const validRows = courseRows.filter(r => r.name.trim() && r.code.trim());
    if (validRows.length === 0) { setError('Add at least one course with name and code'); return; }
    setCourseLoading(true);
    try {
      await Promise.all(validRows.map(row => courseService.createCourse({ name: row.name, code: row.code, department: courseHeader.department, year: parseInt(courseHeader.year), semester: row.semester ? parseInt(row.semester) : undefined, credits: row.credits ? parseInt(row.credits) : undefined, instructor: row.instructor })));
      setMessage(`${validRows.length} course(s) created!`);
      setCourseHeader({ department: '', year: '' }); setCourseRows([{ ...EMPTY_COURSE_ROW }, { ...EMPTY_COURSE_ROW }]); setError(''); fetchCourses();
    } catch (err) { setError(err.message || 'Failed'); setMessage(''); }
    setCourseLoading(false);
  };

  const addCourseRow = () => { if (courseRows.length < 4) setCourseRows([...courseRows, { ...EMPTY_COURSE_ROW }]); };
  const removeCourseRow = (idx) => { if (courseRows.length > 1) setCourseRows(courseRows.filter((_, i) => i !== idx)); };
  const updateCourseRow = (idx, f, v) => setCourseRows(courseRows.map((r, i) => i === idx ? { ...r, [f]: v } : r));

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try { await courseService.deleteCourse(id); setMessage('Course deleted'); fetchCourses(); } catch (err) { setError(err.message || 'Failed'); }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault(); setAnnouncementLoading(true);
    try {
      await announcementService.createAnnouncement(announcementForm);
      setMessage('Announcement posted!');
      setAnnouncementForm({ title: '', content: '', category: 'general', priority: 'normal', targetType: 'all', department: '', batch: '', section: '' });
      setError(''); fetchAnnouncements();
    } catch (err) { setError(err.message || 'Failed'); setMessage(''); }
    setAnnouncementLoading(false);
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { await announcementService.deleteAnnouncement(id); setMessage('Deleted'); fetchAnnouncements(); } catch (err) { setError(err.message || 'Failed'); }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!schedHeader.department || !schedHeader.year) { setError('Department and Year are required'); return; }
    const validRows = schedRows.filter(r => r.courseName.trim() && r.day && r.startTime && r.endTime);
    if (validRows.length === 0) { setError('Add at least one entry with course name, day, and times'); return; }
    setScheduleLoading(true);
    try {
      const result = await scheduleService.createBatch({ department: schedHeader.department, year: schedHeader.year, semester: schedHeader.semester || undefined, section: schedHeader.section || undefined, entries: validRows });
      setMessage(`${result.schedules?.length || validRows.length} schedule entries created!`);
      setSchedHeader({ department: '', year: '', semester: '', section: '' }); setSchedRows([{ ...EMPTY_SCHED_ROW }, { ...EMPTY_SCHED_ROW }]); setError(''); fetchSchedules();
    } catch (err) { setError(err.message || 'Failed'); setMessage(''); }
    setScheduleLoading(false);
  };

  const addSchedRow = () => { if (schedRows.length < 8) setSchedRows([...schedRows, { ...EMPTY_SCHED_ROW }]); };
  const removeSchedRow = (idx) => { if (schedRows.length > 1) setSchedRows(schedRows.filter((_, i) => i !== idx)); };
  const updateSchedRow = (idx, f, v) => setSchedRows(schedRows.map((r, i) => i === idx ? { ...r, [f]: v } : r));

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { await scheduleService.delete(id); setMessage('Deleted'); fetchSchedules(); } catch (err) { setError(err.message || 'Failed'); }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault(); setProfileLoading(true); setProfileMsg(''); setProfileErr('');
    try {
      const token = localStorage.getItem('smartbdu_token');
      const body = {};
      if (profileForm.name) body.name = profileForm.name;
      if (profileForm.phone) body.phone = profileForm.phone;
      if (profileForm.newPassword) { body.password = profileForm.newPassword; body.currentPassword = profileForm.currentPassword; }
      const res = await fetch('http://localhost:8000/api/auth/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      setProfileMsg('Profile updated!'); setProfileForm({ name: '', phone: '', currentPassword: '', newPassword: '' });
    } catch (err) { setProfileErr(err.message); }
    setProfileLoading(false);
  };

  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'lecturer' || u.role === 'admin');
  const filterUser = (u) => !userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()) || u.studentId?.toLowerCase().includes(userSearch.toLowerCase()) || u.employeeId?.toLowerCase().includes(userSearch.toLowerCase());
  const pageTitle = NAV.find(n => n.id === activeTab)?.label || 'Admin';

  if (user?.role !== 'admin') return <div className="admin-access-denied">Access denied. Admin privileges required.</div>;

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
        </div>
        <ul className="admin-sidebar-menu">
          {SIDEBAR_NAV.map(n => (
            <li key={n.id} className={`admin-menu-item ${activeTab === n.id ? 'active' : ''}`} onClick={() => switchTab(n.id)}>
              <span className="admin-menu-icon">{n.icon}</span><span>{n.label}</span>
            </li>
          ))}
        </ul>
      </aside>

      {menuOpen && <div className="admin-overlay" onClick={() => setMenuOpen(false)} />}

      <main className="admin-main">
        <header className="admin-header">
          {/* Left — hamburger + logo */}
          <div className="admin-header-left">
            <button className="admin-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              <span /><span /><span />
            </button>
            <span className="admin-header-brand"><img src="/logo.png" alt="SmartBDU" className="admin-header-logo-img" /></span>
          </div>

          {/* Center — page title */}
          <h1 className="admin-header-title">{pageTitle}</h1>

          {/* Right — profile avatar + dropdown */}
          <div className="admin-header-right">
            <div className="admin-profile-wrap">
              <button className="admin-profile-btn" onClick={() => setProfileOpen(v => !v)} title="Profile">
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
                      <div className="admin-profile-role">Administrator</div>
                    </div>
                  </div>
                  <hr className="admin-profile-divider" />
                  <button className="admin-profile-action" onClick={() => { setProfileOpen(false); switchTab('profile'); }}>
                    ✏️ Edit Profile
                  </button>
                  <button className="admin-profile-action" onClick={() => { setProfileOpen(false); switchTab('students'); }}>
                    👥 Manage Users
                  </button>
                  <button className="admin-profile-action logout" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="admin-content">
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}
          {createdUserPassword && (
            <div className="success-message" style={{marginBottom:16,padding:14,background:'#e8f5e9',border:'1px solid #a5d6a7'}}>
              <strong>✅ User Created!</strong>&nbsp; Name: <strong>{createdUserPassword.name}</strong>&nbsp;|&nbsp; ID: <strong>{createdUserPassword.id}</strong>&nbsp;|&nbsp; Password: <strong>{createdUserPassword.password}</strong>
            </div>
          )}

          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="tab-content">
              <div className="admin-quick-actions" style={{marginBottom:24}}>
                <h3>Quick Actions</h3>
                <div className="admin-quick-grid">
                  <button className="admin-quick-btn" onClick={() => { switchTab('students'); setTimeout(() => setModal('student'), 100); }}>+ Student</button>
                  <button className="admin-quick-btn" onClick={() => { switchTab('teachers'); setTimeout(() => setModal('teacher'), 100); }}>+ Teacher</button>
                  <button className="admin-quick-btn" onClick={() => switchTab('courses')}>+ Course</button>
                  <button className="admin-quick-btn" onClick={() => switchTab('announcements')}>📢 Announce</button>
                  <button className="admin-quick-btn" onClick={() => switchTab('schedule')}>📅 Schedule</button>
                </div>
              </div>
              <div className="admin-stats-grid">
                {[
                  { icon: '🎓', val: users.filter(u => u.role === 'student').length, label: 'Students', tab: 'students' },
                  { icon: '👩‍🏫', val: users.filter(u => u.role === 'lecturer').length, label: 'Teachers', tab: 'teachers' },
                  { icon: '📚', val: courses.length, label: 'Courses', tab: 'courses' },
                  { icon: '📢', val: announcements.length, label: 'Announcements', tab: 'announcements' },
                  { icon: '📅', val: schedules.length, label: 'Schedule Entries', tab: 'schedule' },
                ].map((s, i) => (
                  <div key={i} className="admin-stat-card" onClick={() => switchTab(s.tab)}>
                    <div className="admin-stat-icon">{s.icon}</div>
                    <div className="admin-stat-value">{s.val}</div>
                    <div className="admin-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STUDENTS */}
          {activeTab === 'students' && (
            <div className="tab-content">
              <div className="user-action-bar">
                <button className="add-user-btn add-student-btn" onClick={() => { setModal('student'); setError(''); setMessage(''); }}>+ Add Student</button>
                <div style={{marginLeft:'auto',display:'flex',gap:8,alignItems:'center'}}>
                  <input type="text" placeholder="Search students..." value={userSearch} onChange={e => setUserSearch(e.target.value)} style={{padding:'7px 12px',borderRadius:8,border:'1px solid #ddd',fontSize:13}} />
                  <button onClick={fetchUsers} className="refresh-btn" disabled={usersLoading}>Refresh</button>
                </div>
              </div>
              <div className="data-section">
                <div className="section-header"><h2>🎓 Students ({students.filter(filterUser).length})</h2></div>
                {usersLoading ? <div className="loading">Loading...</div> : (
                  <div className="data-table"><table>
                    <thead><tr><th>Name</th><th>Student ID</th><th>Email</th><th>Department</th><th>Year</th><th>Section</th><th>Phone</th><th>Created</th><th>Actions</th></tr></thead>
                    <tbody>
                      {students.filter(filterUser).length === 0
                        ? <tr><td colSpan={9} style={{textAlign:'center',color:'#999',padding:20}}>No students found</td></tr>
                        : students.filter(filterUser).map(u => (
                          <tr key={u._id}>
                            <td>{u.name}</td><td><strong>{u.studentId||'-'}</strong></td><td>{u.email}</td>
                            <td>{u.department||'-'}</td><td>{u.year?`Year ${u.year}`:'-'}</td><td>{u.section||'-'}</td>
                            <td>{u.phone||'-'}</td><td>{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td><button className="delete-btn" onClick={() => handleDeleteUser(u._id)}>Delete</button></td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table></div>
                )}
              </div>
            </div>
          )}

          {/* TEACHERS */}
          {activeTab === 'teachers' && (
            <div className="tab-content">
              <div className="user-action-bar">
                <button className="add-user-btn add-teacher-btn" onClick={() => { setModal('teacher'); setError(''); setMessage(''); }}>+ Add Teacher</button>
                <div style={{marginLeft:'auto',display:'flex',gap:8,alignItems:'center'}}>
                  <input type="text" placeholder="Search teachers..." value={userSearch} onChange={e => setUserSearch(e.target.value)} style={{padding:'7px 12px',borderRadius:8,border:'1px solid #ddd',fontSize:13}} />
                  <button onClick={fetchUsers} className="refresh-btn" disabled={usersLoading}>Refresh</button>
                </div>
              </div>
              <div className="data-section">
                <div className="section-header"><h2>👩‍🏫 Teachers ({teachers.filter(filterUser).length})</h2></div>
                {usersLoading ? <div className="loading">Loading...</div> : (
                  <div className="data-table"><table>
                    <thead><tr><th>Name</th><th>Employee ID</th><th>Email</th><th>Primary Dept</th><th>Departments</th><th>Batches</th><th>Sections</th><th>Role</th><th>Created</th><th>Actions</th></tr></thead>
                    <tbody>
                      {teachers.filter(filterUser).length === 0
                        ? <tr><td colSpan={10} style={{textAlign:'center',color:'#999',padding:20}}>No teachers found</td></tr>
                        : teachers.filter(filterUser).map(u => (
                          <tr key={u._id}>
                            <td>{u.name}</td><td><strong>{u.employeeId||'-'}</strong></td><td>{u.email}</td>
                            <td>{u.department||'-'}</td><td>{u.departments?.join(', ')||'-'}</td>
                            <td>{u.batches?.join(', ')||'-'}</td><td>{u.sections?.join(', ')||'-'}</td>
                            <td><span className={`role-${u.role}`}>{u.role}</span></td>
                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td><button className="delete-btn" onClick={() => handleDeleteUser(u._id)}>Delete</button></td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table></div>
                )}
              </div>
            </div>
          )}

          {/* COURSES */}
          {activeTab === 'courses' && (
            <div className="tab-content">
              <div className="admin-forms single-form">
                <div className="form-section">
                  <h2>Create Courses</h2>
                  <form onSubmit={handleCourseSubmit}>
                    <div className="course-header-row">
                      <div className="form-group"><label>Department *</label><input type="text" value={courseHeader.department} onChange={e => setCourseHeader({...courseHeader,department:e.target.value})} placeholder="e.g. Computer Science" required /></div>
                      <div className="form-group"><label>Batch / Year *</label><input type="number" value={courseHeader.year} onChange={e => setCourseHeader({...courseHeader,year:e.target.value})} placeholder="e.g. 3" min="1" max="6" required /></div>
                    </div>
                    <div className="course-rows-label"><span>Courses for this Department &amp; Batch</span><span className="hint-text">{courseRows.length}/4 courses</span></div>
                    {courseRows.map((row, idx) => (
                      <div key={idx} className="course-row-card">
                        <div className="course-row-num">#{idx+1}</div>
                        <div className="course-row-fields">
                          <div className="form-group"><label>Course Name *</label><input type="text" value={row.name} onChange={e => updateCourseRow(idx,'name',e.target.value)} placeholder="e.g. Data Structures" /></div>
                          <div className="form-group"><label>Course Code *</label><input type="text" value={row.code} onChange={e => updateCourseRow(idx,'code',e.target.value)} placeholder="e.g. CSE301" /></div>
                          <div className="form-group"><label>Semester</label><input type="number" value={row.semester} onChange={e => updateCourseRow(idx,'semester',e.target.value)} placeholder="1 or 2" min="1" max="2" /></div>
                          <div className="form-group"><label>Credits</label><input type="number" value={row.credits} onChange={e => updateCourseRow(idx,'credits',e.target.value)} placeholder="e.g. 3" min="1" max="6" /></div>
                          <div className="form-group course-row-instructor"><label>Instructor</label><input type="text" value={row.instructor} onChange={e => updateCourseRow(idx,'instructor',e.target.value)} placeholder="e.g. Dr. Solomon" /></div>
                        </div>
                        {courseRows.length > 1 && <button type="button" className="remove-row-btn" onClick={() => removeCourseRow(idx)}>✕</button>}
                      </div>
                    ))}
                    <div className="course-row-actions">
                      {courseRows.length < 4 && <button type="button" className="add-row-btn" onClick={addCourseRow}>+ Add Another Course</button>}
                      <button type="submit" className="submit-btn" disabled={courseLoading} style={{flex:1}}>{courseLoading ? 'Creating...' : `Create ${courseRows.filter(r=>r.name&&r.code).length||''} Course(s)`}</button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="data-section">
                <div className="section-header"><h2>Courses ({courses.length})</h2><button onClick={fetchCourses} className="refresh-btn" disabled={coursesLoading}>Refresh</button></div>
                {coursesLoading ? <div className="loading">Loading...</div> : (
                  <div className="data-table"><table>
                    <thead><tr><th>Code</th><th>Title</th><th>Department</th><th>Instructor</th><th>Year/Sem</th><th>Credits</th><th>Actions</th></tr></thead>
                    <tbody>
                      {courses.length === 0 ? <tr><td colSpan={7} style={{textAlign:'center',color:'#999',padding:20}}>No courses</td></tr>
                        : courses.map(c => (
                          <tr key={c._id}>
                            <td><strong>{c.code}</strong></td><td>{c.name}</td><td>{c.department}</td>
                            <td>{c.instructor||'-'}</td><td>Y{c.year}/S{c.semester}</td><td>{c.credits}</td>
                            <td><button className="delete-btn" onClick={() => handleDeleteCourse(c._id)}>Delete</button></td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table></div>
                )}
              </div>
            </div>
          )}

          {/* ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="tab-content">
              <div className="admin-forms single-form">
                <div className="form-section">
                  <h2>Post Announcement</h2>
                  <form onSubmit={handleAnnouncementSubmit}>
                    <div className="form-group"><label>Title *</label><input type="text" value={announcementForm.title} onChange={e => setAnnouncementForm({...announcementForm,title:e.target.value})} required /></div>
                    <div className="form-group"><label>Content *</label><textarea value={announcementForm.content} onChange={e => setAnnouncementForm({...announcementForm,content:e.target.value})} rows={4} required /></div>
                    <div className="form-group"><label>Target Audience</label>
                      <select value={announcementForm.targetType} onChange={e => setAnnouncementForm({...announcementForm,targetType:e.target.value,department:'',batch:'',section:''})}>
                        <option value="all">🌐 All Students</option>
                        <option value="department">🏛 Specific Department</option>
                        <option value="batch">📅 Department + Batch</option>
                        <option value="section">🎯 Department + Batch + Section</option>
                        <option value="teachers">👩‍🏫 Teachers Only</option>
                      </select>
                    </div>
                    {(announcementForm.targetType==='department'||announcementForm.targetType==='batch'||announcementForm.targetType==='section') && (
                      <div className="form-group"><label>Department *</label><input type="text" value={announcementForm.department} onChange={e => setAnnouncementForm({...announcementForm,department:e.target.value})} placeholder="e.g. Computer Science" required /></div>
                    )}
                    {(announcementForm.targetType==='batch'||announcementForm.targetType==='section') && (
                      <div className="form-group"><label>Batch / Year *</label><input type="text" value={announcementForm.batch} onChange={e => setAnnouncementForm({...announcementForm,batch:e.target.value})} placeholder="e.g. 3" required /></div>
                    )}
                    {announcementForm.targetType==='section' && (
                      <div className="form-group"><label>Section *</label><input type="text" value={announcementForm.section} onChange={e => setAnnouncementForm({...announcementForm,section:e.target.value})} placeholder="e.g. A" required /></div>
                    )}
                    <div className="ann-meta-row">
                      <div className="form-group"><label>Category</label>
                        <select value={announcementForm.category} onChange={e => setAnnouncementForm({...announcementForm,category:e.target.value})}>
                          <option value="general">General</option><option value="academic">Academic</option><option value="event">Event</option><option value="urgent">Urgent</option>
                        </select>
                      </div>
                      <div className="form-group"><label>Priority</label>
                        <select value={announcementForm.priority} onChange={e => setAnnouncementForm({...announcementForm,priority:e.target.value})}>
                          <option value="normal">Normal</option><option value="important">Important</option><option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>
                    <div className="ann-target-preview">
                      📣 Sending to: <strong>
                        {announcementForm.targetType==='all'&&'All Students'}
                        {announcementForm.targetType==='teachers'&&'Teachers Only'}
                        {announcementForm.targetType==='department'&&(announcementForm.department||'a department')}
                        {announcementForm.targetType==='batch'&&`${announcementForm.department||'dept'} — Year ${announcementForm.batch||'?'}`}
                        {announcementForm.targetType==='section'&&`${announcementForm.department||'dept'} — Y${announcementForm.batch||'?'} — Sec ${announcementForm.section||'?'}`}
                      </strong>
                    </div>
                    <button type="submit" className="submit-btn" disabled={announcementLoading}>{announcementLoading?'Posting...':'📢 Post Announcement'}</button>
                  </form>
                </div>
              </div>
              <div className="data-section">
                <div className="section-header"><h2>Announcements ({announcements.length})</h2><button onClick={fetchAnnouncements} className="refresh-btn" disabled={announcementsLoading}>Refresh</button></div>
                {announcementsLoading ? <div className="loading">Loading...</div> : (
                  <div className="data-table"><table>
                    <thead><tr><th>Title</th><th>Category</th><th>Priority</th><th>Date</th><th>Actions</th></tr></thead>
                    <tbody>
                      {announcements.length===0 ? <tr><td colSpan={5} style={{textAlign:'center',color:'#999',padding:20}}>No announcements</td></tr>
                        : announcements.map(a => (
                          <tr key={a._id}>
                            <td>{a.title}</td>
                            <td><span className={`badge tag-${a.category}`}>{a.category}</span></td>
                            <td><span className={`badge prio-${a.priority}`}>{a.priority}</span></td>
                            <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                            <td><button className="delete-btn" onClick={() => handleDeleteAnnouncement(a._id)}>Delete</button></td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table></div>
                )}
              </div>
            </div>
          )}

          {/* SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="tab-content">
              <div className="admin-forms single-form">
                <div className="form-section">
                  <h2>Create Class Schedule</h2>
                  <form onSubmit={handleScheduleSubmit}>
                    <div className="sched-header-grid">
                      <div className="form-group"><label>Department *</label><input type="text" value={schedHeader.department} onChange={e => setSchedHeader({...schedHeader,department:e.target.value})} placeholder="e.g. Computer Science" required /></div>
                      <div className="form-group"><label>Batch / Year *</label><input type="number" value={schedHeader.year} onChange={e => setSchedHeader({...schedHeader,year:e.target.value})} placeholder="e.g. 3" min="1" max="6" required /></div>
                      <div className="form-group"><label>Semester</label><input type="number" value={schedHeader.semester} onChange={e => setSchedHeader({...schedHeader,semester:e.target.value})} placeholder="1 or 2" min="1" max="2" /></div>
                      <div className="form-group"><label>Section</label><input type="text" value={schedHeader.section} onChange={e => setSchedHeader({...schedHeader,section:e.target.value})} placeholder="e.g. A" /></div>
                    </div>
                    <div className="course-rows-label"><span>Course Schedule Entries</span><span className="hint-text">{schedRows.length}/8 entries</span></div>
                    {schedRows.map((row, idx) => (
                      <div key={idx} className="sched-row-card">
                        <div className="course-row-num">#{idx+1}</div>
                        <div className="sched-row-fields">
                          <div className="form-group"><label>Course Name *</label><input type="text" value={row.courseName} onChange={e => updateSchedRow(idx,'courseName',e.target.value)} placeholder="e.g. Data Structures" /></div>
                          <div className="form-group"><label>Code</label><input type="text" value={row.courseCode} onChange={e => updateSchedRow(idx,'courseCode',e.target.value)} placeholder="CSE301" /></div>
                          <div className="form-group"><label>Day *</label>
                            <select value={row.day} onChange={e => updateSchedRow(idx,'day',e.target.value)}>
                              {['monday','tuesday','wednesday','thursday','friday','saturday'].map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
                            </select>
                          </div>
                          <div className="form-group"><label>Start *</label><input type="time" value={row.startTime} onChange={e => updateSchedRow(idx,'startTime',e.target.value)} /></div>
                          <div className="form-group"><label>End *</label><input type="time" value={row.endTime} onChange={e => updateSchedRow(idx,'endTime',e.target.value)} /></div>
                          <div className="form-group"><label>Instructor</label><input type="text" value={row.instructor} onChange={e => updateSchedRow(idx,'instructor',e.target.value)} placeholder="Dr. Solomon" /></div>
                          <div className="form-group"><label>Room</label><input type="text" value={row.room} onChange={e => updateSchedRow(idx,'room',e.target.value)} placeholder="Room 101" /></div>
                          <div className="form-group"><label>Building</label><input type="text" value={row.building} onChange={e => updateSchedRow(idx,'building',e.target.value)} placeholder="CS Block" /></div>
                        </div>
                        {schedRows.length > 1 && <button type="button" className="remove-row-btn" onClick={() => removeSchedRow(idx)}>✕</button>}
                      </div>
                    ))}
                    <div className="course-row-actions">
                      {schedRows.length < 8 && <button type="button" className="add-row-btn" onClick={addSchedRow}>+ Add Entry</button>}
                      <button type="submit" className="submit-btn" disabled={scheduleLoading} style={{flex:1}}>{scheduleLoading?'Creating...':`📅 Create ${schedRows.filter(r=>r.courseName&&r.startTime&&r.endTime).length||''} Schedule Entries`}</button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="data-section">
                <div className="section-header">
                  <h2>Schedules ({schedules.length})</h2>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                    <input type="text" placeholder="Filter dept..." value={schedFilter.department} onChange={e => setSchedFilter({...schedFilter,department:e.target.value})} style={{padding:'6px 10px',borderRadius:6,border:'1px solid #ddd',fontSize:13,width:140}} />
                    <input type="text" placeholder="Year..." value={schedFilter.year} onChange={e => setSchedFilter({...schedFilter,year:e.target.value})} style={{padding:'6px 10px',borderRadius:6,border:'1px solid #ddd',fontSize:13,width:70}} />
                    <input type="text" placeholder="Section..." value={schedFilter.section} onChange={e => setSchedFilter({...schedFilter,section:e.target.value})} style={{padding:'6px 10px',borderRadius:6,border:'1px solid #ddd',fontSize:13,width:80}} />
                    <button onClick={fetchSchedules} className="refresh-btn" disabled={schedulesLoading}>Refresh</button>
                  </div>
                </div>
                {schedulesLoading ? <div className="loading">Loading...</div> : (
                  <div className="data-table"><table>
                    <thead><tr><th>Day</th><th>Time</th><th>Course</th><th>Instructor</th><th>Room</th><th>Dept</th><th>Year</th><th>Sem</th><th>Section</th><th>Actions</th></tr></thead>
                    <tbody>
                      {schedules.filter(s =>
                        (!schedFilter.department||s.department?.toLowerCase().includes(schedFilter.department.toLowerCase())) &&
                        (!schedFilter.year||String(s.year)===schedFilter.year) &&
                        (!schedFilter.section||s.section?.toLowerCase().includes(schedFilter.section.toLowerCase()))
                      ).map(s => (
                        <tr key={s._id}>
                          <td style={{textTransform:'capitalize',fontWeight:600}}>{s.day}</td>
                          <td><span style={{background:'#e3f0ff',color:'#1565c0',padding:'2px 8px',borderRadius:6,fontSize:12,fontWeight:600}}>{s.startTime} – {s.endTime}</span></td>
                          <td><strong>{s.courseName}</strong>{s.courseCode&&<span style={{color:'#888',fontSize:12}}> ({s.courseCode})</span>}</td>
                          <td>{s.instructor||'-'}</td><td>{s.room||'-'}{s.building?` / ${s.building}`:''}</td>
                          <td>{s.department||'-'}</td><td>{s.year?`Y${s.year}`:'-'}</td><td>{s.semester?`S${s.semester}`:'-'}</td><td>{s.section||'-'}</td>
                          <td><button className="delete-btn" onClick={() => handleDeleteSchedule(s._id)}>Delete</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                )}
              </div>
            </div>
          )}

          {/* PROFILE */}
          {activeTab === 'profile' && (
            <div className="tab-content">
              <div className="admin-forms single-form">
                <div className="form-section">
                  <h2>👤 Admin Profile</h2>
                  <div style={{marginBottom:20,padding:16,background:'#f0f4ff',borderRadius:10,border:'1px solid #dde8f8'}}>
                    <div style={{fontSize:15,fontWeight:700,color:'#1e3a5f',marginBottom:4}}>{user?.name}</div>
                    <div style={{fontSize:13,color:'#666'}}>{user?.email}</div>
                    <div style={{fontSize:13,color:'#888',marginTop:4}}>Role: <strong>Administrator</strong>&nbsp;|&nbsp;Dept: {user?.department||'-'}</div>
                  </div>
                  {profileMsg && <div className="success-message">{profileMsg}</div>}
                  {profileErr && <div className="error-message">{profileErr}</div>}
                  <form onSubmit={handleProfileUpdate}>
                    <div className="form-group"><label>Update Name</label><input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm,name:e.target.value})} placeholder={user?.name} /></div>
                    <div className="form-group"><label>Update Phone</label><input type="text" value={profileForm.phone} onChange={e => setProfileForm({...profileForm,phone:e.target.value})} placeholder={user?.phone||'+251...'} /></div>
                    <hr style={{margin:'20px 0',border:'none',borderTop:'1px solid #eee'}} />
                    <h4 style={{marginBottom:12,color:'#555'}}>Change Password</h4>
                    <div className="form-group"><label>Current Password</label><input type="password" value={profileForm.currentPassword} onChange={e => setProfileForm({...profileForm,currentPassword:e.target.value})} placeholder="Current password" /></div>
                    <div className="form-group"><label>New Password</label><input type="password" value={profileForm.newPassword} onChange={e => setProfileForm({...profileForm,newPassword:e.target.value})} placeholder="New password" /></div>
                    <button type="submit" className="submit-btn" disabled={profileLoading}>{profileLoading?'Saving...':'💾 Save Changes'}</button>
                  </form>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODALS */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal==='student'?'🎓 Add Student':'👩‍🏫 Add Teacher'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            {error && <div className="error-message" style={{marginBottom:12}}>{error}</div>}

            {modal === 'student' && (
              <form onSubmit={handleStudentSubmit}>
                <div className="form-group"><label>Full Name *</label><input type="text" value={studentForm.name} onChange={e => setStudentForm({...studentForm,name:e.target.value})} placeholder="e.g. Abebe Kebede" required /></div>
                <div className="form-group"><label>Student ID *</label><input type="text" value={studentForm.studentId} onChange={e => setStudentForm({...studentForm,studentId:e.target.value})} placeholder="e.g. BDU2024001" required /></div>
                <div className="form-group"><label>Email *</label><input type="email" value={studentForm.email} onChange={e => setStudentForm({...studentForm,email:e.target.value})} placeholder="student@bdu.edu.et" required /></div>
                <div className="form-group"><label>Department *</label><input type="text" value={studentForm.department} onChange={e => setStudentForm({...studentForm,department:e.target.value})} placeholder="e.g. Computer Science" required /></div>
                <div className="modal-row">
                  <div className="form-group"><label>Batch / Year *</label><input type="number" value={studentForm.year} onChange={e => setStudentForm({...studentForm,year:e.target.value})} placeholder="e.g. 3" min="1" max="6" required /></div>
                  <div className="form-group"><label>Section</label><input type="text" value={studentForm.section} onChange={e => setStudentForm({...studentForm,section:e.target.value})} placeholder="e.g. A" /></div>
                </div>
                <div className="form-group"><label>Phone</label><input type="text" value={studentForm.phone} onChange={e => setStudentForm({...studentForm,phone:e.target.value})} placeholder="+251..." /></div>
                <p className="modal-hint">Initial password = Student ID</p>
                <button type="submit" className="submit-btn" disabled={studentLoading}>{studentLoading?'Adding...':'Add Student'}</button>
              </form>
            )}

            {modal === 'teacher' && (
              <form onSubmit={handleTeacherSubmit}>
                <div className="form-group"><label>Full Name *</label><input type="text" value={teacherForm.name} onChange={e => setTeacherForm({...teacherForm,name:e.target.value})} placeholder="e.g. Dr. Solomon Tadesse" required /></div>
                <div className="form-group"><label>Employee ID *</label><input type="text" value={teacherForm.employeeId} onChange={e => setTeacherForm({...teacherForm,employeeId:e.target.value})} placeholder="e.g. TG001234" required /></div>
                <div className="form-group"><label>Email *</label><input type="email" value={teacherForm.email} onChange={e => setTeacherForm({...teacherForm,email:e.target.value})} placeholder="teacher@bdu.edu.et" required /></div>
                <div className="form-group"><label>Primary Department *</label><input type="text" value={teacherForm.department} onChange={e => setTeacherForm({...teacherForm,department:e.target.value})} placeholder="e.g. Computer Science" required /></div>
                <div className="form-group"><label>All Departments <span className="hint-text">(comma-separated)</span></label><input type="text" value={teacherForm.departments} onChange={e => setTeacherForm({...teacherForm,departments:e.target.value})} placeholder="e.g. Computer Science, Software Engineering" /></div>
                <div className="form-group"><label>Batches / Years <span className="hint-text">(comma-separated)</span></label><input type="text" value={teacherForm.batches} onChange={e => setTeacherForm({...teacherForm,batches:e.target.value})} placeholder="e.g. 1, 2, 3" /></div>
                <div className="form-group"><label>Sections <span className="hint-text">(comma-separated)</span></label><input type="text" value={teacherForm.sections} onChange={e => setTeacherForm({...teacherForm,sections:e.target.value})} placeholder="e.g. A, B, C" /></div>
                <div className="form-group"><label>Phone</label><input type="text" value={teacherForm.phone} onChange={e => setTeacherForm({...teacherForm,phone:e.target.value})} placeholder="+251..." /></div>
                <p className="modal-hint">Initial password = Employee ID</p>
                <button type="submit" className="submit-btn" disabled={teacherLoading}>{teacherLoading?'Adding...':'Add Teacher'}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
