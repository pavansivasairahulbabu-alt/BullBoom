import api from './api.js';

export const positionService = {
  async getPositions() {
    const response = await api.get('/positions');
    return response.data;
  },

  async getPositionById(id) {
    const response = await api.get(`/positions/${id}`);
    return response.data;
  },

  async createPosition(data) {
    const response = await api.post('/positions', data);
    return response.data;
  },

  async updatePosition(id, data) {
    const response = await api.put(`/positions/${id}`, data);
    return response.data;
  },

  async deletePosition(id) {
    const response = await api.delete(`/positions/${id}`);
    return response.data;
  }
};