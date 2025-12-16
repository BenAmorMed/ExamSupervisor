import axios from 'axios';

// Use empty baseURL to leverage Vite proxy (avoids CORS issues)
// The proxy in vite.config.js will forward requests to http://localhost:8080
const API_BASE_URL = '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      // Add token if available in user data
      if (userData.token) {
        config.headers.Authorization = `Bearer ${userData.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/enseignant/login', { email, password }),
};

export const teacherAPI = {
  // Note: getTeacherInfo endpoint doesn't exist in controller, 
  // so we'll skip it and use the user data from login
  getTeacherInfo: (id) => api.get(`/enseignant/${id}`),
  getAvailableSessions: (id) => api.get(`/enseignant/${id}/disponibilite`),
  getMySessions: (id) => api.get(`/enseignant/${id}/mesSeances`),
  getSubjectSessions: (id) => api.get(`/enseignant/${id}/sessionsWithAllMatieres`),
  getAllSessions: (page = 0, size = 8) => api.get(`/enseignant/sessions?page=${page}&size=${size}`),
  selectSession: (teacherId, sessionId) =>
    api.post(`/enseignant/${teacherId}/choisir/${sessionId}`),
  cancelSession: (teacherId, sessionId) =>
    api.post(`/enseignant/${teacherId}/annuler/${sessionId}`), // Changed from DELETE to POST
  autoAssign: (id) => api.post(`/enseignant/assign-auto/${id}`), // Fixed path
};

export default api;

