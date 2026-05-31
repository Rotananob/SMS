const Attendance = {
  courses: [],
  students: [],
  records: {},

  async getHTML() {
    return `
      <div class="page-header">
        <h2 class="page-title">Attendance Management</h2>
      </div>
      
      <div class="glass" style="padding: 24px; border-radius: var(--radius); margin-bottom: 24px;">
        <div style="display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap;">
          <div class="form-group" style="margin: 0; flex: 1; min-width: 200px;">
            <label>Select Course</label>
            <select id="att_course" class="form-control" onchange="Attendance.loadRecords()"></select>
          </div>
          <div class="form-group" style="margin: 0; flex: 1; min-width: 200px;">
            <label>Date</label>
            <input type="date" id="att_date" class="form-control" onchange="Attendance.loadRecords()">
          </div>
          <button class="btn btn-primary" onclick="Attendance.saveAll()" style="height: 46px;">
            <i class="fas fa-save"></i> Save Attendance
          </button>
        </div>
      </div>
      
      <div class="table-container glass" id="attendance-table-container">
        <div class="text-center" style="padding: 40px; color: var(--text-muted);">Please select a course to view attendance sheet.</div>
      </div>
    `;
  },

  async initEvents() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('att_date').value = today;
    
    try {
      this.courses = await API.getCourses();
      this.students = await API.getStudents();
      
      const courseSelect = document.getElementById('att_course');
      if (courseSelect) {
        courseSelect.innerHTML = `<option value="">-- Select Course --</option>` + 
          this.courses.map(c => `<option value="${c.id}">${c.code} - ${c.name}</option>`).join('');
      }
    } catch (err) {
      App.toast('Failed to load courses/students: ' + err.message, 'error');
    }
  },

  async loadRecords() {
    const courseId = document.getElementById('att_course').value;
    if (!courseId) {
      document.getElementById('attendance-table-container').innerHTML = 
        `<div class="text-center" style="padding: 40px; color: var(--text-muted);">Please select a course to view attendance sheet.</div>`;
      return;
    }

    const date = document.getElementById('att_date').value;
    const container = document.getElementById('attendance-table-container');
    container.innerHTML = `<div class="text-center" style="padding: 40px;"><div class="spinner" style="margin: 0 auto;"></div></div>`;

    try {
      const records = await API.getAttendance({ courseId, date });
      this.records = records;
      this.renderTable(courseId, date);
    } catch (err) {
      App.toast('Failed to load attendance: ' + err.message, 'error');
    }
  },

  renderTable(courseId, date) {
    const container = document.getElementById('attendance-table-container');
    const recordsMap = {};
    
    this.records.forEach(r => {
      recordsMap[r.student_id] = r;
    });

    let rows = this.students.map(s => {
      const record = recordsMap[s.id];
      const status = record?.status || 'present';
      
      return `
        <tr>
          <td>${s.student_id}</td>
          <td>${s.full_name}</td>
          <td>
            <select class="form-control" style="width: 120px;" data-student-id="${s.id}">
              <option value="present" ${status === 'present' ? 'selected' : ''}>Present</option>
              <option value="absent" ${status === 'absent' ? 'selected' : ''}>Absent</option>
              <option value="late" ${status === 'late' ? 'selected' : ''}>Late</option>
              <option value="excused" ${status === 'excused' ? 'selected' : ''}>Excused</option>
            </select>
          </td>
          <td>
            <input type="text" class="form-control" placeholder="Note..." value="${record?.note || ''}" 
                   data-student-id="${s.id}" data-note="1">
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Status</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  async saveAll() {
    const courseId = document.getElementById('att_course').value;
    const date = document.getElementById('att_date').value;
    
    if (!courseId) {
      App.toast('Please select a course', 'error');
      return;
    }

    const records = [];
    document.querySelectorAll('table tbody tr').forEach(row => {
      const studentId = row.querySelector('select').dataset.studentId;
      const status = row.querySelector('select').value;
      const note = row.querySelector('[data-note]').value;
      
      records.push({
        student_id: parseInt(studentId),
        course_id: parseInt(courseId),
        date: date,
        status: status,
        note: note
      });
    });

    try {
      await API.markAttendance(records);
      App.toast('Attendance saved successfully!', 'success');
    } catch (err) {
      App.toast('Error saving attendance: ' + err.message, 'error');
    }
  }
};
