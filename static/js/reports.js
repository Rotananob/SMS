const Reports = {
  async getDashboardHTML() {
    try {
      const summary = await API.getSummary();
      
      return `
        <div class="page-header">
          <h2 class="page-title">Dashboard Overview</h2>
        </div>
        
        <div class="dashboard-grid">
          <div class="stat-card glass">
            <div class="stat-icon"><i class="fas fa-user-graduate"></i></div>
            <div class="stat-info">
              <div class="stat-label">Total Students</div>
              <div class="stat-value">${summary.total_students}</div>
            </div>
          </div>
          
          <div class="stat-card glass">
            <div class="stat-icon"><i class="fas fa-book"></i></div>
            <div class="stat-info">
              <div class="stat-label">Active Courses</div>
              <div class="stat-value">${summary.total_courses}</div>
            </div>
          </div>
          
          <div class="stat-card glass">
            <div class="stat-icon"><i class="fas fa-users"></i></div>
            <div class="stat-info">
              <div class="stat-label">Enrollments</div>
              <div class="stat-value">${summary.total_enrollments}</div>
            </div>
          </div>
          
          <div class="stat-card glass">
            <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
            <div class="stat-info">
              <div class="stat-label">Average Score</div>
              <div class="stat-value">${summary.average_score}</div>
            </div>
          </div>
          
          <div class="stat-card glass" style="grid-column: 1 / -1;">
            <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
            <div class="stat-info">
              <div class="stat-label">Attendance Rate</div>
              <div class="stat-value">${summary.attendance_rate}%</div>
            </div>
          </div>
        </div>
        
        <div class="glass" style="padding: 24px; border-radius: var(--radius); margin-top: 24px;">
          <h3 style="margin-bottom: 16px;"><i class="fas fa-bullhorn" style="color: var(--primary); margin-right: 8px;"></i> System Status</h3>
          <p class="text-muted">Welcome back to the Student Management System. All systems operational.</p>
        </div>
      `;
    } catch (err) {
      return `<div class="alert alert-danger"><i class="fas fa-exclamation-triangle"></i> Failed to load dashboard data: ${err.message}</div>`;
    }
  },

  async getHTML() {
    try {
      const summary = await API.getSummary();
      return `
        <div class="page-header">
          <h2 class="page-title">System Reports</h2>
        </div>
        
        <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">
          <div class="glass report-card" style="padding: 2rem; border-radius: var(--radius); text-align: center; cursor: pointer;">
            <i class="fas fa-chart-bar" style="font-size: 2.5rem; color: var(--primary); margin-bottom: 1rem;"></i>
            <h3>Summary Report</h3>
            <p class="text-muted" style="margin-top: 0.5rem; font-size: 0.9rem;">Total Students: <strong>${summary.total_students}</strong></p>
            <p class="text-muted" style="margin-top: 0.25rem; font-size: 0.9rem;">Total Courses: <strong>${summary.total_courses}</strong></p>
          </div>
          
          <div class="glass report-card" style="padding: 2rem; border-radius: var(--radius); text-align: center;">
            <i class="fas fa-line-chart" style="font-size: 2.5rem; color: var(--success); margin-bottom: 1rem;"></i>
            <h3>Performance Report</h3>
            <p class="text-muted" style="margin-top: 0.5rem; font-size: 0.9rem;">Average Score: <strong>${summary.average_score}</strong></p>
            <p class="text-muted" style="margin-top: 0.25rem; font-size: 0.9rem;">Attendance Rate: <strong>${summary.attendance_rate}%</strong></p>
          </div>
          
          <div class="glass report-card" style="padding: 2rem; border-radius: var(--radius); text-align: center;">
            <i class="fas fa-calendar" style="font-size: 2.5rem; color: var(--secondary); margin-bottom: 1rem;"></i>
            <h3>Enrollment Report</h3>
            <p class="text-muted" style="margin-top: 0.5rem; font-size: 0.9rem;">Total Enrollments: <strong>${summary.total_enrollments}</strong></p>
            <p class="text-muted" style="margin-top: 0.25rem; font-size: 0.9rem;">Course Distribution: <strong>${summary.total_courses} courses</strong></p>
          </div>
        </div>
        
        <div class="glass" style="padding: 2rem; border-radius: var(--radius); margin-top: 2rem;">
          <h3 style="margin-bottom: 1rem;">Quick Stats</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div style="border-left: 3px solid var(--primary); padding: 1rem; padding-left: 1.5rem;">
              <div style="font-size: 0.85rem; color: var(--text-muted);">Total Students</div>
              <div style="font-size: 1.75rem; font-weight: 700; color: var(--text-main);">${summary.total_students}</div>
            </div>
            <div style="border-left: 3px solid var(--secondary); padding: 1rem; padding-left: 1.5rem;">
              <div style="font-size: 0.85rem; color: var(--text-muted);">Active Courses</div>
              <div style="font-size: 1.75rem; font-weight: 700; color: var(--text-main);">${summary.total_courses}</div>
            </div>
            <div style="border-left: 3px solid var(--success); padding: 1rem; padding-left: 1.5rem;">
              <div style="font-size: 0.85rem; color: var(--text-muted);">Average Score</div>
              <div style="font-size: 1.75rem; font-weight: 700; color: var(--text-main);">${summary.average_score}</div>
            </div>
            <div style="border-left: 3px solid var(--warning); padding: 1rem; padding-left: 1.5rem;">
              <div style="font-size: 0.85rem; color: var(--text-muted);">Attendance</div>
              <div style="font-size: 1.75rem; font-weight: 700; color: var(--text-main);">${summary.attendance_rate}%</div>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      return `<div class="alert alert-danger">Failed to load reports: ${err.message}</div>`;
    }
  },

  initEvents() {
    // No additional events needed for reports page
  }
};

