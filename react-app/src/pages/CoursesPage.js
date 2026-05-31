import React, { useState, useEffect } from 'react';
import { courseService } from '../firestoreService';
import '../index.css';

export default function CoursesPage({ addToast }) {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: 3,
    semester: 1,
    room: '',
    max_students: 30,
    instructor: ''
  });

  useEffect(() => {
    const unsubscribe = courseService.subscribe((data) => {
      setCourses(data);
      setFilteredCourses(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter courses based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredCourses(
        courses.filter(course =>
          course.code?.toLowerCase().includes(term) ||
          course.name?.toLowerCase().includes(term) ||
          course.instructor?.toLowerCase().includes(term) ||
          course.room?.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, courses]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: isNaN(value) ? value : parseInt(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await courseService.update(editingId, formData);
        addToast('Course updated successfully', 'success');
        setEditingId(null);
      } else {
        await courseService.create(formData);
        addToast('Course created successfully', 'success');
      }
      setFormData({
        code: '',
        name: '',
        credits: 3,
        semester: 1,
        room: '',
        max_students: 30,
        instructor: ''
      });
      setShowForm(false);
    } catch (err) {
      addToast('Error: ' + err.message, 'error');
    }
  };

  const handleEdit = (course) => {
    setEditingId(course.id);
    setFormData(course);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await courseService.delete(id);
        addToast('Course deleted successfully', 'success');
      } catch (err) {
        addToast('Delete failed: ' + err.message, 'error');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      code: '',
      name: '',
      credits: 3,
      semester: 1,
      room: '',
      max_students: 30,
      instructor: ''
    });
  };

  const handleRefresh = () => {
    setLoading(true);
    courseService.subscribe((data) => {
      setCourses(data);
      setFilteredCourses(data);
      setLoading(false);
      addToast('Data refreshed successfully', 'success');
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Courses</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={handleRefresh} title="Refresh Data">
            <i className="fas fa-sync-alt"></i>
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            + {showForm ? 'Cancel' : 'Add Course'}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <i className="fas fa-search" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}></i>
          <input
            type="text"
            placeholder="Search by code, name, instructor, or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '2.75rem' }}
          />
        </div>
      </div>

      {showForm && (
        <div style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1rem' }}>{editingId ? 'Edit Course' : 'Add New Course'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Course Code</label>
                <input type="text" name="code" value={formData.code} onChange={handleInputChange} className="form-control" required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Course Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-control" required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Credits</label>
                <input type="number" name="credits" value={formData.credits} onChange={handleInputChange} className="form-control" min="1" max="6" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Semester</label>
                <input type="number" name="semester" value={formData.semester} onChange={handleInputChange} className="form-control" min="1" max="8" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Room</label>
                <input type="text" name="room" value={formData.room} onChange={handleInputChange} className="form-control" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Max Students</label>
                <input type="number" name="max_students" value={formData.max_students} onChange={handleInputChange} className="form-control" min="1" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Instructor</label>
                <input type="text" name="instructor" value={formData.instructor} onChange={handleInputChange} className="form-control" />
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
      ) : filteredCourses.length === 0 ? (
        <div className="error-msg">
          {searchTerm ? `No courses found matching "${searchTerm}"` : 'No courses found'}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Credits</th>
                <th>Semester</th>
                <th>Room</th>
                <th>Max Students</th>
                <th>Instructor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map(course => (
                <tr key={course.id}>
                  <td>{course.code}</td>
                  <td>{course.name}</td>
                  <td>{course.credits}</td>
                  <td>{course.semester}</td>
                  <td>{course.room}</td>
                  <td>{course.max_students}</td>
                  <td>{course.instructor}</td>
                  <td>
                    <button className="btn" style={{ padding: '0.5rem 0.75rem', background: 'rgba(79, 70, 229, 0.2)', color: 'var(--primary)', marginRight: '0.5rem' }} onClick={() => handleEdit(course)}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn" style={{ padding: '0.5rem 0.75rem', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }} onClick={() => handleDelete(course.id)}>
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
