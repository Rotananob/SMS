import React, { useState, useEffect } from 'react';
import { gradesAPI } from '../api';
import '../index.css';

export default function GradesPage() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await gradesAPI.getAll({});
      setGrades(response.data);
    } catch (err) {
      console.error('Failed to fetch grades:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Grades</h1>
        <button className="btn btn-primary">+ Add Grade</button>
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
                <th>Assignment</th>
                <th>Midterm</th>
                <th>Final</th>
                <th>Total</th>
                <th>Letter</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade, idx) => (
                <tr key={idx}>
                  <td>{grade.student_id}</td>
                  <td>{grade.course_id}</td>
                  <td>{grade.assignment}</td>
                  <td>{grade.midterm}</td>
                  <td>{grade.final}</td>
                  <td>{grade.total}</td>
                  <td><strong>{grade.letter}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
