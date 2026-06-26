import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL;

console.log("API URL:", API_BASE_URL);

if (!API_BASE_URL) {
  throw new Error("VITE_API_URL not found");
}

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData, let axios handle it
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          toast.error("Unauthorized. Please login again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          break;
        case 403:
          toast.error(
            "Forbidden. You do not have permission to access this resource.",
          );
          break;
        case 404:
          toast.error("Resource not found.");
          break;
        case 500:
          toast.error("Internal server error. Please try again later.");
          break;
        default:
          toast.error(error.response.data.message || "An error occurred.");
      }
    } else if (error.request) {
      toast.error("No response from server. Please check your connection.");
    } else {
      toast.error("Error setting up request.");
    }
    return Promise.reject(error);
  },
);

// Dashboard API
export const dashboardApi = {
  getDashboard: () => api.get("/user/dashboard").then((res) => res.data),
};

// Auth API
export const authApi = {
  sendOtp: (email) => api.post("/auth/send-otp", { email }),
  verifyOtp: (email, otp) => api.post("/auth/verify-otp", { email, otp }),
  signup: (data) => api.post("/auth/signup", data),
  login: (data) => api.post("/auth/login", data),
  sendForgotPasswordOtp: (email) =>
    api.post("/auth/forgot-password", { email }),
  verifyForgotPasswordOtp: (email, otp) =>
    api.post("/auth/verify-forgot-otp", { email, otp }),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  validateToken: () => api.get("/auth/validate"),
  googleLogin: (token) => api.post("/auth/google", { token }),
};

// Orders & Trading API
export const orderApi = {
  buy: (data) => api.post("/orders/buy", data).then((res) => res.data),
    sell: (data) => api.post("/orders/sell", data).then((res) => res.data),
  createOrder: (data) => api.post("/orders", data).then((res) => res.data),
  getOrders: () => api.get("/orders").then((res) => res.data),
    getHistory: () => api.get("/orders/history").then((res) => res.data),
    createSimulatorHistory: (data) =>
      api.post("/orders/history/simulator", data).then((res) => res.data),
  getPrice: (symbol) =>
    api.get(`/orders/price/${symbol}`).then((res) => res.data),
  deleteOrder: (id) => api.delete(`/orders/${id}`).then((res) => res.data),
  updateStatus: (id, status) =>
    api.put(`/orders/${id}/status`, { status }).then((res) => res.data),
};

// Trigger Orders API
export const triggerOrderApi = {
  createTriggerOrder: (data) => api.post("/trigger-orders", data).then((res) => res.data),
  getTriggerOrders: (status) => api.get("/trigger-orders", { params: { status } }).then((res) => res.data),
  getTriggerOrderById: (id) => api.get(`/trigger-orders/${id}`).then((res) => res.data),
  cancelTriggerOrder: (id) => api.patch(`/trigger-orders/${id}/cancel`).then((res) => res.data),
  deleteTriggerOrder: (id) => api.delete(`/trigger-orders/${id}`).then((res) => res.data),
};

// Positions API
export const positionApi = {
  getPositions: () => api.get("/positions").then((res) => res.data),
  getPositionById: (id) => api.get(`/positions/${id}`).then((res) => res.data),
  createPosition: (data) =>
    api.post("/positions", data).then((res) => res.data),
  updatePosition: (id, data) =>
    api.put(`/positions/${id}`, data).then((res) => res.data),
  deletePosition: (id) =>
    api.delete(`/positions/${id}`).then((res) => res.data),
};

// Watchlist API
export const watchlistApi = {
  getWatchlist: () => api.get("/watchlist").then((res) => res.data),
  addToWatchlist: (data) =>
    api.post("/watchlist/add", data).then((res) => res.data),
  removeFromWatchlist: (id) =>
    api.delete(`/watchlist/${id}`).then((res) => res.data),
};

// User API
export const userApi = {
  getProfile: () => api.get("/user/profile").then((res) => res.data),
  updateProfile: (data) =>
    api.put("/user/profile", data).then((res) => res.data),
  uploadProfileImage: (formData) =>
    api.post("/user/upload-profile", formData).then((res) => res.data),
  deleteAccount: () => api.delete("/user/account").then((res) => res.data),
};

// Education API functions
export const educationApi = {
  getDashboard: () => api.get("/education/dashboard").then((res) => res.data),
  getCategories: () => api.get("/education/categories").then((res) => res.data),
  getCategory: (id) =>
    api.get(`/education/category/${id}`).then((res) => res.data),
  getTopic: (id) => api.get(`/education/topic/${id}`).then((res) => res.data),
  markTopicComplete: (topicId) =>
    api.post("/education/topic/complete", { topicId }).then((res) => res.data),
  getQuizByCategory: (categoryId) =>
    api.get(`/education/quiz/${categoryId}`).then((res) => res.data),
  submitQuiz: (data) =>
    api.post("/education/quiz/submit", data).then((res) => res.data),
  getProgress: () => api.get("/education/progress").then((res) => res.data),
  getStats: () => api.get("/education/stats").then((res) => res.data),
  getLeaderboard: () =>
    api.get("/education/leaderboard").then((res) => res.data),
};

export default api;
