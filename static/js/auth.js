const Auth = {
  loginForm: null,
  loginBtn: null,
  loginError: null,
  
  init() {
    this.loginForm = document.getElementById('login-form');
    this.loginBtn = document.getElementById('login-btn');
    this.loginError = document.getElementById('login-error');

    if (this.loginForm) {
      this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Check if already logged in
    this.checkAuth();
  },

  async checkAuth() {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      API.setToken(token);
      try {
        const user = await API.getMe();
        App.user = user;
        App.showApp();
      } catch (err) {
        // Token is invalid, show login
        App.showLogin();
      }
    } else {
      App.showLogin();
    }
  },

  async handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    this.loginBtn.disabled = true;
    this.loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Signing in...</span>';
    this.loginError.classList.add('hidden');
    
    try {
      const response = await API.login(username, password);
      API.setToken(response.token);
      App.user = { 
        id: response.id,
        username: response.username,
        role: response.role 
      };
      App.toast('Login successful!', 'success');
      App.showApp();
    } catch (err) {
      this.showError(err.message || 'Invalid credentials');
    } finally {
      this.loginBtn.disabled = false;
      this.loginBtn.innerHTML = '<span>Sign In</span><i class="fas fa-arrow-right"></i>';
    }
  },

  async logout() {
    API.clearToken();
    App.user = null;
    App.showLogin();
    App.toast('Logged out successfully', 'info');
  },

  showError(msg) {
    this.loginError.textContent = msg;
    this.loginError.classList.remove('hidden');
  }
};

document.addEventListener('DOMContentLoaded', () => Auth.init());
