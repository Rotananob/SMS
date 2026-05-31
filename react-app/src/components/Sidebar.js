import React from 'react';
import '../index.css';

export default function Sidebar({ currentPage, onPageChange, onLogout, user }) {
  const pages = [
    { name: 'dashboard', label: 'Dashboard', icon: 'fas fa-home' },
    { name: 'students', label: 'Students', icon: 'fas fa-user-graduate' },
    { name: 'courses', label: 'Courses', icon: 'fas fa-book' },
    { name: 'attendance', label: 'Attendance', icon: 'fas fa-calendar-check' },
    { name: 'grades', label: 'Grades', icon: 'fas fa-star' },
    { name: 'reports', label: 'Reports', icon: 'fas fa-chart-bar' },
    { name: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <i className="fas fa-graduation-cap sidebar-logo-icon"></i>
        <span className="sidebar-title">SMS</span>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {pages.map(page => (
            <li key={page.name}>
              <a
                href="#"
                className={`nav-link ${currentPage === page.name ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(page.name);
                }}
              >
                <i className={page.icon}></i>
                <span>{page.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
          <p style={{ margin: '0.25rem 0' }}><strong>{user?.username}</strong></p>
          <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)' }}>{user?.role}</p>
        </div>
        <button className="btn-logout" onClick={onLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </aside>
  );
}
