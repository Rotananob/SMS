const Grades = {
  courses: [],
  students: [],
  grades: {},

  async getHTML() {
    return `
      <div class="page-header">
        <h2 class="page-title">Gradebook</h2>
      </div>
      
      <div class="glass" style="padding: 24px; border-radius: var(--radius); margin-bottom: 24px;">
        <div class="form-group" style="margin: 0; max-width: 400px;">
          <label>Select Course</label>
          <select id="grade_course" class="form-control" onchange="Grades.loadGrades()"></select>
        </div>
      </div>
      
      <div class="table-container glass" id="grades-table-container">
        <div class="text-center" style="padding: 40px; color: var(--text-muted);">Please select a course to view grades.</div>
      </div>
    `;
  },

  async initEvents() {
    try {
      this.courses = await API.getCourses();
      this.students = await API.getStudents();

      const courseSelect = document.getElementById('grade_course');
      if (courseSelect) {
        courseSelect.innerHTML = `<option value="">-- Select Course --</option>` + 
          this.courses.map(c => `<option value="${c.id}">${c.code} - ${c.name}</option>`).join('');
      }
    } catch (err) {
      App.toast('Failed to load courses/students: ' + err.message, 'error');
    }
  },

  async loadGrades() {
    const courseId = document.getElementById('grade_course').value;
    const container = document.getElementById('grades-table-container');

    if (!courseId) {
      container.innerHTML = `<div class="text-center" style="padding: 40px; color: var(--text-muted);">Please select a course to view grades.</div>`;
      return;
    }

    container.innerHTML = `<div class="text-center" style="padding: 40px;"><div class="spinner" style="margin: 0 auto;"></div></div>`;

    try {
      const grades = await API.getGrades({ courseId });
      this.grades = grades;
      this.renderTable(courseId);
    } catch (err) {
      App.toast('Failed to load grades: ' + err.message, 'error');
    }
  },

  renderTable(courseId) {
    const container = document.getElementById('grades-table-container');
    const gradesMap = {};
    
    this.grades.forEach(g => {
      gradesMap[g.student_id] = g;
    });

    let rows = this.students.map(s => {
      const grade = gradesMap[s.id] || {};
      return `
        <tr>
          <td>${s.student_id}</td>
          <td>${s.full_name}</td>
          <td>
            <input type="number" class="form-control grade-input" style="max-width: 80px;" 
                   value="${grade.assignment || 0}" data-student-id="${s.id}" data-type="assignment" 
                   onchange="Grades.updateGrade(${s.id}, ${courseId}, this)" min="0" max="100">
          </td>
          <td>
            <input type="number" class="form-control grade-input" style="max-width: 80px;" 
                   value="${grade.midterm || 0}" data-student-id="${s.id}" data-type="midterm" 
                   onchange="Grades.updateGrade(${s.id}, ${courseId}, this)" min="0" max="100">
          </td>
          <td>
            <input type="number" class="form-control grade-input" style="max-width: 80px;" 
                   value="${grade.final || 0}" data-student-id="${s.id}" data-type="final" 
                   onchange="Grades.updateGrade(${s.id}, ${courseId}, this)" min="0" max="100">
          </td>
          <td><strong>${grade.total || 0}</strong></td>
          <td><span class="status-badge" style="background: ${this.getLetterColor(grade.letter)}">${grade.letter || '-'}</span></td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Assignment</th>
            <th>Midterm</th>
            <th>Final</th>
            <th>Total</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  getLetterColor(letter) {
    const colors = {
      'A+': 'rgba(16, 185, 129, 0.2)', 'A': 'rgba(16, 185, 129, 0.2)', 'A-': 'rgba(16, 185, 129, 0.2)',
      'B+': 'rgba(59, 130, 246, 0.2)', 'B': 'rgba(59, 130, 246, 0.2)', 'B-': 'rgba(59, 130, 246, 0.2)',
      'C+': 'rgba(245, 158, 11, 0.2)', 'C': 'rgba(245, 158, 11, 0.2)',
      'D': 'rgba(239, 68, 68, 0.2)', 'F': 'rgba(239, 68, 68, 0.2)'
    };
    return colors[letter] || 'rgba(255, 255, 255, 0.1)';
  },

  async updateGrade(studentId, courseId, input) {
    // Collect all grades for this student
    const row = input.closest('tr');
    const assignment = parseFloat(row.querySelectorAll('input')[0].value) || 0;
    const midterm = parseFloat(row.querySelectorAll('input')[1].value) || 0;
    const final = parseFloat(row.querySelectorAll('input')[2].value) || 0;

    try {
      const result = await API.saveGrade({
        student_id: studentId,
        course_id: courseId,
        assignment: assignment,
        midterm: midterm,
        final: final
      });
      
      // Update total and letter grade display
      row.querySelectorAll('strong')[0].textContent = result.total;
      const badge = row.querySelectorAll('.status-badge')[0];
      badge.textContent = result.letter;
      badge.style.background = this.getLetterColor(result.letter);
    } catch (err) {
      App.toast('Error updating grade: ' + err.message, 'error');
    }
  }
};
