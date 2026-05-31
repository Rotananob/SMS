const Notifications = {
  data: [],

  async getHTML() {
    return `
      <div class="page-header">
        <h2 class="page-title">Notifications</h2>
        <button class="btn btn-primary" onclick="Notifications.showAddModal()">
          <i class="fas fa-plus"></i> New Alert
        </button>
      </div>
      <div id="notif-list" style="display: flex; flex-direction: column; gap: 16px;">
        <div class="text-center" style="padding: 40px;"><div class="spinner" style="margin: 0 auto;"></div></div>
      </div>
    `;
  },

  async initEvents() {
    await this.loadNotifications();
  },

  async loadNotifications() {
    try {
      this.data = await API.getNotifications();
      this.renderList();
      this.updateBadge();
    } catch (err) {
      App.toast('Failed to load notifications: ' + err.message, 'error');
    }
  },

  async load() {
    await this.loadNotifications();
  },

  updateBadge() {
    const badge = document.getElementById('notif-badge');
    if (badge && this.data.length > 0) {
      badge.textContent = this.data.length;
      badge.style.display = 'block';
    } else if (badge) {
      badge.style.display = 'none';
    }
  },

  renderList() {
    const container = document.getElementById('notif-list');
    if (!container) return;

    if (!this.data.length) {
      container.innerHTML = `<div class="glass" style="padding: 40px; text-align: center; color: var(--text-muted); border-radius: var(--radius);">No notifications.</div>`;
      return;
    }

    let notifHTML = this.data.map(n => `
      <div class="notif-card glass" style="padding: 1.5rem; border-radius: var(--radius); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1;">
          <h4 style="margin: 0 0 0.5rem 0; color: var(--text-main);">${n.title}</h4>
          <p style="margin: 0 0 0.5rem 0; color: var(--text-muted); font-size: 0.9rem;">${n.message}</p>
          <small style="color: var(--text-muted);">${new Date(n.created_at).toLocaleString()}</small>
        </div>
        <button class="action-btn delete" onclick="Notifications.deleteNotification(${n.id})" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('');

    container.innerHTML = notifHTML;
  },

  showAddModal() {
    App.openModal('Create Notification', `
      <form id="notif-form">
        <div class="form-group">
          <label>Title</label>
          <input type="text" class="form-control" id="n_title" required>
        </div>
        <div class="form-group">
          <label>Message</label>
          <textarea class="form-control" id="n_message" rows="4" required></textarea>
        </div>
        <div class="form-group">
          <label>Send To</label>
          <select class="form-control" id="n_target">
            <option value="all">All Users</option>
            <option value="student">Students Only</option>
            <option value="admin">Admins Only</option>
          </select>
        </div>
      </form>
    `, `
      <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
      <button type="button" class="btn btn-primary" onclick="Notifications.saveNotification()">Send</button>
    `);
  },

  async saveNotification() {
    const title = document.getElementById('n_title').value;
    const message = document.getElementById('n_message').value;
    const target = document.getElementById('n_target').value;

    if (!title || !message) {
      App.toast('Please fill in all fields', 'error');
      return;
    }

    try {
      await API.createNotification(title, message, target);
      App.toast('Notification sent successfully', 'success');
      App.closeModal();
      await this.loadNotifications();
    } catch (err) {
      App.toast('Error sending notification: ' + err.message, 'error');
    }
  },

  async deleteNotification(id) {
    if (!confirm('Delete this notification?')) return;

    try {
      await API.deleteNotification(id);
      App.toast('Notification deleted', 'success');
      await this.loadNotifications();
    } catch (err) {
      App.toast('Error deleting notification: ' + err.message, 'error');
    }
  }
};
