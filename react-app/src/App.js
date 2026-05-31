import React, { useState, useEffect } from 'react';
import { authAPI } from './api';
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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [toasts, setToasts] = useState([]);

  // Check if user is already logged in
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const response = await authAPI.me();
        setUser(response.data);
        setIsLoggedIn(true);
      } catch (err) {
        localStorage.removeItem('jwt_token');
        setIsLoggedIn(false);
      }
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setUser(null);
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
  };

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      students: 'Students',
      courses: 'Courses',
      attendance: 'Attendance',
      grades: 'Grades',
      reports: 'Reports',
      notifications: 'Notifications',
    };
    return titles[currentPage] || 'Dashboard';
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'students':
        return <StudentsPage />;
      case 'courses':
        return <CoursesPage />;
      case 'attendance':
        return <AttendancePage />;
      case 'grades':
        return <GradesPage />;
      case 'reports':
        return <ReportsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'dashboard':
      default:
        return <DashboardPage />;
    }
  };

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

export default App;
