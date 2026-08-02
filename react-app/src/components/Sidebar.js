import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import '../index.css';
import YoungPOSLogo from '../images/YoungPOS_LOGO.png';
import RotanaElearningLogo from '../images/rotana_elerning_logo.jpg';
import BaciiLogo from '../images/Bacii_logo.jpg';

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
    { name: 'admin', label: 'Admin', icon: 'fas fa-shield-alt' },
    { name: 'settings', label: t('nav.settings') || 'Settings', icon: 'fas fa-cog' },
  ];

  const [isDarkMode, setIsDarkMode] = React.useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  };

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
        <div className="sidebar-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem 1rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <img src="/logo.png" alt="YOUNG SMS Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '5px' }} />
          </div>
          <span className="sidebar-title" style={{ fontFamily: "'Dongrek', sans-serif", fontSize: '1.5rem', marginTop: '0.5rem', textAlign: 'center' }}>YOUNG SMS</span>
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
          <div style={{ padding: '0 1.25rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>My Ecosystem</span>
          </div>
          <ul>
            <li>
              <a href="https://www.youngpos.app/" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ padding: '0.75rem 1.25rem', marginBottom: '0.25rem' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={YoungPOSLogo} alt="YOUNG POS" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} />
                </div>
                <span>YOUNG POS</span>
              </a>
            </li>
            <li>
              <a href="https://rotana-elearningg.web.app/" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ padding: '0.75rem 1.25rem', marginBottom: '0.25rem' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={RotanaElearningLogo} alt="E-Learning" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} />
                </div>
                <span>Rotana E-Learning</span>
              </a>
            </li>
            <li>
              <a href="https://bacii-cal.firebaseapp.com/" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ padding: '0.75rem 1.25rem', marginBottom: '0.25rem' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={BaciiLogo} alt="BacII Calculator" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span>BacII Calculator</span>
              </a>
            </li>
            <li>
              <a href="https://play.google.com/store/apps/developer?id=YOUNG+app" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ padding: '0.75rem 1.25rem', marginBottom: '0.25rem' }}>
                <i className="fab fa-google-play" style={{ color: '#0ea5e9' }}></i>
                <span>Play Store Apps</span>
              </a>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Developed by</p>
            <p style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary)', margin: '0.25rem 0', fontFamily: "'Dongrek', sans-serif" }}>ASIA EURO STUDENTS</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('pages.settings.preferences') || 'Theme'}</span>
            <button onClick={toggleTheme} style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '0.25rem 0.75rem', color: 'var(--text-main)', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem', cursor: 'pointer' }}>
              {isDarkMode ? <><i className="fas fa-moon"></i> Dark</> : <><i className="fas fa-sun"></i> Light</>}
            </button>
          </div>
          <div className="user-info" style={{ marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center', background: 'rgba(99, 102, 241, 0.05)', padding: '0.75rem', borderRadius: '10px' }}>
            <p style={{ margin: '0 0 0.25rem 0', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>{user?.role || 'Administrator'}</p>
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)' }}>{user?.username || user?.displayName || 'Admin User'}</p>
          </div>
          <button className="btn-logout" onClick={onLogout}>
            <i className="fas fa-sign-out-alt"></i> {t('buttons.logout')}
          </button>
        </div>
      </aside>
    </>
  );
}
