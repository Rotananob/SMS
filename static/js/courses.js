const Courses = {
  data: [],

  async getHTML() {
    return `
      <div class="page-header">
        <h2 class="page-title">Course Catalog</h2>
        <button class="btn btn-primary" onclick="Courses.showAddModal()">
          <i class="fas fa-plus"></i> Add Course
        </button>
      </div>
      <div class="search-box">
        <input type="text" id="course-search" placeholder="Search by name or code..." class="form-control">
      </div>
      <div class="table-container glass" id="courses-table-container">
        <div class="text-center" style="padding: 40px;"><div class="spinner" style="margin: 0 auto;"></div></div>
      </div>
    `;
  },

  async initEvents() {
    await this.loadData();
    
    const searchBox = document.getElementById('course-search');
    if (searchBox) {
      searchBox.addEventListener('input', () => this.filterTable());
    }
  },

  async loadData() {
    try {
      this.data = await API.getCourses();
      this.renderTable();
    } catch (err) {
      App.toast('Failed to load courses: ' + err.message, 'error');
    }
  },

  filterTable() {
    const query = document.getElementById('course-search')?.value.toLowerCase() || '';
    const filtered = this.data.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query)
    );
    this.renderTable(filtered);
  },

  renderTable(courses = null) {
    const container = document.getElementById('courses-table-container');
    if (!container) return;

    const dataToRender = courses || this.data;

    if (!dataToRender.length) {
      container.innerHTML = `<div class="text-center text-muted" style="padding: 40px;">No courses found.</div>`;
      return;
    }

    let rows = dataToRender.map(c => `
      <tr>
        <td><strong>${c.code}</strong></td>
        <td>${c.name}</td>
        <td>${c.credits || 3}</td>
        <td>${c.semester || '-'} / ${c.year || '-'}</td>
        <td>${c.room || '-'}</td>
        <td>
          <button class="action-btn edit" onclick="Courses.showEditModal(${c.id})" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete" onclick="Courses.deleteCourse(${c.id})" title="Delete"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');

    container.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Credits</th>
            <th>Term</th>
            <th>Room</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  getFormHTML(course = null) {
    return `
      <form id="course-form">
        <div class="form-row">
          <div class="form-group">
            <label>Course Code</label>
            <input type="text" class="form-control" id="c_code" value="${course?.code || ''}" required>
          </div>
          <div class="form-group">
            <label>Credits</label>
            <input type="number" class="form-control" id="c_credits" value="${course?.credits || 3}" min="1" max="6">
          </div>
        </div>
        <div class="form-group">
          <label>Course Name</label>
          <input type="text" class="form-control" id="c_name" value="${course?.name || ''}" required>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea class="form-control" id="c_desc" rows="3">${course?.description || ''}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Semester</label>
            <select class="form-control" id="c_semester">
              <option value="">Select Semester</option>
              <option value="Spring" ${course?.semester === 'Spring' ? 'selected' : ''}>Spring</option>
              <option value="Fall" ${course?.semester === 'Fall' ? 'selected' : ''}>Fall</option>
              <option value="Summer" ${course?.semester === 'Summer' ? 'selected' : ''}>Summer</option>
            </select>
          </div>
          <div class="form-group">
            <label>Year</label>
            <input type="number" class="form-control" id="c_year" value="${course?.year || new Date().getFullYear()}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Schedule</label>
            <input type="text" class="form-control" id="c_schedule" value="${course?.schedule || ''}" placeholder="e.g., Mon/Wed 10-11am">
          </div>
          <div class="form-group">
            <label>Room</label>
            <input type="text" class="form-control" id="c_room" value="${course?.room || ''}">
          </div>
        </div>
        <div class="form-group">
          <label>Max Students</label>
          <input type="number" class="form-control" id="c_max" value="${course?.max_students || 40}" min="1">
        </div>
      </form>
    `;
  },

  showAddModal() {
    App.openModal('Add New Course', this.getFormHTML(), `
      <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
      <button type="button" class="btn btn-primary" onclick="Courses.saveCourse()">Add Course</button>
    `);
  },

  showEditModal(id) {
    const course = this.data.find(c => c.id === id);
    if (!course) return;
    
    App.openModal('Edit Course', this.getFormHTML(course), `
      <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
      <button type="button" class="btn btn-primary" onclick="Courses.saveCourse(${id})">Save Changes</button>
    `);
  },

  async saveCourse(id = null) {
    const formData = {
      code: document.getElementById('c_code').value,
      name: document.getElementById('c_name').value,
      description: document.getElementById('c_desc').value || null,
      credits: parseInt(document.getElementById('c_credits').value) || 3,
      semester: document.getElementById('c_semester').value || null,
      year: parseInt(document.getElementById('c_year').value) || null,
      schedule: document.getElementById('c_schedule').value || null,
      room: document.getElementById('c_room').value || null,
      max_students: parseInt(document.getElementById('c_max').value) || 40,
    };

    if (!formData.code || !formData.name) {
      App.toast('Please fill in all required fields', 'error');
      return;
    }

    try {
      if (id) {
        await API.updateCourse(id, formData);
        App.toast('Course updated successfully', 'success');
      } else {
        await API.createCourse(formData);
        App.toast('Course added successfully', 'success');
      }
      App.closeModal();
      await this.loadData();
    } catch (err) {
      App.toast('Error saving course: ' + err.message, 'error');
    }
  },

  async deleteCourse(id) {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await API.deleteCourse(id);
      App.toast('Course deleted successfully', 'success');
      await this.loadData();
    } catch (err) {
      App.toast('Error deleting course: ' + err.message, 'error');
    }
  }
};

