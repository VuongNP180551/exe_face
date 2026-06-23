import axios from 'axios';

const API_BASE_URL = 'https://face-attendance-api-gfyd.onrender.com/api';

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
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Student APIs
export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getClasses: () => api.get('/students/classes'),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  uploadAvatar: (id, formData) => api.post(`/students/${id}/avatar`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getFaceData: (id) => api.get(`/students/${id}/facedata`),
  uploadFaceData: (id, formData) => api.post(`/students/${id}/facedata`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteFaceData: (id, faceId) => api.delete(`/students/${id}/facedata/${faceId}`),
};

// Attendance APIs
export const attendanceAPI = {
  createSession: (data) => api.post('/attendance/sessions', data),
  processSession: (id, formData) => api.post(`/attendance/sessions/${id}/process`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateRecord: (sessionId, recordId, data) => api.put(`/attendance/sessions/${sessionId}/records/${recordId}`, data),
  finalizeSession: (id) => api.post(`/attendance/sessions/${id}/finalize`),
  getMyRecords: () => api.get('/attendance/my-records'),
  getSessions: () => api.get('/attendance/sessions'),
  getSession: (id) => api.get(`/attendance/sessions/${id}`),
  updateSession: (id, data) => api.put(`/attendance/sessions/${id}`, data),
  deleteSession: (id) => api.delete(`/attendance/sessions/${id}`),
  exportSession: (id) => api.get(`/attendance/sessions/${id}/export`, { responseType: 'blob' }),
  
  // Appeals
  createAppeal: (formData) => api.post('/attendance/appeals', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAppeals: () => api.get('/attendance/appeals'),
  updateAppeal: (id, data) => api.put(`/attendance/appeals/${id}`, data),
};

// Admin APIs
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getStats: () => api.get('/admin/stats'),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Class APIs
export const classAPI = {
  getAll: () => api.get('/classes'),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
};

// Schedule APIs
export const scheduleAPI = {
  getAll: () => api.get('/schedules'),
  create: (data) => api.post('/schedules', data),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`),
};

// Registration APIs
export const registrationAPI = {
  getAll: () => api.get('/registrations'),
  create: (data) => api.post('/registrations', data),
  updateStatus: (id, data) => api.put(`/registrations/${id}/status`, data),
};

// Notification APIs
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
};



export default api;
