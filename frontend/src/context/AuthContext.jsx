import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('vaxcare_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('vaxcare_token');
      const storedUser = localStorage.getItem('vaxcare_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);

          // Verify token validity by calling /auth/me
          const response = await authAPI.getProfile();
          if (response.success && response.user) {
            setUser(response.user);
            localStorage.setItem('vaxcare_user', JSON.stringify(response.user));
          }
        } catch (error) {
          console.warn('Session expired or invalid token:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    if (response.success && response.token) {
      localStorage.setItem('vaxcare_token', response.token);
      localStorage.setItem('vaxcare_user', JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
      return response.user;
    }
    throw new Error(response.message || 'Login failed');
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    if (response.success && response.token) {
      localStorage.setItem('vaxcare_token', response.token);
      localStorage.setItem('vaxcare_user', JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
      return response.user;
    }
    throw new Error(response.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('vaxcare_token');
    localStorage.removeItem('vaxcare_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.getProfile();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('vaxcare_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.error('Error refreshing user profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
