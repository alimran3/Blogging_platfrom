import api from './api';

export const userService = {
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  getActiveUsers: async (limit = 10) => {
    const response = await api.get('/users/active', { params: { limit } });
    return response.data;
  },

  followUser: async (id) => {
    const response = await api.post(`/users/${id}/follow`);
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  updateAvatar: async (formData) => {
    const response = await api.put('/users/avatar', formData);
    return response.data;
  },

  updateCover: async (formData) => {
    const response = await api.put('/users/cover', formData);
    return response.data;
  }
};