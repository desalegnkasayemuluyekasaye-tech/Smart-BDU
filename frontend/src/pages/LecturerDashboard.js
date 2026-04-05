import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseService, fileService, announcementService, scheduleService, assignmentService, API_URL } from '../services/api';
import { DEPARTMENTS } from '../constants';
import FloatingAI from '../components/FloatingAI';
import './Admin.css';

const SIDEBAR_NAV = [
  { id: 'dashboard',     icon: '🏠', label: 'Dashboard' },
  { id: 'courses',       icon: '📚', label: 'My Courses' },
  { id: 'materials',     icon: '📤', label: 'Upload Materials' },
  { id: 'assignments',   icon: '📝', label: 'Assignments' },
  { id: 'submissions',   icon: '📥', label: 'Review Submissions' },
  { id: 'enrollments',   icon: '👥', label: 'Enrollments' },
  { id: 'announcements', icon: '📢', label: 'Announcements' },
  { id: 'schedule',      icon: '📅', label: 'Schedule' },
];

const EMPTY_ANN = { title: '', content: '', category: 'general', priority: 'normal', targetType: 'section', department: '', batch: '', section: '' };
const EMPTY_ASSIGN = { title: '', description: '', department: '', year: '', semester: '1', section: '', dueDate: '', dueTime: '', points: '', instructions: '', courseCode: '' };
const EMPTY_MAT = { title: '', description: '', department: '', year: '', semester: '', section: '', courseCode: '', category: 'lecture', linkCourseId: '', url: '' };

const DEPARTMENTS = [
  'Computer Science',
  'Software Engineering',
  'Information Technology',
  'Information Systems',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Business Administration',
  'Accounting',
  'Economics',
  'Management',
  'Law',
  'Medicine',
  'Nursing',
  'Pharmacy'
];

const LecturerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [profileOpen, setProfileOpen] = useState(false);

  // Stats / Data
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [myFiles, setMyFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);

  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);

  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);

  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);

  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  const [pendingStudents, setPendingStudents] = useState([]);
  const [pendingStudentsLoading, setPendingStudentsLoading] = useState(false);

  // Forms
  const [matForm, setMatForm] = useState(EMPTY_MAT);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [annForm, setAnnForm] = useState(EMPTY_ANN);
  const [announcementLoading, setAnnouncementLoading] = useState(false);

  const [assignForm, setAssignForm] = useState(EMPTY_ASSIGN);
  const [assignSubmitLoading, setAssignSubmitLoading] = useState(false);
  const [assignUploadFile, setAssignUploadFile] = useState(null);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchCourses();
      fetchFiles();
      fetchAnnouncements();
      fetchSchedules();
      fetchMyAssignments();
      fetchSubmissions();
    } else if (activeTab === 'courses') fetchCourses();
    else if (activeTab === 'materials') { fetchCourses(); fetchFiles(); }
    else if (activeTab === 'assignments') {
      (async () => {
        setCoursesLoading(true);
        setAssignmentsLoading(true);
        try {
          const courseList = await courseService.getMyCourses();
          const list = Array.isArray(courseList) ? courseList : [];
          setCourses(list);
          const all = await assignmentService.getAll();
          const arr = Array.isArray(all) ? all : [];
          const ids = new Set(list.map(c => (c._id != null ? String(c._id) : '')).filter(Boolean));
          const codes = new Set(list.map(c => (c.code || '').toUpperCase()).filter(Boolean));
          setAssignments(arr.filter(a => {
            const raw = a.course;
            const cid = raw && typeof raw === 'object' && raw._id != null
              ? String(raw._id)
              : (raw != null ? String(raw) : '');
            if (cid && ids.has(cid)) return true;
            const code = (a.courseCode || '').toUpperCase();
            return code && codes.has(code);
          }));
        } catch (e) {
          console.error(e);
        }
        setCoursesLoading(false);
        setAssignmentsLoading(false);
      })();
    }
    else if (activeTab === 'announcements') fetchAnnouncements();
    else if (activeTab === 'submissions') {
      fetchSubmissions();
    }
    else if (activeTab === 'enrollments') {
      fetchEnrollments();
    }
    setMessage(''); setError('');
  }, [activeTab]);

  const fetchEnrollments = async () => {
    setPendingStudentsLoading(true);
    try {
      const myCourses = await courseService.getMyCourses();
      const list = Array.isArray(myCourses) ? myCourses : [];
      
      const allPending = [];
      for (const course of list) {
        if (course.enrolledStudents) {
          const pending = course.enrolledStudents
            .filter(s => s.status === 'pending')
            .map(s => ({
              ...s,
              courseId: course._id,
              courseName: course.name,
              courseCode: course.code
            }));
          allPending.push(...pending);
        }
      }
      
      // Since studentId is an object (populated), we'll try to get more details if needed
      // but for now we'll assume the model has the details or we fetch them
      setPendingStudents(allPending);
    } catch (e) {
      console.error(e);
      setError('Failed to load enrollments');
    }
    setPendingStudentsLoading(false);
  };

  const handleAcceptStudent = async (courseId, studentId) => {
    try {
      await courseService.acceptStudent(courseId, studentId);
      setMessage('Student accepted into course');
      fetchEnrollments();
    } catch (err) {
      setError(err.message || 'Failed to accept student');
    }
  };

  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const list = await courseService.getMyCourses();
      setCourses(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
    }
    setCoursesLoading(false);
  };

  const fetchFiles = async () => { setFilesLoading(true); try { const d = await fileService.getMyFiles(); setMyFiles(d.files || d || []); } catch (e) { console.error(e); } setFilesLoading(false); };
  const fetchAnnouncements = async () => { setAnnouncementsLoading(true); try { const d = await announcementService.getAll({ limit: 50 }); setAnnouncements(d.announcements || d || []); } catch (e) { console.error(e); } setAnnouncementsLoading(false); };

  const fetchSchedules = async () => {
    setSchedulesLoading(true);
    try {
      const list = await scheduleService.getMine();
      setSchedules(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
    }
    setSchedulesLoading(false);
  };

  const fetchMyAssignments = async () => {
    setAssignmentsLoading(true);
    try {
      const assignments = await assignmentService.getMyCreated();
      setAssignments(Array.isArray(assignments) ? assignments : []);
    } catch (e) {
      console.error(e);
    }
    setAssignmentsLoading(false);
  };

  const fetchSubmissions = async () => {
    setSubmissionsLoading(true);
    try {
      const all = await assignmentService.getAll();
      const arr = Array.isArray(all) ? all : [];
      // Filter for submitted assignments from lecturer's courses
      const mine = await courseService.getMyCourses().catch(() => []);
      const courseList = Array.isArray(mine) ? mine : [];
      const ids = new Set(courseList.map(c => (c._id != null ? String(c._id) : '')).filter(Boolean));
      const codes = new Set(courseList.map(c => (c.code || '').toUpperCase()).filter(Boolean));
      
      const submittedAssignments = arr.filter(a => {
        const raw = a.course;
        const cid = raw && typeof raw === 'object' && raw._id != null
          ? String(raw._id)
          : (raw != null ? String(raw) : '');
        const isMyCourse = (cid && ids.has(cid)) || ((a.courseCode || '').toUpperCase() && codes.has((a.courseCode || '').toUpperCase()));
        return isMyCourse && a.status === 'submitted';
      });
      
      setSubmissions(submittedAssignments);
    } catch (e) {
      console.error(e);
    }
    setSubmissionsLoading(false);
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const switchTab = (id) => { setActiveTab(id); setMenuOpen(false); };

  const handleMaterialUpload = async (e) => {
    e.preventDefault();
    const urlOnly = !uploadFile && (matForm.url || '').trim();

    if (urlOnly) {
      if (!matForm.title?.trim() || !matForm.linkCourseId) {
        toast.error('Title and a course are required to add a link');
        return;
      }
    } else {
      if (!matForm.title || !matForm.department || !matForm.year || !matForm.semester) {
        toast.error('Title, Department, Year, and Semester are required');
        return;
      }
      if (!uploadFile && !matForm.url) { toast.error('Attach a file or provide a URL link'); return; }
    }

    setUploading(true);
    try {
      if (uploadFile) {
        const fd = new FormData();
        fd.append('file', uploadFile); fd.append('title', matForm.title);
        fd.append('description', matForm.description); fd.append('courseCode', matForm.courseCode);
        fd.append('department', matForm.department); fd.append('year', matForm.year);
        fd.append('semester', matForm.semester); fd.append('section', matForm.section);
        fd.append('category', matForm.category);

        const res = await fileService.upload(fd);
        const linkCourseId = matForm.linkCourseId;
        if (res.success || res.file?._id) {
          let msg = `File uploaded for ${matForm.department} Year ${matForm.year} Sem ${matForm.semester} Section ${matForm.section || 'All'}`;
          if (linkCourseId && res.file?._id) {
            const downloadUrl = `${API_URL}/files/download/${res.file._id}`;
            await courseService.addMaterial(linkCourseId, {
              title: matForm.title,
              url: downloadUrl,
              type: 'pdf',
            });
            msg += ' — linked to course materials.';
          }
          toast.success(msg);
          setUploadFile(null); setMatForm(EMPTY_MAT);
          fetchFiles();
          if (linkCourseId) fetchCourses();
        } else { toast.error(res.message || 'Upload failed'); }
      } else if (urlOnly) {
        await courseService.addMaterial(matForm.linkCourseId, {
          title: matForm.title.trim(),
          url: matForm.url.trim(),
          type: 'link',
        });
        toast.success('Link added to course materials.');
        setMatForm(EMPTY_MAT);
        fetchCourses();
      }
    } catch (err) { toast.error(err.message || 'Failed to upload'); }
    setUploading(false);
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault(); setAnnouncementLoading(true);
    try {
      await announcementService.createAnnouncement({ ...annForm, department: annForm.department || user?.department });
      toast.success('Announcement posted successfully!');
      setAnnForm(EMPTY_ANN);
      fetchAnnouncements();
    } catch (err) { toast.error(err.message || 'Failed to post announcement'); }
    setAnnouncementLoading(false);
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try { await announcementService.deleteAnnouncement(id); toast.success('Announcement deleted'); fetchAnnouncements(); } catch (err) { toast.error(err.message || 'Failed'); }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!assignForm.title?.trim() || !assignForm.department || !assignForm.year || !assignForm.semester || !assignForm.dueDate) {
      toast.error('Title, department, year, semester, and due date are required');
      return;
    }
    setAssignSubmitLoading(true);
    try {
      let fileId = null;
      
      if (assignUploadFile) {
        const fd = new FormData();
        fd.append('file', assignUploadFile);
        fd.append('title', assignForm.title.trim() + ' - Attachment');
        fd.append('description', 'Assignment attachment');
        fd.append('courseCode', assignForm.courseCode || 'ASSIGNMENT');
        fd.append('department', assignForm.department);
        fd.append('year', assignForm.year);
        fd.append('semester', assignForm.semester);
        fd.append('section', assignForm.section || '');
        fd.append('category', 'assignment');
        
        const uploadRes = await fileService.upload(fd);
        if (uploadRes.success && uploadRes.file) {
          fileId = uploadRes.file._id;
        }
      }
      
      await assignmentService.create({
        title: assignForm.title.trim(),
        description: assignForm.description || undefined,
        course: assignForm.courseId,
        courseName: c.name,
        courseCode: c.code,
        department: c.department,
        year: c.year,
        section: c.section,
        dueDate: new Date(assignForm.dueDate),
        dueTime: assignForm.dueTime || undefined,
        points: assignForm.points ? parseInt(assignForm.points, 10) : undefined,
        instructions: assignForm.instructions || undefined,
        courseCode: assignForm.courseCode || undefined,
        attachments: fileId ? [fileId] : undefined,
      });
      toast.success('Assignment created and sent to targeted students.');
      setAssignForm(EMPTY_ASSIGN);
      setAssignUploadFile(null);
      fetchMyAssignments();
    } catch (err) {
      toast.error(err.message || 'Failed to create assignment');
    }
    setAssignSubmitLoading(false);
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await assignmentService.delete(id);
      toast.success('Assignment deleted');
      fetchMyAssignments();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleReviewSubmission = async (id, accepted, feedback = '') => {
    try {
      await assignmentService.review(id, { accepted, feedback });
      toast.success(`Submission ${accepted ? 'accepted' : 'rejected'}`);
      fetchSubmissions();
    } catch (err) {
      toast.error(err.message || 'Failed to review submission');
    }
  };

  const pageTitle = SIDEBAR_NAV.find(n => n.id === activeTab)?.label || 'Lecturer';
  if (user?.role !== 'lecturer') return <div className="admin-access-denied">Access denied. Lecturer privileges required.</div>;

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header"></div>
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
          <div className="admin-header-left">
            <button className="admin-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              <span /><span /><span />
            </button>
            <button type="button" className="home-btn" onClick={() => navigate('/')} title="Back to Home" aria-label="Back to Home">
              ← Home
            </button>
            <span className="admin-header-brand"><img src="/logo.png" alt="SmartBDU" className="admin-header-logo-img" /></span>
          </div>

          <h1 className="admin-header-title">{pageTitle}</h1>

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
                      <div className="admin-profile-role">Lecturer · {user?.department}</div>
                    </div>
                  </div>
                  <hr className="admin-profile-divider" />
                  <button className="admin-profile-action logout" onClick={handleLogout}>🚪 Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="admin-content">

          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="tab-content">
              <div className="admin-quick-actions" style={{marginBottom:24}}>
                <h3>Quick Actions</h3>
                <div className="admin-quick-grid">
                  <button className="admin-quick-btn" onClick={() => switchTab('courses')}>📚 View Assigned Courses</button>
                  <button className="admin-quick-btn" onClick={() => switchTab('materials')}>📤 Upload File</button>
                  <button className="admin-quick-btn" onClick={() => switchTab('assignments')}>📝 Assignments</button>
                  <button className="admin-quick-btn" onClick={() => switchTab('submissions')}>📥 Review Submissions</button>
                  <button className="admin-quick-btn" onClick={() => switchTab('enrollments')}>👥 View Enrollments</button>
                  <button className="admin-quick-btn" onClick={() => switchTab('announcements')}>📢 Post Announcement</button>
                  <button className="admin-quick-btn" onClick={() => switchTab('schedule')}>📅 View Schedule</button>
                </div>
              </div>
              <div className="admin-stats-grid">
                {[
                  { icon: '📚', val: courses.length, label: 'Assigned Courses', tab: 'courses' },
                  { icon: '📁', val: myFiles.length, label: 'Materials Uploaded', tab: 'materials' },
                  { icon: '📝', val: assignments.length, label: 'Assignments', tab: 'assignments' },
                  { icon: '📥', val: submissions.length, label: 'Pending Reviews', tab: 'submissions' },
                  { icon: '👥', val: pendingStudents.length, label: 'Enrollments', tab: 'enrollments' },
                  { icon: '📢', val: announcements.length, label: 'Announcements', tab: 'announcements' },
                  { icon: '📅', val: schedules.length, label: 'Scheduled Classes', tab: 'schedule' },
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

          {/* COURSES */}
          {activeTab === 'courses' && (
            <div className="tab-content">
              <div className="data-section">
                <div className="section-header"><h2>📚 Courses Assigned by Admin ({courses.length})</h2><button onClick={fetchCourses} className="refresh-btn" disabled={coursesLoading}>Refresh</button></div>
                {coursesLoading ? <div className="loading">Loading...</div> : (
                  <div className="data-table"><table>
                    <thead><tr><th>Code</th><th>Title</th><th>Department</th><th>Year/Sem</th><th>Section</th><th>Credits</th><th>Materials</th></tr></thead>
                    <tbody>
                      {courses.length === 0 ? <tr><td colSpan={7} style={{textAlign:'center',color:'#999',padding:20}}>No courses assigned yet. Contact your administrator.</td></tr>
                        : courses.map(c => (
                          <tr key={c._id}>
                            <td><strong>{c.code}</strong></td><td>{c.name}</td><td>{c.department}</td>
                            <td>Y{c.year}/S{c.semester}</td><td>{c.section||'All'}</td><td>{c.credits}</td>
                            <td>📁 {c.materials?.length||0}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table></div>
                )}
              </div>
            </div>
          )}

          {/* UPLOAD MATERIALS */}
          {activeTab === 'materials' && (
            <div className="tab-content">
              <div className="admin-forms single-form">
                <div className="form-section">
                  <h2>📤 Upload Material</h2>
                  <p style={{fontSize:13,color:'#666',marginBottom:20}}>Upload files for a specific batch, department, semester, and section.</p>
                  <form onSubmit={handleMaterialUpload}>
                    <div className="form-group"><label>Title *</label><input type="text" value={matForm.title} onChange={e => setMatForm({...matForm,title:e.target.value})} placeholder="e.g. Chapter 1 Notes" required /></div>
                    <div className="form-group"><label>Description</label><textarea value={matForm.description} onChange={e => setMatForm({...matForm,description:e.target.value})} rows={2} /></div>
                    
                    <div className="course-header-row" style={{marginTop:16}}>
                      <div className="form-group">
                        <label>Department *</label>
                        <select 
                          className="form-control" 
                          value={matForm.department} 
                          onChange={e => setMatForm({...matForm,department:e.target.value})} 
                          required
                        >
                          <option value="">Select Department</option>
                          {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                        </select>
                      </div>
                      <div className="form-group"><label>Year / Batch *</label><input type="number" value={matForm.year} onChange={e => setMatForm({...matForm,year:e.target.value})} placeholder="e.g. 3" min="1" max="6" required /></div>
                    </div>
                    <div className="course-header-row">
                      <div className="form-group"><label>Semester *</label><input type="number" value={matForm.semester} onChange={e => setMatForm({...matForm,semester:e.target.value})} placeholder="1 or 2" min="1" max="2" required /></div>
                      <div className="form-group"><label>Section</label><input type="text" value={matForm.section} onChange={e => setMatForm({...matForm,section:e.target.value})} placeholder="e.g. A" /></div>
                    </div>

                    <div className="course-header-row" style={{marginTop:16}}>
                      <div className="form-group"><label>Course Code (optional)</label><input type="text" value={matForm.courseCode} onChange={e => setMatForm({...matForm,courseCode:e.target.value})} placeholder="e.g. CSE301" /></div>
                      <div className="form-group"><label>Category</label>
                        <select value={matForm.category} onChange={e => setMatForm({...matForm,category:e.target.value})}>
                          <option value="lecture">Lecture Note</option><option value="assignment">Assignment</option><option value="exam">Past Exam</option><option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group" style={{marginTop:16}}>
                      <label>Add to course materials (optional)</label>
                      <select value={matForm.linkCourseId} onChange={e => setMatForm({ ...matForm, linkCourseId: e.target.value })}>
                        <option value="">— Not linked to a course —</option>
                        {courses.map(c => (
                          <option key={c._id} value={c._id}>{c.code} — {c.name}</option>
                        ))}
                      </select>
                      <p style={{ fontSize: 12, color: '#666', marginTop: 6 }}>Links the upload or URL to this course&apos;s material list for students.</p>
                    </div>

                    <div className="form-group">
                      <label>Material URL (optional — link-only, no file)</label>
                      <input type="url" value={matForm.url} onChange={e => setMatForm({ ...matForm, url: e.target.value })} placeholder="https://..." />
                    </div>

                    <div className="course-header-row" style={{marginTop:16}}>
                      <div className="form-group"><label>Upload File (Max 50MB)</label>
                        <input type="file" onChange={e => setUploadFile(e.target.files[0] || null)} accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar" />
                        {uploadFile && <div style={{fontSize:12,color:'#1565c0',marginTop:4,fontWeight:600}}>📎 {uploadFile.name}</div>}
                      </div>
                    </div>

                    <div className="ann-target-preview" style={{marginTop:12}}>
                      📤 Sending to: <strong>
                        {matForm.department || 'Department'} · Year {matForm.year || '?' } · Sem {matForm.semester || '?' } {matForm.section ? ` · Sec ${matForm.section}` : '· All Sections'}
                      </strong>
                    </div>

                    <button type="submit" className="submit-btn" disabled={uploading} style={{maxWidth:280,marginTop:16}}>{uploading ? 'Working...' : '📤 Save / upload'}</button>
                  </form>
                </div>
              </div>

              <div className="data-section">
                <div className="section-header"><h2>📁 My Uploaded Files ({myFiles.length})</h2><button onClick={fetchFiles} className="refresh-btn" disabled={filesLoading}>Refresh</button></div>
                {filesLoading ? <div className="loading">Loading...</div> : (
                  <div className="data-table"><table>
                    <thead><tr><th>Title</th><th>Course</th><th>Dept</th><th>Year</th><th>Sem</th><th>Sec</th><th>Date</th><th>Action</th></tr></thead>
                    <tbody>
                      {myFiles.length === 0 ? <tr><td colSpan={8} style={{textAlign:'center',color:'#999',padding:20}}>No files uploaded yet</td></tr>
                        : myFiles.map((f) => (
                          <tr key={f._id || f.fileName}>
                            <td><strong>{f.title}</strong></td><td>{f.courseCode||'-'}</td><td>{f.department}</td>
                            <td>{f.year?`Y${f.year}`:'-'}</td><td>{f.semester?`S${f.semester}`:'-'}</td><td>{f.section||'-'}</td>
                            <td>{new Date(f.createdAt).toLocaleDateString()}</td>
                            <td><button className="lec-btn" onClick={() => fileService.download(f._id)} style={{background:'#e3f0ff',color:'#1565c0',border:'none',padding:'6px 12px',borderRadius:6,cursor:'pointer',fontWeight:600}}>⬇ DL</button></td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table></div>
                )}
              </div>
            </div>
          )}

          {/* ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div className="tab-content">
              <div className="admin-forms single-form">
                <div className="form-section">
                  <h2>Create assignment</h2>
                  <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>Target assignments to specific students by department, year, semester, and section. All matching students will receive this assignment.</p>
                  <form onSubmit={handleAssignmentSubmit}>
                    <div className="course-header-row">
                      <div className="form-group">
                        <label>Department *</label>
                        <select value={assignForm.department} onChange={e => setAssignForm({ ...assignForm, department: e.target.value })} required>
                          <option value="">Select Department</option>
                          {DEPARTMENTS.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Year/Batch *</label>
                        <select value={assignForm.year} onChange={e => setAssignForm({ ...assignForm, year: e.target.value })} required>
                          <option value="">Select Year</option>
                          {[1,2,3,4,5,6].map(year => (
                            <option key={year} value={year}>Year {year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="course-header-row">
                      <div className="form-group">
                        <label>Semester *</label>
                        <select value={assignForm.semester} onChange={e => setAssignForm({ ...assignForm, semester: e.target.value })} required>
                          <option value="1">Semester 1</option>
                          <option value="2">Semester 2</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Section (Optional)</label>
                        <input type="text" value={assignForm.section} onChange={e => setAssignForm({ ...assignForm, section: e.target.value })} placeholder="e.g. A, B, C" />
                      </div>
                    </div>
                    <div className="form-group"><label>Title *</label><input type="text" value={assignForm.title} onChange={e => setAssignForm({ ...assignForm, title: e.target.value })} required /></div>
                    <div className="form-group"><label>Course Code (optional)</label><input type="text" value={assignForm.courseCode} onChange={e => setAssignForm({ ...assignForm, courseCode: e.target.value })} placeholder="e.g. CSE301" /></div>
                    <div className="form-group"><label>Description</label><textarea value={assignForm.description} onChange={e => setAssignForm({ ...assignForm, description: e.target.value })} rows={3} /></div>
                    <div className="course-header-row">
                      <div className="form-group"><label>Due date *</label><input type="date" value={assignForm.dueDate} onChange={e => setAssignForm({ ...assignForm, dueDate: e.target.value })} required /></div>
                      <div className="form-group"><label>Due time</label><input type="time" value={assignForm.dueTime} onChange={e => setAssignForm({ ...assignForm, dueTime: e.target.value })} /></div>
                    </div>
                    <div className="form-group"><label>Points</label><input type="number" min={0} value={assignForm.points} onChange={e => setAssignForm({ ...assignForm, points: e.target.value })} placeholder="e.g. 10" /></div>
                    <div className="form-group"><label>Instructions</label><textarea value={assignForm.instructions} onChange={e => setAssignForm({ ...assignForm, instructions: e.target.value })} rows={2} /></div>
                    <div className="form-group">
                      <label>Attach File (optional)</label>
                      <input type="file" onChange={e => setAssignUploadFile(e.target.files[0] || null)} accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.txt" />
                      {assignUploadFile && <div style={{fontSize:12,color:'#1565c0',marginTop:4,fontWeight:600}}>📎 {assignUploadFile.name}</div>}
                    </div>
                    <button type="submit" className="submit-btn" disabled={assignSubmitLoading}>{assignSubmitLoading ? 'Creating...' : 'Create assignment'}</button>
                  </form>
                </div>
              </div>
              <div className="data-section">
                <div className="section-header">
                  <h2>Your assignments ({assignments.length})</h2>
                  <button type="button" onClick={() => { fetchCourses(); fetchMyAssignments(); }} className="refresh-btn" disabled={assignmentsLoading || coursesLoading}>Refresh</button>
                </div>
                {assignmentsLoading || coursesLoading ? <div className="loading">Loading...</div> : (
                  <div className="data-table"><table>
                    <thead><tr><th>Title</th><th>Target</th><th>Due</th><th>Points</th><th>Submissions</th><th>Action</th></tr></thead>
                    <tbody>
                      {assignments.length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign: 'center', color: '#999', padding: 20 }}>No assignments created yet</td></tr>
                      ) : assignments.map(a => (
                        <tr key={a._id}>
                          <td><strong>{a.title}</strong></td>
                          <td>
                            {a.department}<br />
                            <small style={{ color: '#888' }}>
                              Year {a.year}, Sem {a.semester}{a.section ? `, Sec ${a.section}` : ''}
                            </small>
                          </td>
                          <td>{a.dueDate ? new Date(a.dueDate).toLocaleString() : '—'}</td>
                          <td>{a.points != null ? a.points : '—'}</td>
                          <td><span className={`badge tag-${a.status || 'pending'}`}>{(a.status || 'pending').replace(/_/g, ' ')}</span></td>
                          <td><button type="button" className="delete-btn" onClick={() => handleDeleteAssignment(a._id)}>Delete</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                )}
              </div>
            </div>
          )}

          {/* SUBMISSIONS REVIEW */}
          {activeTab === 'submissions' && (
            <div className="tab-content">
              <div className="data-section">
                <div className="section-header">
                  <h2>📥 Review Submissions ({submissions.length})</h2>
                  <button type="button" onClick={fetchSubmissions} className="refresh-btn" disabled={submissionsLoading}>Refresh</button>
                </div>
                {submissionsLoading ? <div className="loading">Loading...</div> : (
                  <div className="data-table"><table>
                    <thead><tr><th>Assignment</th><th>Student</th><th>Submitted</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {submissions.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', color: '#999', padding: 20 }}>No submissions to review</td></tr>
                      ) : submissions.map(s => (
                        <tr key={s._id}>
                          <td>
                            <strong>{s.title}</strong><br />
                            <small style={{ color: '#888' }}>{s.courseName} ({s.courseCode})</small>
                          </td>
                          <td>
                            {s.submittedBy?.name || 'Unknown Student'}<br />
                            <small style={{ color: '#888' }}>ID: {s.submittedBy?.studentId || s.submittedBy?.employeeId || 'N/A'}</small>
                          </td>
                          <td>{s.submittedAt ? new Date(s.submittedAt).toLocaleString() : '—'}</td>
                          <td>
                            <div style={{ marginBottom: 4 }}>
                              <span className={`badge tag-${s.status || 'pending'}`}>{(s.status || 'pending').replace(/_/g, ' ')}</span>
                            </div>
                            {s.submittedFile && (
                              <button 
                                className="lec-btn" 
                                onClick={() => fileService.download(s.submittedFile._id)}
                                style={{ background: '#e3f2fd', color: '#1565c0', fontSize: 11, padding: '4px 8px' }}
                              >
                                📄 View File
                              </button>
                            )}
                          </td>
                          <td>
                            {s.lecturerAccepted === null ? (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button 
                                  type="button" 
                                  className="lec-btn" 
                                  style={{ background: '#4caf50', color: 'white' }}
                                  onClick={() => handleReviewSubmission(s._id, true)}
                                >
                                  ✓ Accept
                                </button>
                                <button 
                                  type="button" 
                                  className="lec-btn" 
                                  style={{ background: '#f44336', color: 'white' }}
                                  onClick={() => handleReviewSubmission(s._id, false)}
                                >
                                  ✗ Reject
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: s.lecturerAccepted ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
                                {s.lecturerAccepted ? 'Accepted' : 'Rejected'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                )}
              </div>
            </div>
          )}

          {/* ENROLLMENTS */}
          {activeTab === 'enrollments' && (
            <div className="tab-content">
              <div className="data-section">
                <div className="section-header">
                  <h2>👥 Pending Course Enrollments ({pendingStudents.length})</h2>
                  <button type="button" onClick={fetchEnrollments} className="refresh-btn" disabled={pendingStudentsLoading}>Refresh</button>
                </div>
                {pendingStudentsLoading ? <div className="loading">Loading...</div> : (
                  <div className="data-table"><table>
                    <thead><tr><th>Student</th><th>Course</th><th>Date Requested</th><th>Action</th></tr></thead>
                    <tbody>
                      {pendingStudents.length === 0 ? (
                        <tr><td colSpan={4} style={{ textAlign: 'center', color: '#999', padding: 20 }}>No pending enrollments</td></tr>
                      ) : pendingStudents.map((s, idx) => (
                        <tr key={`${s.courseId}-${idx}`}>
                          <td>
                            <strong>{s.studentId?.name || 'Unknown Student'}</strong><br />
                            <small style={{ color: '#888' }}>ID: {s.studentId?.studentId || 'N/A'}</small>
                          </td>
                          <td>
                            {s.courseName}<br />
                            <small style={{ color: '#888' }}>{s.courseCode}</small>
                          </td>
                          <td>{new Date(s.enrolledAt).toLocaleDateString()}</td>
                          <td>
                            <button 
                              type="button" 
                              className="lec-btn" 
                              style={{ background: '#4caf50', color: 'white' }}
                              onClick={() => handleAcceptStudent(s.courseId, s.studentId?._id)}
                            >
                              ✓ Accept Student
                            </button>
                          </td>
                        </tr>
                      ))}
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
                  <p style={{fontSize:13,color:'#666',marginBottom:20}}>Post announcements for a specific batch, department, semester, and section.</p>
                  <form onSubmit={handleAnnouncementSubmit}>
                    <div className="form-group"><label>Title *</label><input type="text" value={annForm.title} onChange={e => setAnnForm({...annForm,title:e.target.value})} required /></div>
                    <div className="form-group"><label>Content *</label><textarea value={annForm.content} onChange={e => setAnnForm({...annForm,content:e.target.value})} rows={4} required /></div>
                    
                    <div className="form-group"><label>Target Audience</label>
                      <select value={annForm.targetType} onChange={e => setAnnForm({...annForm,targetType:e.target.value,department:'',batch:'',section:''})}>
                        <option value="section">🎯 Specific Batch + Dept + Sem + Section</option>
                        <option value="batch">📅 Specific Batch + Dept + Sem</option>
                        <option value="department">🏛 Entire Department</option>
                        <option value="all">🌐 All Students</option>
                      </select>
                    </div>

                    {(annForm.targetType==='department'||annForm.targetType==='batch'||annForm.targetType==='section') && (
                      <div className="form-group">
                        <label>Department *</label>
                        <select 
                          className="form-control" 
                          value={annForm.department} 
                          onChange={e => setAnnForm({...annForm,department:e.target.value})} 
                          required
                        >
                          <option value="">Select Department</option>
                          {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                        </select>
                      </div>
                    )}
                    {(annForm.targetType==='batch'||annForm.targetType==='section') && (
                      <div className="form-group"><label>Batch / Year *</label><input type="text" value={annForm.batch} onChange={e => setAnnForm({...annForm,batch:e.target.value})} placeholder="e.g. 3" required /></div>
                    )}
                    {annForm.targetType==='section' && (
                      <div className="form-group"><label>Section *</label><input type="text" value={annForm.section} onChange={e => setAnnForm({...annForm,section:e.target.value})} placeholder="e.g. A" required /></div>
                    )}

                    <div className="ann-meta-row" style={{marginTop:16}}>
                      <div className="form-group"><label>Category</label>
                        <select value={annForm.category} onChange={e => setAnnForm({...annForm,category:e.target.value})}>
                          <option value="general">General</option><option value="academic">Academic</option><option value="event">Event</option><option value="urgent">Urgent</option>
                        </select>
                      </div>
                      <div className="form-group"><label>Priority</label>
                        <select value={annForm.priority} onChange={e => setAnnForm({...annForm,priority:e.target.value})}>
                          <option value="normal">Normal</option><option value="important">Important</option><option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="ann-target-preview">
                      📣 Sending to: <strong>
                        {annForm.targetType==='all'&&'All Students'}
                        {annForm.targetType==='department'&&(annForm.department||'a department')}
                        {annForm.targetType==='batch'&&`${annForm.department||'dept'} — Year ${annForm.batch||'?'}`}
                        {annForm.targetType==='section'&&`${annForm.department||'dept'} — Y${annForm.batch||'?'} — Sec ${annForm.section||'?'}`}
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
                    <thead><tr><th>Title</th><th>Content</th><th>Category</th><th>Target</th><th>Date</th><th>Action</th></tr></thead>
                    <tbody>
                      {announcements.length===0 ? <tr><td colSpan={6} style={{textAlign:'center',color:'#999',padding:20}}>No announcements</td></tr>
                        : announcements.map(a => (
                          <tr key={a._id}>
                            <td><strong>{a.title}</strong></td>
                            <td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.content}</td>
                            <td><span className={`badge tag-${a.category}`}>{a.category}</span></td>
                            <td style={{fontSize:12,color:'#666'}}>{a.targetType}{a.department?` · ${a.department}`:''}{a.batch?` · Y${a.batch}`:''}{a.section?` · Sec ${a.section}`:''}</td>
                            <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                            {/* We will let Lecturer delete announcements they made, maybe back-end verifies it */}
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
              <div className="data-section">
                <div className="section-header"><h2>📅 Assigned Schedule</h2><button onClick={fetchSchedules} className="refresh-btn" disabled={schedulesLoading}>Refresh</button></div>
                {schedulesLoading ? <div className="loading">Loading...</div> : (
                  <div className="data-table"><table>
                    <thead><tr><th>Day</th><th>Time</th><th>Course</th><th>Dept/Year/Sec</th><th>Room</th></tr></thead>
                    <tbody>
                      {schedules.length === 0 ? <tr><td colSpan={5} style={{textAlign:'center',color:'#999',padding:20}}>No schedules assigned yet</td></tr>
                        : schedules.map((s, i) => (
                        <tr key={i}>
                          <td style={{textTransform:'capitalize',fontWeight:600}}>{s.day}</td>
                          <td><span style={{background:'#e3f0ff',color:'#1565c0',padding:'2px 8px',borderRadius:6,fontSize:12,fontWeight:600}}>{s.startTime} – {s.endTime}</span></td>
                          <td><strong>{s.courseName}</strong><br/><small style={{color:'#888'}}>{s.courseCode}</small></td>
                          <td>{s.department||'-'} | Y{s.year||'-'} | {s.section||'All'}</td>
                          <td>{s.room||'-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
      <FloatingAI />
    </div>
  );
};

export default LecturerDashboard;
