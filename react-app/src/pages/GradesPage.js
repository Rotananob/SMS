import React, { useState, useEffect } from 'react';
import { gradeService, studentService, courseService } from '../firestoreService';
import '../index.css';

export default function GradesPage({ addToast }) {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    assignment: 0,
    midterm: 0,
    final: 0
  });

  useEffect(() => {
    const unsubGrades = gradeService.subscribe((data) => {
      setGrades(data);
      setLoading(false);
    });

    studentService.getAll().then(data => setStudents(data));
    courseService.getAll().then(data => setCourses(data));

    return () => unsubGrades();
  }, []);

  const calculateTotal = () => {
    const { assignment, midterm, final } = formData;
    return (assignment * 0.3 + midterm * 0.3 + final * 0.4).toFixed(2);
  };

  const getLetterGrade = (total) => {
    if (total >= 90) return 'A';
    if (total >= 80) return 'B';
    if (total >= 70) return 'C';
    if (total >= 60) return 'D';
    return 'F';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (['student_id', 'course_id'].includes(name)) {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const total = parseFloat(calculateTotal());
      const letter = getLetterGrade(total);
      
      if (editingId) {
        await gradeService.update(editingId, { ...formData, total, letter });
        addToast('Grade updated successfully', 'success');
        setEditingId(null);
      } else {
        await gradeService.create({ ...formData, total, letter });
        addToast('Grade created successfully', 'success');
      }
      
      setFormData({
        student_id: '',
        course_id: '',
        assignment: 0,
        midterm: 0,
        final: 0
      });
      setShowForm(false);
    } catch (err) {
      addToast('Error: ' + err.message, 'error');
    }
  };

  const handleEdit = (grade) => {
    setEditingId(grade.id);
    setFormData(grade);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      student_id: '',
      course_id: '',
      assignment: 0,
      midterm: 0,
      final: 0
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Grades</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          + {showForm ? 'Cancel' : 'Add Grade'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1rem' }}>{editingId ? 'Edit Grade' : 'Add New Grade'}</h3>
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
                <label>Assignment (30%)</label>
                <input type="number" name="assignment" value={formData.assignment} onChange={handleInputChange} className="form-control" min="0" max="100" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Midterm (30%)</label>
                <input type="number" name="midterm" value={formData.midterm} onChange={handleInputChange} className="form-control" min="0" max="100" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Final (40%)</label>
                <input type="number" name="final" value={formData.final} onChange={handleInputChange} className="form-control" min="0" max="100" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Total Score</label>
                <input type="text" value={calculateTotal()} readOnly className="form-control" style={{ background: 'var(--bg-secondary)' }} />
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
      ) : grades.length === 0 ? (
        <div className="error-msg">No grades found</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Assignment</th>
                <th>Midterm</th>
                <th>Final</th>
                <th>Total</th>
                <th>Letter</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade) => (
                <tr key={grade.id}>
                  <td>{students.find(s => s.id === grade.student_id)?.full_name || 'Unknown'}</td>
                  <td>{courses.find(c => c.id === grade.course_id)?.name || 'Unknown'}</td>
                  <td>{grade.assignment}</td>
                  <td>{grade.midterm}</td>
                  <td>{grade.final}</td>
                  <td>{grade.total}</td>
                  <td><strong>{grade.letter}</strong></td>
                  <td>
                    <button className="btn" style={{ padding: '0.5rem 0.75rem', background: 'rgba(79, 70, 229, 0.2)', color: 'var(--primary)' }} onClick={() => handleEdit(grade)}>
                      <i className="fas fa-edit"></i>
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
