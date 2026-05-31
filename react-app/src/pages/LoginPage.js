import React, { useState } from 'react';
import { authService } from '../authService';
import '../index.css';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        const userCredential = await authService.signup(email, password);
        // Optionally: you can create a user profile in Firestore here
        onLoginSuccess(userCredential.user);
      } else {
        const userCredential = await authService.login(email, password);
        onLoginSuccess(userCredential.user);
      }
    } catch (err) {
      setError(err.message || (isRegistering ? 'Registration failed' : 'Login failed'));
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
            <label htmlFor="email">Email</label>
            <div className="input-icon">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                id="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <div className="input-icon">
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  id="fullName"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
          )}
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
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-icon">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}
          {error && <div className="alert alert-danger">{error}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            <span>{loading ? (isRegistering ? 'Creating...' : 'Signing In...') : (isRegistering ? 'Register' : 'Sign In')}</span>
            <i className="fas fa-arrow-right"></i>
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button className="link-btn" onClick={() => { setIsRegistering(!isRegistering); setError(''); }}>
            {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>

        <p className="login-hint">Use your Firebase email/password</p>
      </div>
    </div>
  );
}
