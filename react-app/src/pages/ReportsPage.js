import React, { useState, useEffect } from 'react';
import { studentService, courseService, gradeService, attendanceService } from '../firestoreService';
import '../index.css';

export default function ReportsPage({ addToast }) {
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
  const [topStudents, setTopStudents] = useState([]);

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
        ? (grades.reduce((sum, g) => sum + (g.total || 0), 0) / totalGrades).toFixed(1)
        : 0;

      const presentCount = attendance.filter(a => a.status === 'present').length;
      const totalRecords = attendance.length;
      const attendanceRate = totalRecords > 0 
        ? ((presentCount / totalRecords) * 100).toFixed(1)
        : 0;

      // Course statistics
      const courseStatsData = courses.map(course => {
        const courseGrades = grades.filter(g => g.course_id === course.id);
        const courseAvg = courseGrades.length > 0
          ? (courseGrades.reduce((sum, g) => sum + (g.total || 0), 0) / courseGrades.length).toFixed(1)
          : 0;
        
        const courseAttendance = attendance.filter(a => a.course_id === course.id);
        const coursePresent = courseAttendance.filter(a => a.status === 'present').length;
        const courseAttendanceRate = courseAttendance.length > 0
          ? ((coursePresent / courseAttendance.length) * 100).toFixed(1)
          : 0;

        return {
          id: course.id,
          name: course.name,
          code: course.code,
          students: students.length, // Simplified
          avgGrade: parseFloat(courseAvg),
          attendanceRate: parseFloat(courseAttendanceRate)
        };
      });

      // Top students calculation
      const studentAverages = students.map(student => {
        const studentGrades = grades.filter(g => g.student_id === student.id);
        const avg = studentGrades.length > 0
          ? studentGrades.reduce((sum, g) => sum + (g.total || 0), 0) / studentGrades.length
          : 0;
        return { ...student, avgGrade: avg.toFixed(1) };
      }).filter(s => s.avgGrade > 0).sort((a, b) => b.avgGrade - a.avgGrade).slice(0, 5);

      setStats({
        totalStudents: students.length,
        totalCourses: courses.length,
        totalGrades: totalGrades,
        totalAttendance: totalRecords,
        avgGrade: parseFloat(avgGrade),
        attendanceRate: parseFloat(attendanceRate)
      });

      setCourseStats(courseStatsData);
      setTopStudents(studentAverages);
      setLoading(false);
    } catch (err) {
      console.error('Error loading reports:', err);
      if (addToast) addToast('Error loading reports', 'error');
      setLoading(false);
    }
  };

  const handleExport = (type) => {
    if (addToast) {
      addToast(`Exporting ${type} report... (Feature coming soon)`, 'info');
    }
  };

  if (loading) return (
    <div className="text-center" style={{ padding: '4rem' }}>
      <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
      <p style={{ color: 'var(--text-muted)' }}>Generating comprehensive reports...</p>
    </div>
  );

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Comprehensive performance and attendance insights.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => handleExport('PDF')} title="Export as PDF">
            <i className="fas fa-file-pdf"></i> <span className="hide-mobile">Export PDF</span>
          </button>
          <button className="btn btn-secondary" onClick={() => handleExport('Excel')} title="Export as Excel">
            <i className="fas fa-file-excel"></i> <span className="hide-mobile">Export Excel</span>
          </button>
          <button className="btn btn-primary" onClick={loadReports}>
            <i className="fas fa-sync-alt"></i> <span className="hide-mobile">Refresh Data</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--info)' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Students</h4>
              <p style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{stats.totalStudents}</p>
            </div>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
              <i className="fas fa-users"></i>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary)' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Active Courses</h4>
              <p style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{stats.totalCourses}</p>
            </div>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
              <i className="fas fa-book-open"></i>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--success)' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Avg Performance</h4>
              <p style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{stats.avgGrade}<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/100</span></p>
            </div>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
              <i className="fas fa-chart-bar"></i>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--warning)' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Attendance Rate</h4>
              <p style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{stats.attendanceRate}<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>%</span></p>
            </div>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
              <i className="fas fa-calendar-check"></i>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Course Performance Table with Progress Bars */}
        <div style={{ background: 'var(--panel-bg)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)', gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className="fas fa-layer-group" style={{ color: 'var(--primary)' }}></i> Course Performance Metrics
          </h3>
          {courseStats.length === 0 ? (
            <p className="error-msg">No course data available</p>
          ) : (
            <div className="table-container" style={{ boxShadow: 'none', border: 'none', background: 'transparent' }}>
              <table>
                <thead>
                  <tr>
                    <th>Course Name</th>
                    <th>Code</th>
                    <th style={{ width: '25%' }}>Average Grade</th>
                    <th style={{ width: '25%' }}>Attendance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {courseStats.map(course => (
                    <tr key={course.id}>
                      <td><strong style={{ color: 'var(--text-main)' }}>{course.name}</strong></td>
                      <td><span style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem' }}>{course.code}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontWeight: 600, minWidth: '40px' }}>{course.avgGrade}%</span>
                          <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${course.avgGrade}%`, height: '100%', background: course.avgGrade >= 80 ? 'var(--success)' : course.avgGrade >= 60 ? 'var(--warning)' : 'var(--danger)', borderRadius: '4px' }}></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontWeight: 600, minWidth: '40px' }}>{course.attendanceRate}%</span>
                          <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${course.attendanceRate}%`, height: '100%', background: course.attendanceRate >= 80 ? 'var(--info)' : course.attendanceRate >= 60 ? 'var(--warning)' : 'var(--danger)', borderRadius: '4px' }}></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Performing Students */}
        <div style={{ background: 'var(--panel-bg)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className="fas fa-award" style={{ color: 'var(--warning)' }}></i> Student Honors List (Top 5)
          </h3>
          
          {topStudents.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No student grades recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topStudents.map((student, index) => (
                <div key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: index === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : index === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' : index === 2 ? 'linear-gradient(135deg, #b45309, #78350f)' : 'rgba(99,102,241,0.1)', color: index < 3 ? 'white' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>{student.full_name}</h4>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{student.major} • Year {student.year}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>{student.avgGrade}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Score</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Insights Generation */}
        <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'var(--shadow-md)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white' }}>
            <i className="fas fa-magic"></i> AI Insights
          </h3>
          <p style={{ lineHeight: '1.6', marginBottom: '1.5rem', opacity: 0.9 }}>
            Based on the current data, the overall system health is <strong>{stats.avgGrade >= 70 && stats.attendanceRate >= 75 ? 'Excellent' : 'Needs Attention'}</strong>. 
            With an average score of {stats.avgGrade}/100 and an attendance rate of {stats.attendanceRate}%, students are generally {stats.attendanceRate >= 80 ? 'highly engaged' : 'showing lower engagement'}.
          </p>
          <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', alignSelf: 'flex-start' }} onClick={() => handleExport('AI Analysis')}>
            <i className="fas fa-file-signature"></i> Generate Detailed Report
          </button>
        </div>

      </div>
    </div>
  );
}
