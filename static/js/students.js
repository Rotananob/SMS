const Students = {
  data: [],

  async getHTML() {
    return `
      <div class="page-header">
        <h2 class="page-title">Student Directory</h2>
        <button class="btn btn-primary" onclick="Students.showAddModal()">
          <i class="fas fa-plus"></i> Add Student
        </button>
      </div>
      <div class="search-box">
        <input type="text" id="student-search" placeholder="Search by name, ID, or major..." class="form-control">
      </div>
      <div class="table-container glass" id="students-table-container">
        <div class="text-center" style="padding: 40px;"><div class="spinner" style="margin: 0 auto;"></div></div>
      </div>
    `;
  },

  async initEvents() {
    await this.loadData();
    
    const searchBox = document.getElementById('student-search');
    if (searchBox) {
      searchBox.addEventListener('input', () => this.filterTable());
    }
  },

  async loadData() {
    try {
      this.data = await API.getStudents();
      this.renderTable();
    } catch (err) {
      App.toast('Failed to load students: ' + err.message, 'error');
    }
  },

  filterTable() {
    const query = document.getElementById('student-search')?.value.toLowerCase() || '';
    const filtered = this.data.filter(s => 
      s.full_name.toLowerCase().includes(query) ||
      s.student_id.toLowerCase().includes(query) ||
      (s.major || '').toLowerCase().includes(query)
    );
    this.renderTable(filtered);
  },

  renderTable(students = null) {
    const container = document.getElementById('students-table-container');
    if (!container) return;

    const dataToRender = students || this.data;

    if (!dataToRender.length) {
      container.innerHTML = `<div class="text-center text-muted" style="padding: 40px;">No students found.</div>`;
      return;
    }

    let rows = dataToRender.map(s => `
      <tr>
        <td><strong>${s.student_id}</strong></td>
        <td>${s.full_name}</td>
        <td>${s.major || '-'}</td>
        <td>Year ${s.year}</td>
        <td><span class="status-badge ${s.status === 'active' ? 'status-active' : 'status-inactive'}">${s.status}</span></td>
        <td>
          <button class="action-btn edit" onclick="Students.showEditModal(${s.id})" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete" onclick="Students.deleteStudent(${s.id})" title="Delete"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');

    container.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Major</th>
            <th>Year</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  getFormHTML(student = null) {
    return `
      <form id="student-form">
        <div class="form-group">
          <label>Student ID</label>
          <input type="text" class="form-control" id="s_id" value="${student?.student_id || ''}" required>
        </div>
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" class="form-control" id="s_name" value="${student?.full_name || ''}" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Date of Birth</label>
            <input type="date" class="form-control" id="s_dob" value="${student?.dob || ''}">
          </div>
          <div class="form-group">
            <label>Gender</label>
            <select class="form-control" id="s_gender">
              <option value="">Select Gender</option>
              <option value="Male" ${student?.gender === 'Male' ? 'selected' : ''}>Male</option>
              <option value="Female" ${student?.gender === 'Female' ? 'selected' : ''}>Female</option>
              <option value="Other" ${student?.gender === 'Other' ? 'selected' : ''}>Other</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" class="form-control" id="s_phone" value="${student?.phone || ''}">
          </div>
          <div class="form-group">
            <label>Major</label>
            <input type="text" class="form-control" id="s_major" value="${student?.major || ''}">
          </div>
        </div>
        <div class="form-group">
          <label>Address</label>
          <textarea class="form-control" id="s_address" rows="2">${student?.address || ''}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Year</label>
            <select class="form-control" id="s_year">
              <option value="1" ${student?.year === 1 ? 'selected' : ''}>Year 1</option>
              <option value="2" ${student?.year === 2 ? 'selected' : ''}>Year 2</option>
              <option value="3" ${student?.year === 3 ? 'selected' : ''}>Year 3</option>
              <option value="4" ${student?.year === 4 ? 'selected' : ''}>Year 4</option>
            </select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select class="form-control" id="s_status">
              <option value="active" ${student?.status === 'active' ? 'selected' : ''}>Active</option>
              <option value="inactive" ${student?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
              <option value="graduated" ${student?.status === 'graduated' ? 'selected' : ''}>Graduated</option>
            </select>
          </div>
        </div>
      </form>
    `;
  },


  showAddModal() {
    App.openModal('Add New Student', this.getFormHTML(), `
      <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
      <button type="button" class="btn btn-primary" onclick="Students.saveStudent()">Add Student</button>
    `);
  },

  showEditModal(id) {
    const student = this.data.find(s => s.id === id);
    if (!student) return;
    
    App.openModal('Edit Student', this.getFormHTML(student), `
      <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
      <button type="button" class="btn btn-primary" onclick="Students.saveStudent(${id})">Save Changes</button>
    `);
  },

  async saveStudent(id = null) {
    const formData = {
      student_id: document.getElementById('s_id').value,
      full_name: document.getElementById('s_name').value,
      dob: document.getElementById('s_dob').value || null,
      gender: document.getElementById('s_gender').value || null,
      phone: document.getElementById('s_phone').value || null,
      address: document.getElementById('s_address').value || null,
      major: document.getElementById('s_major').value || null,
      year: parseInt(document.getElementById('s_year').value),
      status: document.getElementById('s_status').value,
    };

    if (!formData.student_id || !formData.full_name) {
      App.toast('Please fill in all required fields', 'error');
      return;
    }

    try {
      if (id) {
        // Add user_id if not editing
        await API.updateStudent(id, formData);
        App.toast('Student updated successfully', 'success');
      } else {
        formData.user_id = App.user.id; // Set user_id for new students
        await API.createStudent(formData);
        App.toast('Student added successfully', 'success');
      }
      App.closeModal();
      await this.loadData();
    } catch (err) {
      App.toast('Error saving student: ' + err.message, 'error');
    }
  },

  async deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      await API.deleteStudent(id);
      App.toast('Student deleted successfully', 'success');
      await this.loadData();
    } catch (err) {
      App.toast('Error deleting student: ' + err.message, 'error');
    }
  }
};

