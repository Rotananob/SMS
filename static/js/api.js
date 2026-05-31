/**
 * API Service Module
 * Handles all communication with Flask backend
 */

const API = {
  baseURL: '/api',
  token: null,

  /**
   * Initialize API with stored token
   */
  init() {
    this.token = localStorage.getItem('jwt_token');
  },

  /**
   * Set JWT token
   */
  setToken(token) {
    this.token = token;
    localStorage.setItem('jwt_token', token);
  },

  /**
   * Clear token on logout
   */
  clearToken() {
    this.token = null;
    localStorage.removeItem('jwt_token');
  },

  /**
   * Generic fetch wrapper with auth headers
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Token expired, force logout
        this.clearToken();
        window.location.href = '/';
        return null;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  },

  // ─── Auth ─────────────────────────────────────────────────────────────────

  async login(username, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async getMe() {
    return this.request('/auth/me', { method: 'GET' });
  },

  // ─── Students ─────────────────────────────────────────────────────────────

  async getStudents() {
    return this.request('/students', { method: 'GET' });
  },

  async getStudent(id) {
    return this.request(`/students/${id}`, { method: 'GET' });
  },

  async createStudent(data) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateStudent(id, data) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteStudent(id) {
    return this.request(`/students/${id}`, { method: 'DELETE' });
  },

  // ─── Courses ──────────────────────────────────────────────────────────────

  async getCourses() {
    return this.request('/courses', { method: 'GET' });
  },

  async getCourse(id) {
    return this.request(`/courses/${id}`, { method: 'GET' });
  },

  async createCourse(data) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCourse(id, data) {
    return this.request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCourse(id) {
    return this.request(`/courses/${id}`, { method: 'DELETE' });
  },

  // ─── Enrollments ──────────────────────────────────────────────────────────

  async getEnrollments() {
    return this.request('/enrollments', { method: 'GET' });
  },

  async createEnrollment(studentId, courseId) {
    return this.request('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId, course_id: courseId }),
    });
  },

  // ─── Attendance ────────────────────────────────────────────────────────────

  async getAttendance(filters = {}) {
    const params = new URLSearchParams();
    if (filters.courseId) params.append('course_id', filters.courseId);
    if (filters.studentId) params.append('student_id', filters.studentId);
    if (filters.date) params.append('date', filters.date);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/attendance${query}`, { method: 'GET' });
  },

  async markAttendance(records) {
    const data = Array.isArray(records) ? records : [records];
    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ─── Grades ───────────────────────────────────────────────────────────────

  async getGrades(filters = {}) {
    const params = new URLSearchParams();
    if (filters.courseId) params.append('course_id', filters.courseId);
    if (filters.studentId) params.append('student_id', filters.studentId);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/grades${query}`, { method: 'GET' });
  },

  async saveGrade(data) {
    return this.request('/grades', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ─── Reports ──────────────────────────────────────────────────────────────

  async getSummary() {
    return this.request('/reports/summary', { method: 'GET' });
  },

  // ─── Notifications ────────────────────────────────────────────────────────

  async getNotifications() {
    return this.request('/notifications', { method: 'GET' });
  },

  async createNotification(title, message, target = 'all') {
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify({ title, message, target }),
    });
  },

  async deleteNotification(id) {
    return this.request(`/notifications/${id}`, { method: 'DELETE' });
  },
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => API.init());
