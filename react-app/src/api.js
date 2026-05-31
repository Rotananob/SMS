import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  me: () => api.get('/auth/me'),
};

export const studentsAPI = {
  getAll: () => api.get('/students'),
  getOne: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

export const coursesAPI = {
  getAll: () => api.get('/courses'),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

export const enrollmentsAPI = {
  getAll: () => api.get('/enrollments'),
  create: (data) => api.post('/enrollments', data),
};

export const attendanceAPI = {
  getAll: (filters) => api.get('/attendance', { params: filters }),
  mark: (data) => api.post('/attendance', data),
};

export const gradesAPI = {
  getAll: (filters) => api.get('/grades', { params: filters }),
  save: (data) => api.post('/grades', data),
};

export const reportsAPI = {
  summary: () => api.get('/reports/summary'),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  create: (data) => api.post('/notifications', data),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export default api;
