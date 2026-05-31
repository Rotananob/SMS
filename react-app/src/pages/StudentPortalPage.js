import React, { useState, useEffect } from 'react';
import { studentService, courseService, gradeService } from '../firestoreService';
import '../index.css';

export default function StudentPortalPage({ onBackToLogin }) {
  const [stats, setStats] = useState({ students: 0, courses: 0, avgGrade: 0 });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Public Portal Auth State
  const [isPortalAuthenticated, setIsPortalAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [portalEmail, setPortalEmail] = useState('');
  const [portalPassword, setPortalPassword] = useState('');
  const [portalName, setPortalName] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [studentsData, coursesData, gradesData] = await Promise.all([
          studentService.getAll(),
          courseService.getAll(),
          gradeService.getAll()
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
        setLoading(false);
      } catch (err) {
        console.error("Error loading portal data", err);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePortalAuth = (e) => {
    e.preventDefault();
    if (!portalEmail || !portalPassword) return;
    
    // Simulate auth delay
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsPortalAuthenticated(true);
    }, 1000);
  };

  if (!isPortalAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ background: 'var(--panel-bg)', padding: '3rem', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '400px', border: '1px solid var(--border-color)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '70px', height: '70px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <i className="fas fa-graduation-cap" style={{ fontSize: '2rem', color: 'white' }}></i>
            </div>
            <h2 style={{ margin: 0, fontFamily: "'Dongrek', sans-serif", color: 'var(--text-main)' }}>STUDENT PORTAL</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{isRegistering ? 'Create your student account' : 'Sign in to view your classes'}</p>
          </div>

          <form onSubmit={handlePortalAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {isRegistering && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Full Name</label>
                <input type="text" className="form-control" placeholder="e.g. Sok San" value={portalName} onChange={e => setPortalName(e.target.value)} required />
              </div>
            )}
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Student Email</label>
              <input type="email" className="form-control" placeholder="student@example.com" value={portalEmail} onChange={e => setPortalEmail(e.target.value)} required />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Password</label>
              <input type="password" className="form-control" placeholder="••••••••" value={portalPassword} onChange={e => setPortalPassword(e.target.value)} required />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', marginTop: '0.5rem', fontSize: '1rem' }} disabled={loading}>
              {loading ? <i className="fas fa-spinner fa-spin"></i> : (isRegistering ? 'Register Account' : 'Sign In')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? 'Switch to Sign In' : 'Create Student Account'}
            </button>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button className="btn" style={{ color: 'var(--danger)', fontSize: '0.85rem' }} onClick={onBackToLogin}>
              <i className="fas fa-arrow-left"></i> Back to Staff Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', fontFamily: "'Inter', sans-serif" }}>
      {/* Portal Navbar */}
      <nav style={{ background: 'var(--panel-bg)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontFamily: "'Dongrek', sans-serif", color: 'var(--text-main)' }}>YOUNG SMS <span style={{ fontSize: '1rem', color: 'var(--primary)', fontFamily: "'Inter', sans-serif" }}>| Public Portal</span></h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>{portalEmail}</span>
          <button onClick={() => setIsPortalAuthenticated(false)} className="btn btn-secondary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </nav>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--primary)' }}>
          <i className="fas fa-spinner fa-spin fa-3x"></i>
        </div>
      ) : (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Welcome to the Student Portal</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              View real-time, read-only information directly synced from the YOUNG SMS Dashboard. You cannot modify data from this portal.
            </p>
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', padding: '2rem', borderRadius: '16px', color: 'white', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
              <i className="fas fa-users" style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.8 }}></i>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 500 }}>Active Students</h3>
              <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>{stats.students}</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, var(--info), #0284c7)', padding: '2rem', borderRadius: '16px', color: 'white', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
              <i className="fas fa-book" style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.8 }}></i>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 500 }}>Available Courses</h3>
              <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>{stats.courses}</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, var(--success), #059669)', padding: '2rem', borderRadius: '16px', color: 'white', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
              <i className="fas fa-award" style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.8 }}></i>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 500 }}>Avg Institution Score</h3>
              <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>{stats.avgGrade}<span style={{ fontSize: '1.2rem' }}>/100</span></p>
            </div>
          </div>

          {/* Course List */}
          <div style={{ background: 'var(--panel-bg)', borderRadius: '16px', padding: '2rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)' }}>
                <i className="fas fa-layer-group" style={{ color: 'var(--primary)' }}></i> Course Directory
              </h3>
              <span style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                <i className="fas fa-lock"></i> Read Only
              </span>
            </div>
            
            {courses.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No courses currently available.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {courses.map(course => (
                  <div key={course.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', background: 'var(--bg-secondary)', transition: 'transform 0.2s', cursor: 'default' }} className="app-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>{course.name}</h4>
                      <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{course.code}</span>
                    </div>
                    <p style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      {course.description || 'This course is currently offered for the active semester. Enroll through the administration office.'}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <i className="fas fa-user-tie"></i> {course.instructor || 'TBA'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <i className="fas fa-calendar-alt"></i> {course.schedule || 'TBA'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      )}
    </div>
  );
}
