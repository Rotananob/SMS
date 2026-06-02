import React, { useState, useEffect } from 'react';
import { studentService, courseService, gradeService, attendanceService } from '../firestoreService';
import { useLanguage } from '../i18n/LanguageContext';
import '../index.css';

export default function StudentPortalPage({ onBackToLogin }) {
  const { language, t, toggleLanguage } = useLanguage();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [portalEmail, setPortalEmail] = useState('');
  const [portalPassword, setPortalPassword] = useState('');
  const [portalName, setPortalName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Portal data state
  const [stats, setStats] = useState({ students: 0, courses: 0, avgGrade: 0 });
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Check registration on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('sms_student_portal');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setPortalEmail(user.email);
        setPortalName(user.name);
        setIsRegistered(true);
        loadPortalData();
      } catch (err) {
        console.error('Error loading saved user:', err);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Auto-refresh data every 30 seconds for real-time updates
  useEffect(() => {
    if (isRegistered) {
      const interval = setInterval(() => {
        loadPortalData();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isRegistered]);

  const loadPortalData = async () => {
    try {
      setLoading(true);
      const [studentsData, coursesData, gradesData, attendanceData] = await Promise.all([
        studentService.getAll(),
        courseService.getAll(),
        gradeService.getAll(),
        attendanceService.getAll()
      ]);
      
      let totalGrades = 0;
      let countGrades = 0;
      gradesData.forEach(g => {
        if (g.total) {
          totalGrades += Number(g.total);
          countGrades++;
        }
      });
      
      setStats({
        students: studentsData.length,
        courses: coursesData.length,
        avgGrade: countGrades > 0 ? (totalGrades / countGrades).toFixed(1) : 0
      });
      
      setCourses(coursesData);
      setGrades(gradesData);
      setAttendance(attendanceData);
      setLoading(false);
    } catch (err) {
      console.error("Error loading portal data:", err);
      setLoading(false);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (!portalName.trim() || !portalEmail.trim() || !portalPassword.trim()) {
      setAuthError('All fields are required');
      return;
    }

    if (portalPassword.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }

    setAuthLoading(true);
    setTimeout(() => {
      try {
        // Store registration in localStorage
        const userData = {
          name: portalName,
          email: portalEmail,
          password: portalPassword, // Note: In production, never store passwords in localStorage
          registeredAt: new Date().toISOString()
        };
        localStorage.setItem('sms_student_portal', JSON.stringify(userData));
        setIsRegistered(true);
        setAuthLoading(false);
        loadPortalData();
      } catch (err) {
        setAuthError('Registration failed: ' + err.message);
        setAuthLoading(false);
      }
    }, 1000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (!portalEmail.trim() || !portalPassword.trim()) {
      setAuthError('Email and password are required');
      return;
    }

    setAuthLoading(true);
    setTimeout(() => {
      try {
        const savedUser = localStorage.getItem('sms_student_portal');
        if (!savedUser) {
          setAuthError('User not found. Please register first.');
          setAuthLoading(false);
          return;
        }

        const user = JSON.parse(savedUser);
        if (user.email !== portalEmail || user.password !== portalPassword) {
          setAuthError('Invalid email or password');
          setAuthLoading(false);
          return;
        }

        setIsRegistered(true);
        setAuthLoading(false);
        loadPortalData();
      } catch (err) {
        setAuthError('Login failed: ' + err.message);
        setAuthLoading(false);
      }
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('sms_student_portal');
    setIsRegistered(false);
    setPortalEmail('');
    setPortalPassword('');
    setPortalName('');
    setAuthError('');
    setActiveTab('overview');
  };

  // Registration/Login View
  if (!isRegistered) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '1rem' }}>
        <div style={{ background: 'var(--panel-bg)', padding: '3rem', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '420px', border: '1px solid var(--border-color)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '70px', height: '70px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <i className="fas fa-graduation-cap" style={{ fontSize: '2rem', color: 'white' }}></i>
            </div>
            <h2 style={{ margin: 0, fontFamily: "'Dongrek', sans-serif", color: 'var(--text-main)', fontSize: '1.5rem' }}>STUDENT PORTAL</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {isRegistering ? 'Create your student account' : 'Sign in to view your portal'}
            </p>
          </div>

          {authError && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '1rem',
              color: '#dc2626',
              fontSize: '0.85rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-start'
            }}>
              <i className="fas fa-exclamation-circle" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {isRegistering && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  <i className="fas fa-user" style={{ marginRight: '0.5rem' }} /> Full Name
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Sok San" 
                  value={portalName} 
                  onChange={e => setPortalName(e.target.value)} 
                  required 
                  style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
              </div>
            )}
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                <i className="fas fa-envelope" style={{ marginRight: '0.5rem' }} /> Student Email
              </label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="student@example.com" 
                value={portalEmail} 
                onChange={e => setPortalEmail(e.target.value)} 
                required 
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                <i className="fas fa-lock" style={{ marginRight: '0.5rem' }} /> Password
              </label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••" 
                value={portalPassword} 
                onChange={e => setPortalPassword(e.target.value)} 
                required 
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ 
                padding: '0.8rem', 
                marginTop: '0.5rem', 
                fontSize: '1rem',
                background: authLoading ? 'var(--text-muted)' : 'var(--primary)',
                cursor: authLoading ? 'not-allowed' : 'pointer'
              }} 
              disabled={authLoading}
            >
              {authLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }} />
                  {isRegistering ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>
                  <i className={`fas ${isRegistering ? 'fa-user-plus' : 'fa-sign-in-alt'}`} style={{ marginRight: '0.5rem' }} />
                  {isRegistering ? 'Register Account' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <button 
              type="button"
              className="btn" 
              style={{ 
                width: '100%', 
                padding: '0.75rem',
                background: 'rgba(99,102,241,0.1)',
                color: 'var(--primary)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }} 
              onClick={() => setIsRegistering(!isRegistering)}
            >
              <i className={`fas ${isRegistering ? 'fa-sign-in-alt' : 'fa-user-plus'}`} style={{ marginRight: '0.5rem' }} />
              {isRegistering ? 'Switch to Sign In' : 'Create New Account'}
            </button>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button 
              type="button"
              className="btn" 
              style={{ 
                color: 'var(--primary)', 
                fontSize: '0.85rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem'
              }} 
              onClick={onBackToLogin}
            >
              <i className="fas fa-arrow-left" style={{ marginRight: '0.5rem' }} /> Back to Staff Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Portal View
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-color)',
      color: 'var(--text-main)',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Header */}
      <header style={{
        background: 'var(--panel-bg)',
        borderBottom: '1px solid var(--border-color)',
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '50px', height: '50px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fas fa-graduation-cap" style={{ color: 'white', fontSize: '1.5rem' }}></i>
          </div>
          <div>
            <h1 style={{ margin: '0 0 0.2rem 0', fontSize: '1.3rem', fontFamily: "'Dongrek', sans-serif" }}>YOUNG SMS</h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Student Portal (Read-Only)</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={toggleLanguage}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(99,102,241,0.1)',
              color: 'var(--primary)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem'
            }}
          >
            <i className="fas fa-globe" style={{ marginRight: '0.5rem' }} />
            {language === 'en' ? 'ខ្ម' : 'EN'}
          </button>
          
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <i className="fas fa-user-circle" style={{ marginRight: '0.5rem' }} /> {portalName}
          </div>
          
          <button 
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--danger)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem'
            }}
          >
            <i className="fas fa-sign-out-alt" style={{ marginRight: '0.5rem' }} /> Logout
          </button>
        </div>
      </header>

      {loading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          fontSize: '2rem',
          color: 'var(--primary)'
        }}>
          <i className="fas fa-spinner fa-spin"></i>
        </div>
      ) : (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Welcome Section */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              <i className="fas fa-book-open" style={{ marginRight: '0.75rem', color: 'var(--primary)' }} />
              Welcome to Your Student Portal
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
              This is a read-only view of your academic information. All data is synced in real-time from the YOUNG SMS system. You cannot modify any information from this portal.
            </p>
          </div>

          {/* Quick Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              padding: '2rem',
              borderRadius: '16px',
              color: 'white',
              boxShadow: '0 4px 15px rgba(30, 60, 114, 0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>Active Students</p>
                  <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800' }}>{stats.students}</p>
                </div>
                <i className="fas fa-users" style={{ fontSize: '3rem', opacity: 0.2 }}></i>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              padding: '2rem',
              borderRadius: '16px',
              color: 'white',
              boxShadow: '0 4px 15px rgba(2, 132, 199, 0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>Available Courses</p>
                  <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800' }}>{stats.courses}</p>
                </div>
                <i className="fas fa-book" style={{ fontSize: '3rem', opacity: 0.2 }}></i>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              padding: '2rem',
              borderRadius: '16px',
              color: 'white',
              boxShadow: '0 4px 15px rgba(22, 163, 74, 0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>Average Score</p>
                  <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800' }}>{stats.avgGrade}/100</p>
                </div>
                <i className="fas fa-star" style={{ fontSize: '3rem', opacity: 0.2 }}></i>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            background: 'var(--panel-bg)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden'
          }}>
            {/* Tab Navigation */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              flexWrap: 'wrap'
            }}>
              {[
                { id: 'overview', label: 'Overview', icon: 'fas fa-home' },
                { id: 'courses', label: 'Courses', icon: 'fas fa-book' },
                { id: 'grades', label: 'Grades', icon: 'fas fa-star' },
                { id: 'attendance', label: 'Attendance', icon: 'fas fa-calendar-check' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '1.25rem',
                    background: activeTab === tab.id ? 'var(--panel-bg)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : 'none',
                    cursor: 'pointer',
                    fontWeight: activeTab === tab.id ? '700' : '500',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <i className={tab.icon} style={{ marginRight: '0.5rem' }} /> {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: '2rem' }}>
              {activeTab === 'overview' && (
                <div>
                  <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-main)' }}>
                    <i className="fas fa-info-circle" style={{ marginRight: '0.75rem', color: 'var(--primary)' }} />
                    Portal Information
                  </h3>
                  <div style={{
                    background: 'rgba(99,102,241,0.05)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    <p style={{ margin: '0 0 0.75rem 0', lineHeight: '1.6' }}>
                      <strong>Welcome to the YOUNG SMS Student Portal!</strong> This is a read-only interface where you can monitor your academic progress and course information in real-time. All data displayed here is automatically synced from the main system.
                    </p>
                    <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <i className="fas fa-lock" style={{ marginRight: '0.5rem' }} />
                      Data is synced automatically. Last updated: {new Date().toLocaleTimeString()}
                    </p>
                  </div>

                  <h4 style={{ margin: '1.5rem 0 1rem 0', color: 'var(--text-main)' }}>Quick Stats</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <i className="fas fa-graduation-cap" style={{ marginRight: '0.5rem' }} /> Total Students
                      </p>
                      <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)' }}>{stats.students}</p>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <i className="fas fa-book" style={{ marginRight: '0.5rem' }} /> Available Courses
                      </p>
                      <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)' }}>{stats.courses}</p>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <i className="fas fa-star" style={{ marginRight: '0.5rem' }} /> Institution Average
                      </p>
                      <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)' }}>{stats.avgGrade}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'courses' && (
                <div>
                  <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-main)' }}>
                    <i className="fas fa-book" style={{ marginRight: '0.75rem', color: 'var(--primary)' }} />
                    Available Courses ({courses.length})
                  </h3>
                  {courses.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                      <i className="fas fa-inbox" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block', opacity: 0.5 }} />
                      No courses currently available.
                    </p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                      {courses.map(course => (
                        <div
                          key={course.id}
                          style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <h4 style={{ margin: 0, color: 'var(--text-main)' }}>{course.name}</h4>
                            <span style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
                              {course.code}
                            </span>
                          </div>
                          <p style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                            {course.description || 'Course description not available'}
                          </p>
                          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <p style={{ margin: '0 0 0.5rem 0' }}>
                              <i className="fas fa-user-tie" style={{ marginRight: '0.5rem' }} /> Instructor: {course.instructor || 'TBA'}
                            </p>
                            <p style={{ margin: 0 }}>
                              <i className="fas fa-calendar" style={{ marginRight: '0.5rem' }} /> Schedule: {course.schedule || 'TBA'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'grades' && (
                <div>
                  <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-main)' }}>
                    <i className="fas fa-star" style={{ marginRight: '0.75rem', color: 'var(--primary)' }} />
                    Grade Records ({grades.length})
                  </h3>
                  {grades.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                      <i className="fas fa-inbox" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block', opacity: 0.5 }} />
                      No grade records available yet.
                    </p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-main)' }}>Course</th>
                            <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-main)' }}>Grade</th>
                            <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-main)' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {grades.map((grade, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '1rem' }}>{grade.course || 'N/A'}</td>
                              <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '700', color: 'var(--primary)' }}>{grade.total || 'N/A'}/100</td>
                              <td style={{ padding: '1rem', textAlign: 'center' }}>
                                <span style={{ background: grade.total >= 70 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: grade.total >= 70 ? 'var(--success)' : 'var(--danger)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                                  {grade.total >= 70 ? 'Pass' : 'Review'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'attendance' && (
                <div>
                  <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-main)' }}>
                    <i className="fas fa-calendar-check" style={{ marginRight: '0.75rem', color: 'var(--primary)' }} />
                    Attendance Records ({attendance.length})
                  </h3>
                  {attendance.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                      <i className="fas fa-inbox" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block', opacity: 0.5 }} />
                      No attendance records available yet.
                    </p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-main)' }}>Date</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-main)' }}>Course</th>
                            <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-main)' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendance.map((record, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '1rem' }}>{new Date(record.date).toLocaleDateString()}</td>
                              <td style={{ padding: '1rem' }}>{record.course || 'N/A'}</td>
                              <td style={{ padding: '1rem', textAlign: 'center' }}>
                                <span style={{ background: record.status === 'present' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: record.status === 'present' ? 'var(--success)' : 'var(--danger)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', textTransform: 'capitalize' }}>
                                  {record.status || 'N/A'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
