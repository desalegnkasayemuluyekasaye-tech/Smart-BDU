import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Announcements from './pages/Announcements';
import Courses from './pages/Courses';
import Services from './pages/Services';
import Directory from './pages/Directory';
import AIAssistant from './pages/AIAssistant';
import Admin from './pages/Admin';
import Home from './pages/Home';
import CampusSelect from './pages/CampusSelect';
import StudentDashboard from './pages/StudentDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  return user && user.role === 'admin' ? children : <Navigate to="/app" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/campus" element={<CampusSelect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/student" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
          <Route path="/lecturer" element={<PrivateRoute><LecturerDashboard /></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="courses" element={<Courses />} />
            <Route path="services" element={<Services />} />
            <Route path="directory" element={<Directory />} />
            <Route path="ai-assistant" element={<AIAssistant />} />
            <Route path="admin" element={<AdminRoute><Admin /></AdminRoute>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
