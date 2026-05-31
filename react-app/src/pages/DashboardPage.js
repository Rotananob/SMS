import React, { useState, useEffect } from 'react';
import { reportsAPI, studentsAPI, coursesAPI, enrollmentsAPI, attendanceAPI, gradesAPI } from '../api';
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
      const response = await reportsAPI.summary();
      setStats(response.data);
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
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '2rem' }}>
          <p>Loading...</p>
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
              <i className="fas fa-chalkboard-user"></i>
            </div>
            <div className="stat-info">
              <h3>Total Enrollments</h3>
              <p>{stats.total_enrollments}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue">
              <i className="fas fa-star"></i>
            </div>
            <div className="stat-info">
              <h3>Average Score</h3>
              <p>{stats.average_score}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon students">
              <i className="fas fa-percent"></i>
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
