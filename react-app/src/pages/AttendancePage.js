import React, { useState, useEffect } from 'react';
import { attendanceService, studentService, courseService } from '../firestoreService';
import '../index.css';

export default function AttendancePage({ addToast }) {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    note: ''
  });

  useEffect(() => {
    const unsubAttendance = attendanceService.subscribe((data) => {
      setAttendance(data);
      setLoading(false);
    });

    studentService.getAll().then(data => setStudents(data));
    courseService.getAll().then(data => setCourses(data));

    return () => unsubAttendance();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await attendanceService.mark(formData);
      addToast('Attendance marked successfully', 'success');
      setFormData({
        student_id: '',
        course_id: '',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        note: ''
      });
      setShowForm(false);
    } catch (err) {
      addToast('Error: ' + err.message, 'error');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      student_id: '',
      course_id: '',
      date: new Date().toISOString().split('T')[0],
      status: 'present',
      note: ''
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Attendance</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          + {showForm ? 'Cancel' : 'Mark Attendance'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Mark Attendance</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Student</label>
                <select name="student_id" value={formData.student_id} onChange={handleInputChange} className="form-control" required>
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.student_id})</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Course</label>
                <select name="course_id" value={formData.course_id} onChange={handleInputChange} className="form-control" required>
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="form-control" required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="form-control">
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                <label>Note</label>
                <input type="text" name="note" value={formData.note} onChange={handleInputChange} className="form-control" />
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">Mark</button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : attendance.length === 0 ? (
        <div className="error-msg">No attendance records found</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Date</th>
                <th>Status</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record.id}>
                  <td>{students.find(s => s.id === record.student_id)?.full_name || 'Unknown'}</td>
                  <td>{courses.find(c => c.id === record.course_id)?.name || 'Unknown'}</td>
                  <td>{record.date}</td>
                  <td><span className={`status-badge status-${record.status}`}>{record.status}</span></td>
                  <td>{record.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
