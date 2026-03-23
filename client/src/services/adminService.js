import api from './api';

export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  banUser: async (userId, isBanned) => {
    const response = await api.put(`/admin/users/${userId}/ban`, { isBanned });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  getBlogs: async (params = {}) => {
    const response = await api.get('/admin/blogs', { params });
    return response.data;
  },

  deleteBlog: async (blogId) => {
    const response = await api.delete(`/admin/blogs/${blogId}`);
    return response.data;
  },

  getComments: async (params = {}) => {
    const response = await api.get('/admin/comments', { params });
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await api.delete(`/admin/comments/${commentId}`);
    return response.data;
  }
};
