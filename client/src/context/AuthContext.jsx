import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/auth/me');
      const user = response.data.user;
      
      // Normalize user object to use _id
      setUser({
        ...user,
        _id: user._id || user.id
      });
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      // Normalize user object to use _id
      const normalizedUser = {
        ...user,
        _id: user._id || user.id
      };

      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(normalizedUser);
      setIsAuthenticated(true);
      toast.success('Welcome back!');
      navigate('/');

      return { success: true };
    } catch (error) {
      let message = 'Login failed';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;

      // Normalize user object to use _id
      const normalizedUser = {
        ...user,
        _id: user._id || user.id
      };

      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(normalizedUser);
      setIsAuthenticated(true);
      toast.success('Account created successfully!');
      navigate('/');

      return { success: true };
    } catch (error) {
      // Handle validation errors from server
      let message = 'Registration failed';
      if (error.response?.data?.errors) {
        // Show first validation error
        message = error.response.data.errors[0]?.msg || message;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};