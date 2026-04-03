import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          Smart<span>BDU</span>
        </div>
        <ul className="nav-menu">
          <li className="nav-item">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/schedule" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/></svg>
              <span>Schedule</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/announcements" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
              <span>Announcements</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/courses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>
              <span>Courses</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/services" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/></svg>
              <span>Campus Services</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/directory" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              <span>Directory</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/ai-assistant" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 11.5v-1c0-.8-.7-1.5-1.5-1.5H16V6h-3v1.5h3.5v1h-3.5v1H9v1.5h3V13H5v1.5h3.5v1H5v1.5h3.5c.8 0 1.5-.7 1.5-1.5v-1c0-.8-.7-1.5-1.5-1.5H9v-1.5h3v-1H9c-.8 0-1.5.7-1.5 1.5v1c0 .8.7 1.5 1.5 1.5h9c.8 0 1.5-.7 1.5-1.5zM7.5 18c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm9 0c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>
              <span>AI Assistant</span>
            </NavLink>
          </li>
          {user?.role === 'admin' && (
            <li className="nav-item">
              <NavLink to="admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                <span>Admin</span>
              </NavLink>
            </li>
          )}
        </ul>
      </aside>
      <main className="main-content">
        <header className="header">
          <h1>Welcome, {user?.name || 'Student'}</h1>
          <div className="user-info">
            <div className="user-avatar">{getInitials(user?.name)}</div>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
