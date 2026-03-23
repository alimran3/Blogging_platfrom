import api from './api';

export const commentService = {
  getComments: async (blogId, params = {}) => {
    const response = await api.get(`/comments/blog/${blogId}`, { params });
    return response.data;
  },

  createComment: async (blogId, data) => {
    const response = await api.post(`/comments/blog/${blogId}`, data);
    return response.data;
  },

  updateComment: async (id, content) => {
    const response = await api.put(`/comments/${id}`, { content });
    return response.data;
  },

  deleteComment: async (id) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },

  likeComment: async (id) => {
    const response = await api.post(`/comments/${id}/like`);
    return response.data;
  }
};