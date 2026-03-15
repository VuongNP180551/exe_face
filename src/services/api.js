import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Student APIs
export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getClasses: () => api.get('/students/classes'),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

// Attendance APIs
export const attendanceAPI = {
  createSession: (formData) =>
    api.post('/attendance/sessions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getSessions: () => api.get('/attendance/sessions'),
  getSession: (id) => api.get(`/attendance/sessions/${id}`),
  updateSession: (id, data) => api.put(`/attendance/sessions/${id}`, data),
  deleteSession: (id) => api.delete(`/attendance/sessions/${id}`),
};

export default api;
