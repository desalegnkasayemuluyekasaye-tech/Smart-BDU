import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem('smartbdu_user');
      const token = localStorage.getItem('smartbdu_token');
      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);
        try {
          const profile = await authService.getProfile();
          if (profile._id) {
            setUser(profile);
            localStorage.setItem('smartbdu_user', JSON.stringify(profile));
          } else {
            setUser(parsedUser);
          }
        } catch (e) {
          setUser(parsedUser);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('smartbdu_token', token);
    localStorage.setItem('smartbdu_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('smartbdu_token');
    localStorage.removeItem('smartbdu_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
