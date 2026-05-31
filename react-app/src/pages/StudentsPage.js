import React, { useEffect, useState } from 'react';
import { studentsAPI } from '../api';
import '../index.css';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    student_id: '',
    full_name: '',
    gender: '',
    phone: '',
    major: '',
    year: 1
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll();
      setStudents(response.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await studentsAPI.delete(id);
        fetchStudents();
        alert('Student deleted');
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Students</h1>
        <button className="btn btn-primary">+ Add Student</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Major</th>
                <th>Year</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.student_id}</td>
                  <td>{student.full_name}</td>
                  <td>{student.phone}</td>
                  <td>{student.major}</td>
                  <td>{student.year}</td>
                  <td><span className={`status-badge status-${student.status}`}>{student.status}</span></td>
                  <td>
                    <button className="action-btn edit">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(student.id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
