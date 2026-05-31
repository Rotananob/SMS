import React, { useState, useEffect } from 'react';
import { authAPI } from '../api';
import '../index.css';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(username, password);
      localStorage.setItem('jwt_token', response.data.token);
      onLoginSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <i className="fas fa-graduation-cap"></i>
        </div>
        <h1 className="login-title">Student Management System</h1>
        <p className="login-sub">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-icon">
              <i className="fas fa-user"></i>
              <input
                type="text"
                id="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-icon">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            <i className="fas fa-arrow-right"></i>
          </button>
        </form>

        <p className="login-hint">Default: <strong>admin</strong> / <strong>admin123</strong></p>
      </div>
    </div>
  );
}
