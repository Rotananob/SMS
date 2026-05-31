import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import '../index.css';

export default function Sidebar({ currentPage, onPageChange, onLogout, user, isOpen, onClose }) {
  const { t } = useLanguage();
  const pages = [
    { name: 'dashboard', label: t('nav.dashboard'), icon: 'fas fa-chart-line' },
    { name: 'students', label: t('nav.students'), icon: 'fas fa-user-graduate' },
    { name: 'courses', label: t('nav.courses'), icon: 'fas fa-book' },
    { name: 'attendance', label: t('nav.attendance'), icon: 'fas fa-clipboard-list' },
    { name: 'grades', label: t('nav.grades'), icon: 'fas fa-star' },
    { name: 'reports', label: t('nav.reports'), icon: 'fas fa-file-alt' },
    { name: 'notifications', label: t('nav.notifications'), icon: 'fas fa-bell' },
  ];

  const handlePageClick = (pageName) => {
    onPageChange(pageName);
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && window.innerWidth <= 768 && (
        <div className="sidebar-overlay" onClick={onClose}></div>
      )}
      <aside className={`sidebar ${isOpen ? 'active' : ''}`}>
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
                    handlePageClick(page.name);
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
            <i className="fas fa-sign-out-alt"></i> {t('buttons.logout')}
          </button>
        </div>
      </aside>
    </>
  );
}
