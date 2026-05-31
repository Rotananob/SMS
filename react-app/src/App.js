import React, { useState, useEffect } from 'react';
import { authService } from './authService';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { AlertProvider, useAlert } from './context/AlertContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import CoursesPage from './pages/CoursesPage';
import AttendancePage from './pages/AttendancePage';
import GradesPage from './pages/GradesPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Toast from './components/Toast';
import './index.css';

function AppContent() {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Monitor Firebase authentication state
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsLoggedIn(true);
        // Show welcome notification
        showAlert({
          type: 'success',
          title: t('messages.welcome'),
          message: `${t('messages.loginSuccess')}`,
          buttons: ['OK']
        });
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [showAlert, t]);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsLoggedIn(false);
      setCurrentPage('dashboard');
      addToast(t('messages.logoutSuccess'), 'success');
    } catch (err) {
      showAlert({
        type: 'error',
        title: t('messages.error'),
        message: 'Logout failed: ' + err.message,
        buttons: ['OK']
      });
    }
  };

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: t('pages.dashboard.title'),
      students: t('pages.students.title'),
      courses: t('pages.courses.title'),
      attendance: t('pages.attendance.title'),
      grades: t('pages.grades.title'),
      reports: t('pages.reports.title'),
      notifications: t('pages.notifications.title'),
    };
    return titles[currentPage] || 'Dashboard';
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'students':
        return <StudentsPage addToast={addToast} />;
      case 'courses':
        return <CoursesPage addToast={addToast} />;
      case 'attendance':
        return <AttendancePage addToast={addToast} />;
      case 'grades':
        return <GradesPage addToast={addToast} />;
      case 'reports':
        return <ReportsPage />;
      case 'notifications':
        return <NotificationsPage addToast={addToast} />;
      case 'dashboard':
      default:
        return <DashboardPage />;
    }
  };

  if (loading) {
    return (
      <div className="login-screen">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary)' }}></i>
          <p>{t('messages.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="app">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
        user={user}
      />
      <div className="main-wrapper">
        <Topbar pageTitle={getPageTitle()} user={user} onLogout={handleLogout} />
        <main className="main-content">
          {renderPage()}
        </main>
      </div>

      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AlertProvider>
        <AppContent />
      </AlertProvider>
    </LanguageProvider>
  );
}

export default App;
