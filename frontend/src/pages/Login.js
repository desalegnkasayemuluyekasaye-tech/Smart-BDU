import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const Login = () => {
  const location = useLocation();
  const campus = location.state?.campus || null;

  const [userId, setUserId] = useState('');
  const [password, setPassword]   = useState('');
  const [remember, setRemember]   = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const { login }    = useAuth();
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login({ id: userId, password });
      if (data.token) {
        login(data, data.token);
        const role = data.role || data.user?.role || 'student';
        if (role === 'admin') navigate('/admin');
        else if (role === 'lecturer') navigate('/lecturer');
        else navigate('/app');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="login-wrapper">
      <div className="login-outer">
        {campus && (
          <div className="login-campus-banner" style={{ backgroundImage: `url(${campus.image})` }}>
            <div className="login-campus-overlay"></div>
            <h2 className="login-campus-title">{campus.name} Login</h2>
          </div>
        )}

        <div className="login-box">
          {!campus && (
            <div className="auth-logo">
              <h2>Smart<span>BDU</span></h2>
              <p>Smart Campus for Bahir Dar University</p>
            </div>
          )}

          {error && (
            <div className="login-error">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label className="login-label">
                <svg viewBox="0 0 24 24" fill="currentColor" className="login-field-icon">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
                Student/Lecturer ID
              </label>
              <input
                type="text"
                className="login-input"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter ID (e.g., BDU160129 or TG123456)"
                required
              />
            </div>

            <div className="login-field">
              <label className="login-label">
                <svg viewBox="0 0 24 24" fill="currentColor" className="login-field-icon">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
                Password
              </label>
              <input
                type="password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                required
              />
              <div className="login-forgot">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <label className="login-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember Me
            </label>
          </form>

          <p className="login-back">
            <Link to="/campus">← Change Campus</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
