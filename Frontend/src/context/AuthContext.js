import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, setAuthToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on page load to persist session
  // Also validate token by fetching current user from backend when possible
  useEffect(() => {
    const init = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
          // Set token header immediately so the validation call has auth
          setAuthToken(storedToken);
          // Try to validate token and get fresh user info from backend
          try {
            const resp = await authAPI.getCurrentUser();
            const fresh = resp.data;
            const userData = {
              id: fresh.id,
              username: fresh.username,
              email: fresh.email,
              role: fresh.role,
              institutionName: fresh.institutionName,
              token: storedToken,
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } catch (err) {
            // Token invalid or request failed; clear stored credentials
            setAuthToken(null);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (e) {
        console.error('Auth init error', e);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password });

      // The backend sends a JwtResponse
      const { token, id, username: userUsername, email, role, institutionName } =
        response.data;

      setAuthToken(token);
      const userData = {
        id,
        username: userUsername,
        email,
        role,
        institutionName,
        token,
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      await authAPI.register(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    // clear the api header and local storage, and reset user state
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // ensure axios default header cleared as well
    try {
      // delete default header if present
      delete require('../services/api').default.defaults.headers.common.Authorization;
    } catch (e) {
      // ignore if module resolution differs at runtime
    }
  };

  const isAdmin = () => !!(user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'));

  const isSuperAdmin = () => !!(user && user.role === 'SUPER_ADMIN');

  const isClerk = () => !!(user && user.role === 'CLERK');

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isAdmin, isSuperAdmin, isClerk, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
