const Dashboard = {
  data: {},

  async getHTML() {
    try {
      this.data = await API.getSummary();
      return `
        <div class="page-header">
          <h2 class="page-title">Dashboard Overview</h2>
        </div>
        
        <div class="dashboard-grid">
          <div class="stat-card glass">
            <div class="stat-icon"><i class="fas fa-user-graduate"></i></div>
            <div class="stat-info">
              <div class="stat-value">${this.data.total_students || 0}</div>
              <div class="stat-label">Total Students</div>
            </div>
          </div>

          <div class="stat-card glass">
            <div class="stat-icon"><i class="fas fa-book"></i></div>
            <div class="stat-info">
              <div class="stat-value">${this.data.total_courses || 0}</div>
              <div class="stat-label">Active Courses</div>
            </div>
          </div>

          <div class="stat-card glass">
            <div class="stat-icon"><i class="fas fa-clipboard-list"></i></div>
            <div class="stat-info">
              <div class="stat-value">${this.data.total_enrollments || 0}</div>
              <div class="stat-label">Enrollments</div>
            </div>
          </div>

          <div class="stat-card glass">
            <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
            <div class="stat-info">
              <div class="stat-value">${this.data.average_score || 0}</div>
              <div class="stat-label">Average Score</div>
            </div>
          </div>

          <div class="stat-card glass" style="grid-column: 1 / -1;">
            <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
            <div class="stat-info">
              <div class="stat-value">${this.data.attendance_rate || 0}%</div>
              <div class="stat-label">Attendance Rate</div>
            </div>
          </div>
        </div>

        <div class="dashboard-section">
          <h3 class="section-title">Quick Actions</h3>
          <div class="quick-actions">
            <button class="action-card glass" onclick="App.navigate('students')">
              <i class="fas fa-user-plus"></i>
              <span>View Students</span>
            </button>
            <button class="action-card glass" onclick="App.navigate('courses')">
              <i class="fas fa-book-open"></i>
              <span>Manage Courses</span>
            </button>
            <button class="action-card glass" onclick="App.navigate('attendance')">
              <i class="fas fa-clipboard-check"></i>
              <span>Mark Attendance</span>
            </button>
            <button class="action-card glass" onclick="App.navigate('grades')">
              <i class="fas fa-star"></i>
              <span>View Grades</span>
            </button>
          </div>
        </div>
      `;
    } catch (err) {
      console.error('Dashboard error:', err);
      return `<div class="error-msg">Failed to load dashboard: ${err.message}</div>`;
    }
  },

  initEvents() {
    // Dashboard doesn't need event listeners
  }
};
