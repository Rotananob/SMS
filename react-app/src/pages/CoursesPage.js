import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../api';
import '../index.css';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAll();
      setCourses(response.data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await coursesAPI.delete(id);
        fetchCourses();
        alert('Course deleted');
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Courses</h1>
        <button className="btn btn-primary">+ Add Course</button>
      </div>

      {loading ? (
        <p>Loading...</p>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td>{course.code}</td>
                  <td>{course.name}</td>
                  <td>{course.credits}</td>
                  <td>{course.semester}</td>
                  <td>{course.room}</td>
                  <td>{course.max_students}</td>
                  <td>
                    <button className="action-btn edit">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(course.id)}>
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
