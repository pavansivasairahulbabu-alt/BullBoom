import api from './api.js';

export const educationService = {
  async getDashboard() {
    const response = await api.get('/education/dashboard');
    return response.data;
  },

  async getCategories() {
    const response = await api.get('/education/categories');
    return response.data;
  },

  async getCategory(id) {
    const response = await api.get(`/education/category/${id}`);
    return response.data;
  },

  async getTopic(id) {
    const response = await api.get(`/education/topic/${id}`);
    return response.data;
  },

  async markTopicComplete(topicId) {
    const response = await api.post('/education/topic/complete', { topicId });
    return response.data;
  },

  async getQuizByCategory(categoryId) {
    const response = await api.get(`/education/quiz/${categoryId}`);
    return response.data;
  },

  async submitQuiz(data) {
    const response = await api.post('/education/quiz/submit', data);
    return response.data;
  },

  async getProgress() {
    const response = await api.get('/education/progress');
    return response.data;
  },

  async getStats() {
    const response = await api.get('/education/stats');
    return response.data;
  },

  async getLeaderboard() {
    const response = await api.get('/education/leaderboard');
    return response.data;
  }
};
