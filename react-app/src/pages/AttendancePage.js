import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../api';
import '../index.css';

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ course_id: '', student_id: '' });

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await attendanceAPI.getAll(filters);
      setAttendance(response.data);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Attendance</h1>
        <button className="btn btn-primary">+ Mark Attendance</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Course ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record, idx) => (
                <tr key={idx}>
                  <td>{record.student_id}</td>
                  <td>{record.course_id}</td>
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
