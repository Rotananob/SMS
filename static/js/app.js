const App = {
  user: null, // Populated by auth.js
  
  init() {
    this.cacheDOM();
    this.bindEvents();
    // Authentication is handled automatically by Firebase onAuthStateChanged in auth.js
  },

  cacheDOM() {
    this.appShell = document.getElementById('app');
    this.loginScreen = document.getElementById('login-screen');
    this.mainContent = document.getElementById('main-content');
    this.pageLoader = document.getElementById('page-loader');
    this.topbarTitle = document.getElementById('topbar-title');
    this.userInfo = document.getElementById('user-info');
    this.topbarAvatar = document.getElementById('topbar-avatar');
    this.notifBadge = document.getElementById('notif-badge');
    
    // Sidebar
    this.sidebar = document.getElementById('sidebar');
    this.menuToggle = document.getElementById('menu-toggle');
    this.sidebarClose = document.getElementById('sidebar-close');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.logoutBtn = document.getElementById('logout-btn');
    
    // Modal
    this.modalOverlay = document.getElementById('modal-overlay');
    this.modal = document.getElementById('modal');
    this.modalTitle = document.getElementById('modal-title');
    this.modalBody = document.getElementById('modal-body');
    this.modalFooter = document.getElementById('modal-footer');
    this.modalClose = document.getElementById('modal-close');
    
    // Toast
    this.toastContainer = document.getElementById('toast-container');
  },

  bindEvents() {
    this.menuToggle.addEventListener('click', () => this.sidebar.classList.add('open'));
    this.sidebarClose.addEventListener('click', () => this.sidebar.classList.remove('open'));
    this.logoutBtn.addEventListener('click', () => Auth.logout());
    
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = e.currentTarget.dataset.page;
        this.navigate(page);
      });
    });

    this.modalClose.addEventListener('click', () => this.closeModal());
    this.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) this.closeModal();
    });
  },

  showLogin() {
    this.appShell.classList.add('hidden');
    this.loginScreen.classList.remove('hidden');
  },

  showApp() {
    this.loginScreen.classList.add('hidden');
    this.appShell.classList.remove('hidden');
    
    if (this.user) {
      this.userInfo.innerHTML = `<strong>${this.user.username}</strong><br><small>Administrator</small>`;
      this.topbarAvatar.textContent = this.user.username.charAt(0).toUpperCase();
    }
    
    this.navigate('dashboard');
    if(window.Notifications) Notifications.load();
  },

  navigate(page) {
    if (window.innerWidth <= 768) {
      this.sidebar.classList.remove('open');
    }
    
    this.navLinks.forEach(l => l.classList.remove('active'));
    document.querySelector(`.nav-link[data-page="${page}"]`)?.classList.add('active');
    
    const titles = {
      dashboard: 'Dashboard', students: 'Students', courses: 'Courses',
      attendance: 'Attendance', grades: 'Grades', reports: 'Reports', notifications: 'Notifications'
    };
    this.topbarTitle.textContent = titles[page] || 'Page';
    
    this.renderPage(page);
  },

  async renderPage(page) {
    this.pageLoader.classList.remove('hidden');
    
    try {
      let content = '';
      switch(page) {
        case 'dashboard': content = await Reports.getDashboardHTML(); break;
        case 'students': content = await Students.getHTML(); break;
        case 'courses': content = await Courses.getHTML(); break;
        case 'attendance': content = await Attendance.getHTML(); break;
        case 'grades': content = await Grades.getHTML(); break;
        case 'reports': content = await Reports.getHTML(); break;
        case 'notifications': content = await Notifications.getHTML(); break;
        default: content = '<div class="text-center text-muted"><br>Page under construction.</div>';
      }
      
      const contentDiv = document.createElement('div');
      contentDiv.innerHTML = content;
      
      Array.from(this.mainContent.children).forEach(child => {
        if (child !== this.pageLoader) child.remove();
      });
      
      this.mainContent.appendChild(contentDiv);
      
      switch(page) {
        case 'students': Students.initEvents(); break;
        case 'courses': Courses.initEvents(); break;
        case 'attendance': Attendance.initEvents(); break;
        case 'grades': Grades.initEvents(); break;
        case 'notifications': Notifications.initEvents(); break;
      }
    } catch (err) {
      console.error(err);
      this.toast('Error loading page', 'error');
    } finally {
      this.pageLoader.classList.add('hidden');
    }
  },

  openModal(title, bodyHTML, footerHTML = '') {
    this.modalTitle.textContent = title;
    this.modalBody.innerHTML = bodyHTML;
    this.modalFooter.innerHTML = footerHTML;
    this.modalOverlay.classList.remove('hidden');
  },

  closeModal() {
    this.modalOverlay.classList.add('hidden');
    setTimeout(() => {
      this.modalTitle.textContent = '';
      this.modalBody.innerHTML = '';
      this.modalFooter.innerHTML = '';
    }, 300);
  },

  toast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle' };
    toast.innerHTML = `
      <i class="fas fa-${icons[type]} toast-icon"></i>
      <div class="toast-content">${message}</div>
    `;
    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'fadeOutRight 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
