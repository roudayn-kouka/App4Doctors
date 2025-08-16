import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('app4doctor_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('app4doctor_token');
      localStorage.removeItem('app4doctor_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  changePassword: (passwords) => api.post('/auth/change-password', passwords),
};

// Patients API
export const patientsAPI = {
  getAll: (params) => api.get('/patients', { params }),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  updateVitals: (id, vitals) => api.put(`/patients/${id}/vitals`, vitals),
  delete: (id) => api.delete(`/patients/${id}`),
  getStats: () => api.get('/patients/stats/overview'),
};

// Appointments API
export const appointmentsAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
  getStats: () => api.get('/appointments/stats/overview'),
  getCalendar: (year, month) => api.get(`/appointments/calendar/${year}/${month}`),
};

// Prescriptions API
export const prescriptionsAPI = {
  getAll: (params) => api.get('/prescriptions', { params }),
  getById: (id) => api.get(`/prescriptions/${id}`),
  create: (data) => api.post('/prescriptions', data),
  update: (id, data) => api.put(`/prescriptions/${id}`, data),
  updateStatus: (id, status) => api.put(`/prescriptions/${id}/status`, { status }),
  delete: (id) => api.delete(`/prescriptions/${id}`),
  getStats: () => api.get('/prescriptions/stats/overview'),
  download: (id) => api.get(`/prescriptions/${id}/download`, { responseType: 'blob' }),
};

// Analysis API
export const analysisAPI = {
  getAll: (params) => api.get('/analysis', { params }),
  getById: (id) => api.get(`/analysis/${id}`),
  upload: (formData) => api.post('/analysis/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  process: (id) => api.put(`/analysis/${id}/process`),
  review: (id, data) => api.put(`/analysis/${id}/review`, data),
  update: (id, data) => api.put(`/analysis/${id}`, data),
  delete: (id) => api.delete(`/analysis/${id}`),
  getStats: () => api.get('/analysis/stats/overview'),
  download: (id) => api.get(`/analysis/${id}/download`, { responseType: 'blob' }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: (limit) => api.get('/dashboard/recent-activity', { params: { limit } }),
  getUpcomingAppointments: (limit) => api.get('/dashboard/upcoming-appointments', { params: { limit } }),
  getAlerts: () => api.get('/dashboard/alerts'),
  getVitalsChart: (params) => api.get('/dashboard/charts/vitals', { params }),
  getAppointmentsChart: (params) => api.get('/dashboard/charts/appointments', { params }),
};

export default api;