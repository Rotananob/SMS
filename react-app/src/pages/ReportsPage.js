import React, { useState, useEffect } from 'react';
import { studentService, courseService, gradeService, attendanceService } from '../firestoreService';
import '../index.css';

export default function ReportsPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalGrades: 0,
    totalAttendance: 0,
    avgGrade: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [courseStats, setCourseStats] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const students = await studentService.getAll();
      const courses = await courseService.getAll();
      const grades = await gradeService.getAll();
      const attendance = await attendanceService.getAll();

      // Calculate statistics
      const totalGrades = grades.filter(g => g.total).length;
      const avgGrade = totalGrades > 0 
        ? (grades.reduce((sum, g) => sum + (g.total || 0), 0) / totalGrades).toFixed(2)
        : 0;

      const presentCount = attendance.filter(a => a.status === 'present').length;
      const totalRecords = attendance.length;
      const attendanceRate = totalRecords > 0 
        ? ((presentCount / totalRecords) * 100).toFixed(2)
        : 0;

      // Course statistics
      const courseStats = courses.map(course => {
        const courseGrades = grades.filter(g => g.course_id === course.id);
        const courseAvg = courseGrades.length > 0
          ? (courseGrades.reduce((sum, g) => sum + (g.total || 0), 0) / courseGrades.length).toFixed(2)
          : 0;
        
        const courseAttendance = attendance.filter(a => a.course_id === course.id);
        const coursePresent = courseAttendance.filter(a => a.status === 'present').length;
        const courseAttendanceRate = courseAttendance.length > 0
          ? ((coursePresent / courseAttendance.length) * 100).toFixed(2)
          : 0;

        return {
          id: course.id,
          name: course.name,
          code: course.code,
          students: students.length,
          avgGrade: courseAvg,
          attendanceRate: courseAttendanceRate
        };
      });

      setStats({
        totalStudents: students.length,
        totalCourses: courses.length,
        totalGrades: totalGrades,
        totalAttendance: totalRecords,
        avgGrade: parseFloat(avgGrade),
        attendanceRate: parseFloat(attendanceRate)
      });

      setCourseStats(courseStats);
      setLoading(false);
    } catch (err) {
      console.error('Error loading reports:', err);
      setLoading(false);
    }
  };

  if (loading) return <p>Loading reports...</p>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reports & Analytics</h1>
        <button className="btn btn-primary" onClick={loadReports}>
          <i className="fas fa-sync"></i> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="stat-card" style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Students</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalStudents}</p>
        </div>

        <div className="stat-card" style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Courses</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--info)' }}>{stats.totalCourses}</p>
        </div>

        <div className="stat-card" style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Average Grade</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>{stats.avgGrade}/100</p>
        </div>

        <div className="stat-card" style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Attendance Rate</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>{stats.attendanceRate}%</p>
        </div>
      </div>

      <div style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
        <h3 style={{ marginBottom: '1rem' }}>Course Performance</h3>
        {courseStats.length === 0 ? (
          <p className="error-msg">No course data available</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Code</th>
                  <th>Enrolled Students</th>
                  <th>Average Grade</th>
                  <th>Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                {courseStats.map(course => (
                  <tr key={course.id}>
                    <td><strong>{course.name}</strong></td>
                    <td>{course.code}</td>
                    <td>{course.students}</td>
                    <td>{course.avgGrade}/100</td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        background: course.attendanceRate >= 80 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: course.attendanceRate >= 80 ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {course.attendanceRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
