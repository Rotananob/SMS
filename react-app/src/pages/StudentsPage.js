import React, { useEffect, useState } from 'react';
import { studentService, gradeService, attendanceService, courseService } from '../firestoreService';
import '../index.css';

// Helper to convert Firestore Timestamp to readable date
const formatDate = (dateObj) => {
  if (!dateObj) return 'N/A';
  
  // If it's already a string, return it
  if (typeof dateObj === 'string') return dateObj;
  
  // If it has seconds and nanoseconds (Firestore Timestamp)
  if (dateObj.seconds !== undefined) {
    const date = new Date(dateObj.seconds * 1000);
    return date.toISOString().split('T')[0];
  }
  
  // If it's a Date object
  if (dateObj instanceof Date) {
    return dateObj.toISOString().split('T')[0];
  }
  
  return 'N/A';
};

export default function StudentsPage({ addToast }) {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null); // Deep info modal
  const [studentDetails, setStudentDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    full_name: '',
    student_id: '',
    gender: '',
    phone: '',
    major: '',
    year: 1,
    semester: '1',
    enrollmentDate: new Date().toISOString().split('T')[0],
    tuitionTotal: 1200,
    tuitionPaid: 0,
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
    if (name === 'year' || name === 'tuitionTotal' || name === 'tuitionPaid') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
        semester: '1',
        enrollmentDate: new Date().toISOString().split('T')[0],
        tuitionTotal: 1200,
        tuitionPaid: 0,
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

  const handleViewDetails = async (student) => {
    setSelectedStudent(student);
    setActiveTab('profile');
    
    try {
      const allCourses = await courseService.getAll();
      const allGrades = await gradeService.getAll();
      const allAttendance = await attendanceService.getAll();
      
      const studentGrades = allGrades.filter(g => g.student_id === student.id);
      const studentAttendance = allAttendance.filter(a => a.student_id === student.id);
      
      // Calculate GPA (approximation based on total score / 25)
      const gpa = studentGrades.length > 0 
        ? (studentGrades.reduce((sum, g) => sum + (Number(g.total) || 0), 0) / studentGrades.length / 25).toFixed(2) 
        : '0.00';
        
      // Calculate Attendance
      const presentCount = studentAttendance.filter(a => a.status === 'present').length;
      const attendanceRate = studentAttendance.length > 0
        ? ((presentCount / studentAttendance.length) * 100).toFixed(1) + '%'
        : 'N/A';
        
      // Build Courses using real data
      const studentCoursesData = studentGrades.map(g => {
        const course = allCourses.find(c => c.id === g.course_id);
        return {
          name: course ? course.name : 'Unknown Course',
          grade: g.total ? g.total.toString() : 'N/A',
          status: Number(g.total) >= 50 ? 'Completed' : 'In Progress'
        };
      });

      // Payments Real Data Mapping from Student profile
      const tuitionTotal = parseFloat(student.tuitionTotal) || 1200;
      const tuitionPaid = parseFloat(student.tuitionPaid) || 0;
      const balance = Math.max(0, tuitionTotal - tuitionPaid);
      
      setStudentDetails({
        enrollmentDate: student.enrollmentDate || new Date().toLocaleDateString(),
        tuition: {
          total: `$${tuitionTotal.toFixed(2)}`,
          paid: `$${tuitionPaid.toFixed(2)}`,
          balance: `$${balance.toFixed(2)}`,
          status: balance <= 0 ? 'Paid' : 'Partial',
          nextDueDate: balance > 0 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString() : 'N/A'
        },
        gpa: gpa,
        attendanceRate: attendanceRate,
        courses: studentCoursesData.length > 0 ? studentCoursesData : [],
        payments: tuitionPaid > 0 ? [
          { date: student.enrollmentDate || new Date().toLocaleDateString(), amount: `$${tuitionPaid.toFixed(2)}`, method: 'Bank Transfer', receipt: `#REC-${Math.floor(Math.random()*10000)}` }
        ] : []
      });
    } catch (err) {
      console.error(err);
      addToast('Error loading student details', 'error');
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
      semester: '1',
      enrollmentDate: new Date().toISOString().split('T')[0],
      tuitionTotal: 1200,
      tuitionPaid: 0,
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
                <label>Semester</label>
                <select name="semester" value={formData.semester} onChange={handleInputChange} className="form-control">
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Enrollment Date</label>
                <input type="date" name="enrollmentDate" value={formData.enrollmentDate} onChange={handleInputChange} className="form-control" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Tuition Total ($)</label>
                <input type="number" name="tuitionTotal" value={formData.tuitionTotal} onChange={handleInputChange} className="form-control" min="0" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Tuition Paid ($)</label>
                <input type="number" name="tuitionPaid" value={formData.tuitionPaid} onChange={handleInputChange} className="form-control" min="0" />
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
                    <button className="btn" style={{ padding: '0.5rem 0.75rem', background: 'rgba(14, 165, 233, 0.2)', color: 'var(--info)', marginRight: '0.5rem' }} onClick={() => handleViewDetails(student)} title="View Details">
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="btn" style={{ padding: '0.5rem 0.75rem', background: 'rgba(79, 70, 229, 0.2)', color: 'var(--primary)', marginRight: '0.5rem' }} onClick={() => handleEdit(student)} title="Edit">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn" style={{ padding: '0.5rem 0.75rem', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }} onClick={() => handleDelete(student.id)} title="Delete">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Deep Info Modal */}
      {selectedStudent && studentDetails && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '800px', background: 'var(--bg-color)' }}>
            
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', border: 'none', padding: '2rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'white', border: '3px solid rgba(255,255,255,0.5)' }}>
                  <i className="fas fa-user-graduate"></i>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'white' }}>{selectedStudent.full_name}</h2>
                  <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '1rem' }}>
                    <i className="fas fa-id-card"></i> {selectedStudent.student_id} &nbsp;|&nbsp; 
                    <i className="fas fa-graduation-cap"></i> {selectedStudent.major} (Year {selectedStudent.year}, Sem {selectedStudent.semester || '1'})
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedStudent(null)} style={{ color: 'white' }}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--panel-bg)' }}>
              <button className="btn" style={{ background: 'transparent', borderRadius: 0, borderBottom: activeTab === 'profile' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)', padding: '1rem 1.5rem', boxShadow: 'none' }} onClick={() => setActiveTab('profile')}>
                <i className="fas fa-user"></i> Profile Overview
              </button>
              <button className="btn" style={{ background: 'transparent', borderRadius: 0, borderBottom: activeTab === 'academic' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'academic' ? 'var(--primary)' : 'var(--text-muted)', padding: '1rem 1.5rem', boxShadow: 'none' }} onClick={() => setActiveTab('academic')}>
                <i className="fas fa-book-open"></i> Academic Record
              </button>
              <button className="btn" style={{ background: 'transparent', borderRadius: 0, borderBottom: activeTab === 'financial' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'financial' ? 'var(--primary)' : 'var(--text-muted)', padding: '1rem 1.5rem', boxShadow: 'none' }} onClick={() => setActiveTab('financial')}>
                <i className="fas fa-file-invoice-dollar"></i> Financials
              </button>
            </div>

            <div className="modal-body" style={{ padding: '2rem', background: 'var(--bg-secondary)', minHeight: '350px' }}>
              
              {activeTab === 'profile' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Personal Information</h4>
                    <p style={{ margin: '0.75rem 0' }}><strong style={{ display: 'inline-block', width: '120px' }}>Gender:</strong> {selectedStudent.gender}</p>
                    <p style={{ margin: '0.75rem 0' }}><strong style={{ display: 'inline-block', width: '120px' }}>Phone:</strong> {selectedStudent.phone || 'N/A'}</p>
                    <p style={{ margin: '0.75rem 0' }}><strong style={{ display: 'inline-block', width: '120px' }}>Status:</strong> 
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', background: selectedStudent.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: selectedStudent.status === 'active' ? 'var(--success)' : 'var(--danger)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                        {selectedStudent.status.toUpperCase()}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Institution Details</h4>
                    <p style={{ margin: '0.75rem 0' }}><strong style={{ display: 'inline-block', width: '120px' }}>Enrollment Date:</strong> {studentDetails.enrollmentDate}</p>
                    <p style={{ margin: '0.75rem 0' }}><strong style={{ display: 'inline-block', width: '120px' }}>Current GPA:</strong> <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{studentDetails.gpa}</span></p>
                    <p style={{ margin: '0.75rem 0' }}><strong style={{ display: 'inline-block', width: '120px' }}>Attendance:</strong> {studentDetails.attendanceRate}</p>
                  </div>
                </div>
              )}

              {activeTab === 'academic' && (
                <div>
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Course Enrollment & Grades</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--panel-bg)', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead style={{ background: 'rgba(99,102,241,0.1)' }}>
                      <tr>
                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--primary)' }}>Course Name</th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--primary)' }}>Status</th>
                        <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--primary)' }}>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentDetails.courses.map((c, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem' }}>{c.name}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ fontSize: '0.85rem', color: c.status === 'Completed' ? 'var(--success)' : 'var(--warning)' }}>{c.status}</span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>{c.grade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'financial' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ background: 'var(--panel-bg)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Total Tuition</p>
                      <h3 style={{ margin: 0, color: 'var(--text-main)' }}>{studentDetails.tuition.total}</h3>
                    </div>
                    <div style={{ background: 'var(--panel-bg)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Paid Amount</p>
                      <h3 style={{ margin: 0, color: 'var(--success)' }}>{studentDetails.tuition.paid}</h3>
                    </div>
                    <div style={{ background: 'var(--panel-bg)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--danger)' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--danger)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Balance Due</p>
                      <h3 style={{ margin: 0, color: 'var(--danger)' }}>{studentDetails.tuition.balance}</h3>
                    </div>
                    <div style={{ background: 'var(--panel-bg)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Next Due Date</p>
                      <h3 style={{ margin: 0, color: 'var(--warning)', fontSize: '1rem', marginTop: '0.5rem' }}>{studentDetails.tuition.nextDueDate}</h3>
                    </div>
                  </div>

                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Payment History</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--panel-bg)', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead style={{ background: 'rgba(99,102,241,0.1)' }}>
                      <tr>
                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--primary)' }}>Date</th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--primary)' }}>Receipt No.</th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--primary)' }}>Method</th>
                        <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--primary)' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentDetails.payments.map((p, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem' }}>{formatDate(p.date)}</td>
                          <td style={{ padding: '1rem', color: 'var(--info)' }}>{p.receipt}</td>
                          <td style={{ padding: '1rem' }}>{p.method}</td>
                          <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--success)' }}>{p.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ background: 'var(--panel-bg)' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedStudent(null)}>Close Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
