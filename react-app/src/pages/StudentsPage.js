import React, { useEffect, useState } from 'react';
import { studentService } from '../firestoreService';
import '../index.css';

export default function StudentsPage({ addToast }) {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    student_id: '',
    gender: '',
    phone: '',
    major: '',
    year: 1,
    status: 'active'
  });

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = studentService.subscribe((data) => {
      setStudents(data);
      setFilteredStudents(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter students based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredStudents(
        students.filter(student =>
          student.full_name?.toLowerCase().includes(term) ||
          student.student_id?.toLowerCase().includes(term) ||
          student.phone?.toLowerCase().includes(term) ||
          student.major?.toLowerCase().includes(term) ||
          student.email?.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, students]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await studentService.update(editingId, formData);
        addToast('Student updated successfully', 'success');
        setEditingId(null);
      } else {
        await studentService.create(formData);
        addToast('Student created successfully', 'success');
      }
      setFormData({
        full_name: '',
        student_id: '',
        gender: '',
        phone: '',
        major: '',
        year: 1,
        status: 'active'
      });
      setShowForm(false);
    } catch (err) {
      addToast('Error: ' + err.message, 'error');
    }
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setFormData(student);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentService.delete(id);
        addToast('Student deleted successfully', 'success');
      } catch (err) {
        addToast('Delete failed: ' + err.message, 'error');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      full_name: '',
      student_id: '',
      gender: '',
      phone: '',
      major: '',
      year: 1,
      status: 'active'
    });
  };

  const handleRefresh = () => {
    setLoading(true);
    studentService.subscribe((data) => {
      setStudents(data);
      setFilteredStudents(data);
      setLoading(false);
      addToast('Data refreshed successfully', 'success');
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Students</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={handleRefresh} title="Refresh Data">
            <i className="fas fa-sync-alt"></i>
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            + {showForm ? 'Cancel' : 'Add Student'}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <i className="fas fa-search" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}></i>
          <input
            type="text"
            placeholder="Search by name, student ID, phone, or major..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '2.75rem' }}
          />
        </div>
      </div>

      {showForm && (
        <div style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1rem' }}>{editingId ? 'Edit Student' : 'Add New Student'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Full Name</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} className="form-control" required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Student ID</label>
                <input type="text" name="student_id" value={formData.student_id} onChange={handleInputChange} className="form-control" required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="form-control">
                  <option>Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="form-control" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Major</label>
                <input type="text" name="major" value={formData.major} onChange={handleInputChange} className="form-control" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Year</label>
                <input type="number" name="year" value={formData.year} onChange={handleInputChange} className="form-control" min="1" max="4" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="form-control">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'}</button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : filteredStudents.length === 0 ? (
        <div className="error-msg">
          {searchTerm ? `No students found matching "${searchTerm}"` : 'No students found'}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Major</th>
                <th>Year</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.student_id}</td>
                  <td>{student.full_name}</td>
                  <td>{student.phone}</td>
                  <td>{student.major}</td>
                  <td>{student.year}</td>
                  <td><span style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', background: student.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: student.status === 'active' ? 'var(--success)' : 'var(--danger)', fontSize: '0.85rem' }}>{student.status}</span></td>
                  <td>
                    <button className="btn" style={{ padding: '0.5rem 0.75rem', background: 'rgba(79, 70, 229, 0.2)', color: 'var(--primary)', marginRight: '0.5rem' }} onClick={() => handleEdit(student)}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn" style={{ padding: '0.5rem 0.75rem', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }} onClick={() => handleDelete(student.id)}>
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
