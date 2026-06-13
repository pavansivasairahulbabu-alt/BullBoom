import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL =
  import.meta.env.VITE_API_URL;

console.log("API URL:", API_BASE_URL);

if (!API_BASE_URL) {
  throw new Error("VITE_API_URL not found");
}

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
          localStorage.removeItem('user');
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

// Dashboard API
export const dashboardApi = {
  getDashboard: () => api.get('/user/dashboard')
};

// Auth API
export const authApi = {
  sendOtp: (email) => api.post('/auth/send-otp', { email }),
  verifyOtp: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  sendForgotPasswordOtp: (email) => api.post('/auth/forgot-password', { email }),
  verifyForgotPasswordOtp: (email, otp) => api.post('/auth/verify-forgot-otp', { email, otp }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  validateToken: () => api.get('/auth/validate')
};

// Orders & Trading API
export const orderApi = {
  buy: (data) => api.post('/orders/buy', data),
  sell: (data) => api.post('/orders/sell', data),
  getOrders: () => api.get('/orders'),
  getHistory: () => api.get('/orders/history'),
  getPrice: (symbol) => api.get(`/orders/price/${symbol}`),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status })
};

// Positions API
export const positionApi = {
  getPositions: () => api.get('/positions'),
  getPositionById: (id) => api.get(`/positions/${id}`),
  createPosition: (data) => api.post('/positions', data),
  updatePosition: (id, data) => api.put(`/positions/${id}`, data),
  deletePosition: (id) => api.delete(`/positions/${id}`)
};

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
