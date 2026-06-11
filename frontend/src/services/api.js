import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          toast.error('Unauthorized. Please login again.');
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          toast.error('Forbidden. You do not have permission to access this resource.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 500:
          toast.error('Internal server error. Please try again later.');
          break;
        default:
          toast.error(error.response.data.message || 'An error occurred.');
      }
    } else if (error.request) {
      toast.error('No response from server. Please check your connection.');
    } else {
      toast.error('Error setting up request.');
    }
    return Promise.reject(error);
  }
);

// Education API functions
export const educationApi = {
  getDashboard: () => api.get('/education/dashboard'),
  getCategories: () => api.get('/education/categories'),
  getCategory: (id) => api.get(`/education/category/${id}`),
  getTopic: (id) => api.get(`/education/topic/${id}`),
  markTopicComplete: (topicId) => api.post('/education/topic/complete', { topicId }),
  getQuizByCategory: (categoryId) => api.get(`/education/quiz/${categoryId}`),
  submitQuiz: (data) => api.post('/education/quiz/submit', data),
  getProgress: () => api.get('/education/progress'),
  getStats: () => api.get('/education/stats'),
  getLeaderboard: () => api.get('/education/leaderboard'),
};

export default api;
