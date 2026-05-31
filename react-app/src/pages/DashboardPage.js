import React, { useState, useEffect } from 'react';
import { studentService, courseService, gradeService, attendanceService } from '../firestoreService';
import '../index.css';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_students: 0,
    total_courses: 0,
    total_enrollments: 0,
    average_score: 0,
    attendance_rate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const students = await studentService.getAll();
      const courses = await courseService.getAll();
      const grades = await gradeService.getAll();
      const attendance = await attendanceService.getAll();

      const avgScore = grades.length > 0
        ? (grades.reduce((sum, g) => sum + (g.total || 0), 0) / grades.length).toFixed(1)
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

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <button className="btn btn-primary" onClick={fetchStats}>
          <i className="fas fa-sync-alt"></i> Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '3rem' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
          <p>Loading dashboard...</p>
        </div>
      ) : (
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
              <i className="fas fa-link"></i>
            </div>
            <div className="stat-info">
              <h3>Enrollments</h3>
              <p>{stats.total_enrollments}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue">
              <i className="fas fa-trophy"></i>
            </div>
            <div className="stat-info">
              <h3>Average Score</h3>
              <p>{stats.average_score}/100</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon students">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-info">
              <h3>Attendance Rate</h3>
              <p>{stats.attendance_rate}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
