import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const myClasses = [
  { icon: '💻', name: 'Mobile App Development', time: '9:00 AM - 10:30 AM', room: 'Lab 3' },
  { icon: '🤖', name: 'AI & Machine Learning',  time: '11:00 AM - 12:30 PM', room: 'Room 204' },
  { icon: '🗄️', name: 'Database Systems',        time: '2:00 PM - 3:30 PM',  room: 'Room 101' },
];

const tasks = [
  { icon: '📝', color: '#e53935', text: 'Grade Assignment 3 — Mobile App', due: 'Due Apr 28' },
  { icon: '📋', color: '#fb8c00', text: 'Submit Exam Questions — AI Course', due: 'Due Apr 25' },
  { icon: '👤', color: '#1565c0', text: 'Advising Session — 5 Students',    due: 'Apr 22' },
];

const quickLinks = [
  { icon: '📊', label: 'Grade Book',       path: '/app' },
  { icon: '📅', label: 'My Schedule',      path: '/app' },
  { icon: '👥', label: 'My Students',      path: '/app/directory' },
  { icon: '📢', label: 'Announcements',    path: '/app/announcements' },
];

const events = [
  { icon: '🎓', name: 'Faculty Meeting',        date: 'Apr 24' },
  { icon: '📖', name: 'Research Seminar',        date: 'Apr 27' },
];

const tabs = [
  { icon: '🏠', label: 'Home' },
  { icon: '📚', label: 'Classes' },
  { icon: '🔔', label: 'Alerts', badge: 3 },
  { icon: '•••', label: 'More' },
];

const LecturerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const handleLogout = () => { logout(); navigate('/'); };

  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'LC';

  return (
    <div className="sd-wrapper">
      <div className="sd-screen">

        {/* HEADER */}
        <div className="sd-header">
          <div className="sd-logo-circle">🎓</div>
          <div className="sd-header-info">
            <h2 className="sd-welcome">Dr. {user?.name?.split(' ').slice(-1)[0] || 'Lecturer'}</h2>
            <p className="sd-meta">{user?.department || 'Software Engineering'} · Lecturer</p>
          </div>
          <button className="sd-avatar sd-avatar-lec" onClick={handleLogout} title="Logout">
            {getInitials(user?.name)}
          </button>
        </div>

        <div className="sd-body">

          {/* TODAY'S CLASSES */}
          <div className="sd-section">
            <div className="sd-section-header sd-blue">
              <span>📅 Today's Classes</span>
              <button className="sd-view-all">View All &rsaquo;</button>
            </div>
            {myClasses.map((c, i) => (
              <div className="sd-row" key={i}>
                <span className="sd-row-icon">{c.icon}</span>
                <div className="sd-row-info">
                  <span className="sd-row-title">{c.name}</span>
                  <span className="sd-row-sub">{c.time} · {c.room}</span>
                </div>
                <span className="sd-row-arrow">›</span>
              </div>
            ))}
          </div>

          {/* PENDING TASKS */}
          <div className="sd-section">
            <div className="sd-section-header sd-purple">
              <span>📌 Pending Tasks</span>
              <button className="sd-view-all">See More &rsaquo;</button>
            </div>
            {tasks.map((t, i) => (
              <div className="sd-row" key={i}>
                <span className="sd-row-icon" style={{ color: t.color }}>{t.icon}</span>
                <span className="sd-row-title" style={{ flex: 1 }}>{t.text}</span>
                <span className="sd-row-date">{t.due}</span>
                <span className="sd-row-arrow">›</span>
              </div>
            ))}
          </div>

          {/* QUICK LINKS */}
          <div className="sd-grid">
            {quickLinks.map((q, i) => (
              <button className="sd-grid-item" key={i} onClick={() => navigate(q.path)}>
                <span className="sd-grid-icon">{q.icon}</span>
                <span className="sd-grid-label">{q.label}</span>
              </button>
            ))}
          </div>

          {/* UPCOMING EVENTS */}
          <div className="sd-section">
            <div className="sd-section-header sd-green">
              <span>📆 Upcoming Events</span>
              <button className="sd-view-all">View All &rsaquo;</button>
            </div>
            {events.map((e, i) => (
              <div className="sd-row" key={i}>
                <span className="sd-row-icon">{e.icon}</span>
                <span className="sd-row-title" style={{ flex: 1 }}>{e.name}</span>
                <span className="sd-row-date">{e.date}</span>
                <span className="sd-row-arrow">›</span>
              </div>
            ))}
          </div>

        </div>

        {/* BOTTOM TAB BAR */}
        <div className="sd-tabbar">
          {tabs.map((t, i) => (
            <button
              key={i}
              className={`sd-tab ${activeTab === i ? 'sd-tab-active' : ''}`}
              onClick={() => setActiveTab(i)}
            >
              <span className="sd-tab-icon">
                {t.icon}
                {t.badge && <span className="sd-badge">{t.badge}</span>}
              </span>
              <span className="sd-tab-label">{t.label}</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};

export default LecturerDashboard;
