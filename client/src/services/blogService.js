import api from './api';

export const blogService = {
  getBlogs: async (params = {}) => {
    const response = await api.get('/blogs', { params });
    return response.data;
  },

  getBlog: async (slug) => {
    const response = await api.get(`/blogs/${slug}`);
    return response.data;
  },

  getTopBlogs: async (limit = 5) => {
    const response = await api.get('/blogs/top', { params: { limit } });
    return response.data;
  },

  getUserBlogs: async (userId, params = {}) => {
    const response = await api.get(`/blogs/user/${userId}`, { params });
    return response.data;
  },

  createBlog: async (formData) => {
    const response = await api.post('/blogs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateBlog: async (id, formData) => {
    const response = await api.put(`/blogs/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteBlog: async (id) => {
    const response = await api.delete(`/blogs/${id}`);
    return response.data;
  },

  likeBlog: async (id) => {
    const response = await api.post(`/blogs/${id}/like`);
    return response.data;
  },

  parseEmbed: async (url) => {
    const response = await api.post('/blogs/parse-embed', { url });
    return response.data;
  }
};