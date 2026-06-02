import React, { useState, useEffect } from 'react';
import { studentService, courseService, gradeService, attendanceService, notificationService } from '../firestoreService';
import '../index.css';
import YoungPOSLogo from '../images/YoungPOS_LOGO.png';
import TrollChatbotLogo from '../images/Troll_Chatbot_logo.jpg';
import RotanaElearningLogo from '../images/rotana_elerning_logo.jpg';

export default function DashboardPage({ onPageChange }) {
  const [stats, setStats] = useState({
    total_students: 0,
    total_courses: 0,
    total_enrollments: 0,
    average_score: 0,
    attendance_rate: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const unsubscribe = notificationService.subscribe((data) => {
      setActivities(data.slice(0, 5)); // Get top 5 recent activities
    });
    return () => unsubscribe();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const students = await studentService.getAll();
      const courses = await courseService.getAll();
      const grades = await gradeService.getAll();
      const attendance = await attendanceService.getAll();

      const avgScore = grades.length > 0
        ? (grades.reduce((sum, g) => sum + (Number(g.total) || 0), 0) / grades.length).toFixed(1)
        : 0;

      const attendanceRate = attendance.length > 0
        ? ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(1)
        : 0;

      setStats({
        total_students: students.length,
        total_courses: courses.length,
        total_enrollments: students.length * courses.length,
        average_score: avgScore,
        attendance_rate: attendanceRate
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'success': return 'var(--success)';
      case 'danger': return 'var(--danger)';
      case 'warning': return 'var(--warning)';
      default: return 'var(--primary)';
    }
  };

  const getIconBackground = (type) => {
    switch (type) {
      case 'success': return 'rgba(16, 185, 129, 0.15)';
      case 'danger': return 'rgba(239, 68, 68, 0.15)';
      case 'warning': return 'rgba(245, 158, 11, 0.15)';
      default: return 'rgba(99, 102, 241, 0.15)';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Overview Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Welcome to YOUNG SMS! Here's what's happening today.</p>
        </div>
        <button className="btn btn-primary" onClick={fetchStats} style={{ alignSelf: 'flex-start' }}>
          <i className="fas fa-sync-alt"></i> Refresh Data
        </button>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '3rem' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
          <p>Loading dashboard insights...</p>
        </div>
      ) : (
        <>
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-icon students">
                <i className="fas fa-user-graduate"></i>
              </div>
              <div className="stat-info">
                <h3>Total Students</h3>
                <p>{stats.total_students}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon courses">
                <i className="fas fa-book"></i>
              </div>
              <div className="stat-info">
                <h3>Total Courses</h3>
                <p>{stats.total_courses}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon teachers">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-info">
                <h3>Enrollments</h3>
                <p>{stats.total_enrollments}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon revenue">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="stat-info">
                <h3>Average Score</h3>
                <p>{stats.average_score}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span></p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon students" style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(236, 72, 153, 0.05))', color: 'var(--accent)' }}>
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="stat-info">
                <h3>Attendance Rate</h3>
                <p>{stats.attendance_rate}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>%</span></p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            {/* Quick Actions */}
            <div style={{ background: 'var(--panel-bg)', borderRadius: 'var(--radius)', padding: '2rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fas fa-bolt" style={{ color: 'var(--warning)' }}></i> Quick Actions
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button className="btn" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '1.25rem', flexDirection: 'column', gap: '0.5rem', border: '1px solid rgba(99, 102, 241, 0.2)' }} onClick={() => onPageChange?.('students')}>
                  <i className="fas fa-user-plus" style={{ fontSize: '1.5rem' }}></i>
                  <span>Add Student</span>
                </button>
                <button className="btn" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1.25rem', flexDirection: 'column', gap: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }} onClick={() => onPageChange?.('attendance')}>
                  <i className="fas fa-clipboard-check" style={{ fontSize: '1.5rem' }}></i>
                  <span>Mark Attendance</span>
                </button>
                <button className="btn" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--info)', padding: '1.25rem', flexDirection: 'column', gap: '0.5rem', border: '1px solid rgba(14, 165, 233, 0.2)' }} onClick={() => onPageChange?.('courses')}>
                  <i className="fas fa-book-medical" style={{ fontSize: '1.5rem' }}></i>
                  <span>New Course</span>
                </button>
                <button className="btn" style={{ background: 'rgba(236, 72, 153, 0.1)', color: 'var(--accent)', padding: '1.25rem', flexDirection: 'column', gap: '0.5rem', border: '1px solid rgba(236, 72, 153, 0.2)' }} onClick={() => onPageChange?.('grades')}>
                  <i className="fas fa-star" style={{ fontSize: '1.5rem' }}></i>
                  <span>Record Grades</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{ background: 'var(--panel-bg)', borderRadius: 'var(--radius)', padding: '2rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <i className="fas fa-history" style={{ color: 'var(--primary)' }}></i> Recent Activity
                </h3>
                <button className="link-btn" onClick={() => onPageChange?.('notifications')} style={{ fontSize: '0.85rem' }}>View All</button>
              </div>
              
              {activities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <p>No recent activity</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activities.map(activity => (
                    <div key={activity.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        background: getIconBackground(activity.type), color: getIconColor(activity.type)
                      }}>
                        <i className={activity.icon || 'fas fa-bell'}></i>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>{activity.title}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{activity.message}</p>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                          {activity.createdAt ? new Date(activity.createdAt.toDate?.() || activity.createdAt).toLocaleString() : 'Just now'}
                        </span>
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-secondary" onClick={() => onPageChange?.('notifications')} style={{ marginTop: '0.5rem', width: '100%' }}>
                    View All Notifications <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Our Ecosystem / Developer Apps */}
          <div style={{ marginTop: '2.5rem', background: 'var(--panel-bg)', borderRadius: 'var(--radius)', padding: '2rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <i className="fas fa-rocket" style={{ color: 'var(--secondary)' }}></i> Discover Our Ecosystem
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Explore other professional applications developed by Rotana NOB.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              
              <a href="https://www.youngpos.app/" target="_blank" rel="noopener noreferrer" className="app-card" style={{ display: 'flex', gap: '1rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)', transition: 'var(--transition)', textDecoration: 'none' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', flexShrink: 0, overflow: 'hidden' }}>
                  <img src={YoungPOSLogo} alt="YOUNG POS" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-main)', marginBottom: '0.25rem', fontSize: '1rem' }}>YOUNG POS</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>Modern Point of Sale System</p>
                </div>
              </a>

              <a href="https://rotana-elearningg.web.app/" target="_blank" rel="noopener noreferrer" className="app-card" style={{ display: 'flex', gap: '1rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)', transition: 'var(--transition)', textDecoration: 'none' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', flexShrink: 0, overflow: 'hidden' }}>
                  <img src={RotanaElearningLogo} alt="ROTANA E-Learning" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-main)', marginBottom: '0.25rem', fontSize: '1rem' }}>ROTANA E-Learning</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>Online Learning Platform</p>
                </div>
              </a>

              <a href="https://troll-setec-chatbot.web.app/" target="_blank" rel="noopener noreferrer" className="app-card" style={{ display: 'flex', gap: '1rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)', transition: 'var(--transition)', textDecoration: 'none' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', flexShrink: 0, overflow: 'hidden' }}>
                  <img src={TrollChatbotLogo} alt="Troll Chatbot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-main)', marginBottom: '0.25rem', fontSize: '1rem' }}>Troll Chatbot</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>Interactive AI Assistant</p>
                </div>
              </a>

              <a href="https://play.google.com/store/apps/developer?id=YOUNG+app" target="_blank" rel="noopener noreferrer" className="app-card" style={{ display: 'flex', gap: '1rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)', transition: 'var(--transition)', textDecoration: 'none' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '10px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', flexShrink: 0 }}>
                  <i className="fab fa-google-play"></i>
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-main)', marginBottom: '0.25rem', fontSize: '1rem' }}>YOUNG Apps on Play Store</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>View all mobile applications</p>
                </div>
              </a>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
