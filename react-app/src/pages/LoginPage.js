import React, { useState, useCallback, useEffect } from 'react';
import { authService } from '../authService';
import { useLanguage } from '../i18n/LanguageContext';
import '../styles/Login.css';

/* ─── Firebase error → friendly message ─── */
const getErrorMessage = (errorCode, isRegistering, t) => {
  const map = {
    'auth/user-not-found':        'No account found with this email.',
    'auth/wrong-password':        'Incorrect password. Please try again.',
    'auth/email-already-in-use':  'This email is already registered.',
    'auth/weak-password':         'Password must be at least 6 characters.',
    'auth/invalid-email':         'Please enter a valid email address.',
    'auth/too-many-requests':     'Too many attempts. Please try again later.',
    'auth/network-request-failed':'Connection error. Check your internet.',
    'auth/invalid-credential':    'Invalid email or password.',
  };
  return map[errorCode] || (isRegistering ? 'Registration failed. Please try again.' : 'Sign in failed. Please try again.');
};

/* ─── Floating particle list ─── */
const PARTICLES = Array.from({ length: 10 });

/* ─── Feature highlights on left panel ─── */
const FEATURES = [
  { icon: 'fas fa-users', label: 'Manage students, courses & grades', cls: 'fi-purple' },
  { icon: 'fas fa-chart-bar', label: 'Real-time analytics & reports', cls: 'fi-cyan' },
  { icon: 'fas fa-shield-alt', label: 'Secure Firebase authentication', cls: 'fi-green' },
];

/* ─── Team members with images ─── */
const TEAM = [
  { name: 'Rotana NOB',     role: 'Developer', avatar: 'RN', image: require('../images/Rotana_NOB.jpg'), isLead: true  },
  { name: 'RA Piseth',      role: 'Member',    avatar: 'RP', image: require('../images/Ra_Piseth.jpg'), isLead: false },
  { name: 'Vuth Sreyneang', role: 'Member',    avatar: 'VS', image: require('../images/Vuth_Sreyneang.jpg'), isLead: false },
  { name: 'Rothana Choung', role: 'Member',    avatar: 'RC', image: require('../images/Choung_Rothana.jpg'), isLead: false },
  { name: 'Phy Sophorn',    role: 'Member',    avatar: 'PS', image: require('../images/Phy_Sophorn.jpg'), isLead: false },
];

export default function LoginPage({ onLoginSuccess, onGuestAccess }) {
  const { t, toggleLanguage, language } = useLanguage();

  /* ── form state ── */
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPwd, setConfirmPwd]       = useState('');
  const [fullName, setFullName]           = useState('');
  const [remember, setRemember]           = useState(false);
  const [showPwd, setShowPwd]             = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail]     = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showRegisterWarning, setShowRegisterWarning] = useState(false);

  /* ── feedback state ── */
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  /* ── Load saved email on mount ── */
  useEffect(() => {
    const savedEmail = localStorage.getItem('sms_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRemember(true);
    }
  }, []);

  /* ── switch login / register ── */
  const switchMode = useCallback((toRegister) => {
    if (toRegister) {
      // Show warning modal instead of switching mode
      setShowRegisterWarning(true);
      return;
    }
    setIsRegistering(false);
    setError(''); setSuccess('');
    setEmail(''); setPassword('');
    setConfirmPwd(''); setFullName('');
    setShowPwd(false); setShowConfirmPwd(false);
  }, []);

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (isRegistering) {
      if (!fullName.trim()) { setError(t('login.errors.enterFullName')); return; }
      if (password !== confirmPwd) { setError(t('login.errors.passwordMismatch')); return; }
      if (password.length < 6)     { setError(t('login.errors.passwordShort')); return; }
    }

    setLoading(true);
    try {
      if (isRegistering) {
        const cred = await authService.signup(email, password);
        setSuccess(t('login.success.created'));
        setTimeout(() => onLoginSuccess(cred.user), 1400);
      } else {
        const cred = await authService.login(email, password);
        
        // Handle Remember Me
        if (remember) {
          localStorage.setItem('sms_remembered_email', email);
        } else {
          localStorage.removeItem('sms_remembered_email');
        }
        
        // Save auth token for public view access
        localStorage.setItem('sms_auth_token', cred.user.uid);
        localStorage.setItem('sms_student_id', cred.user.uid);
        
        setSuccess(t('login.success.welcome'));
        setTimeout(() => onLoginSuccess(cred.user), 1200);
      }
    } catch (err) {
      setError(getErrorMessage(err.code, isRegistering, t));
    } finally {
      setLoading(false);
    }
  };

  /* ── Forgot Password Handler ── */
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setError(t('login.errors.enterEmail') || 'Please enter your email');
      return;
    }

    setForgotLoading(true);
    try {
      await authService.sendPasswordReset(forgotEmail);
      setSuccess(t('login.success.resetSent') || '✅ Password reset link sent to your email!');
      setForgotEmail('');
      setTimeout(() => setShowForgotPassword(false), 2000);
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="login-screen">

      {/* ═══════════════════════════════════════════
          LEFT PANEL — animated hero
      ═══════════════════════════════════════════ */}
      <div className="login-left">
        {/* Ambient orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="orb orb-3" />
        <div className="orb orb-4" />

        {/* Rising particles */}
        <div className="particles">
          {PARTICLES.map((_, i) => <span key={i} className="particle" />)}
        </div>

        {/* Grid overlay */}
        <div className="login-grid" />

        {/* Hero content */}
        <div className="login-hero">
          {/* Badge */}
          <div className="login-hero-badge">
            <span className="badge-dot" />
            v2.0 — Firebase Powered
          </div>

          {/* Icon */}
          <div className="login-hero-icon">
            <i className="fas fa-graduation-cap" />
          </div>

          {/* Title */}
          <h1 className="login-hero-title" style={{ fontFamily: "'Dongrek', sans-serif" }}>
            YOUNG SMS<br />
            <span style={{ fontSize: '1.5rem', fontWeight: 500 }}>Student Management</span>
          </h1>

          {/* Subtitle */}
          <p className="login-hero-subtitle">
            A unified platform for tracking students,
            managing courses, recording attendance,
            and generating insightful reports — all in one place.
          </p>

          {/* Feature list */}
          <div className="login-features">
            {FEATURES.map((f, i) => (
              <div key={i} className="login-feature">
                <div className={`login-feature-icon ${f.cls}`}>
                  <i className={f.icon} />
                </div>
                <span className="login-feature-text">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          RIGHT PANEL — form
      ═══════════════════════════════════════════ */}
      <div className="login-right">
        <div className="login-card">

          {/* Card header */}
          <div className="login-form-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="login-mode-tag">
                {isRegistering ? t('login.modeTagCreate') : t('login.modeTagLogin')}
              </div>
              <button type="button" className="lf-lang-btn" onClick={toggleLanguage} aria-label={t('buttons.language')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 600 }}>
                {language === 'en' ? 'EN' : 'ខ្មែរ'}
              </button>
            </div>
            <h2 className="login-title">
              {isRegistering ? t('login.titleRegister') : t('login.titleWelcome')}
            </h2>
            <p className="login-sub">
              {isRegistering ? t('login.subRegister') : t('login.subWelcome')}
            </p>
          </div>

          {/* Mode toggle tabs */}
          <div className="login-tabs" role="tablist">
            <button
              id="tab-signin"
              role="tab"
              aria-selected={!isRegistering}
              className={`login-tab ${!isRegistering ? 'active' : ''}`}
              onClick={() => switchMode(false)}
              type="button"
            >
              <i className="fas fa-sign-in-alt" style={{ marginRight: '0.4rem', fontSize: '0.85rem' }} />
              {t('login.tabs.signIn')}
            </button>
            <button
              id="tab-register"
              role="tab"
              aria-selected={isRegistering}
              className={`login-tab ${isRegistering ? 'active' : ''}`}
              onClick={() => switchMode(true)}
              type="button"
            >
              <i className="fas fa-user-plus" style={{ marginRight: '0.4rem', fontSize: '0.85rem' }} />
                {t('login.tabs.register')}
            </button>
          </div>

          {/* ── Form ── */}
          <form id="login-form" onSubmit={handleSubmit} className="login-form" noValidate>

            {/* Full name (register only) - DISABLED */}
            {false && isRegistering && (
              <div className="form-group" style={{ display: 'none' }}>
                <label htmlFor="fullName">{t('forms.fullName') || 'Full Name'}</label>
                <div className="lf-input-wrap">
                  <i className="fas fa-user lf-input-icon" />
                  <input
                    id="fullName"
                    type="text"
                    className="lf-input"
                    placeholder="Your Full Name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email (Both modes) */}
            <div className="form-group">
              <label htmlFor="email">{t('forms.email')}</label>
              <div className="lf-input-wrap">
                <i className="fas fa-envelope lf-input-icon" />
                <input
                  id="email"
                  type="email"
                  className="lf-input"
                  placeholder={t('login.placeholders.email')}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password (Both modes) */}
            <div className="form-group">
              <label htmlFor="password">{t('forms.password')}</label>
              <div className="lf-input-wrap">
                <i className="fas fa-lock lf-input-icon" />
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  className="lf-input has-toggle"
                  placeholder={t('login.placeholders.password')}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                  required
                />
                <button
                  type="button"
                  className="lf-pwd-toggle"
                  onClick={() => setShowPwd(v => !v)}
                  aria-label={showPwd ? t('login.hidePwd') : t('login.showPwd')}
                  tabIndex={-1}
                >
                  <i className={showPwd ? 'fas fa-eye-slash' : 'fas fa-eye'} />
                </button>
              </div>
            </div>

            {/* Confirm Password (register only) - DISABLED */}
            {false && isRegistering && (
              <div className="form-group" style={{ display: 'none' }}>
                <label htmlFor="confirmPassword">{t('forms.confirmPassword') || 'Confirm Password'}</label>
                <div className="lf-input-wrap">
                  <i className="fas fa-lock lf-input-icon" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPwd ? 'text' : 'password'}
                    className="lf-input has-toggle"
                    placeholder="Confirm Password"
                    value={confirmPwd}
                    onChange={e => setConfirmPwd(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="lf-pwd-toggle"
                    onClick={() => setShowConfirmPwd(v => !v)}
                    aria-label="Toggle confirm password visibility"
                    tabIndex={-1}
                  >
                    <i className={showConfirmPwd ? 'fas fa-eye-slash' : 'fas fa-eye'} />
                  </button>
                </div>
              </div>
            )}

            {/* Remember me / Forgot (login only) */}
            {!isRegistering && (
              <div className="lf-extras">
                <label className="lf-remember">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                  />
                  <span>{t('login.rememberMe')}</span>
                </label>
                <button 
                  type="button" 
                  className="lf-forgot"
                  onClick={() => setShowForgotPassword(true)}
                >
                  {t('login.forgotPassword')}
                </button>
              </div>
            )}

            {/* Alerts */}
            {error && (
              <div id="login-error" className="lf-alert lf-alert-danger" role="alert">
                <i className="fas fa-exclamation-circle" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div id="login-success" className="lf-alert lf-alert-success" role="alert">
                <i className="fas fa-check-circle" />
                <span>{success}</span>
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              className="lf-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="lf-spinner" />
                  {isRegistering ? (t('login.registering') || 'Creating Account...') : t('login.signingIn')}
                </>
              ) : (
                <>
                  {isRegistering ? (t('login.tabs.register') || 'Create Account') : t('login.tabs.signIn')}
                  <i className="fas fa-arrow-right" style={{ fontSize: '0.9rem' }} />
                </>
              )}
            </button>
          </form>

          {/* Public Portal Button */}
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ width: '100%', padding: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.2)' }}
              onClick={onGuestAccess}
            >
              <i className="fas fa-globe"></i> {t('login.guestAccess')}
            </button>
          </div>

          {/* Divider */}
          <div className="lf-divider">{t('login.or')}</div>

          {/* Toggle link - HIDDEN (Registration disabled) */}
          <div className="lf-toggle-wrap" style={{ display: 'none' }}>
            <span className="lf-toggle-text">
              {isRegistering ? t('login.toggle.haveAccount') : t('login.toggle.noAccount')}
            </span>
            <button
              id="toggle-mode-btn"
              type="button"
              className="lf-toggle-btn"
              onClick={() => switchMode(!isRegistering)}
            >
              {isRegistering ? t('login.toggle.signIn') : t('login.toggle.register')}
            </button>
          </div>

          {/* Demo hint - removed */}

          {/* ── Team Credit Section ── */}
          <div className="lf-credit-section">
            <div className="lf-credit-header">
              <span className="lf-credit-line" />
              <span className="lf-credit-label">
                <i className="fas fa-code" /> Assignment Team
              </span>
              <span className="lf-credit-line" />
            </div>

            {/* Developer credit */}
            <div className="lf-credit-author">
              <i className="fas fa-laptop-code lf-dev-icon" />
              <span>Rotana NOB</span>
              <span className="lf-dev-badge">Developer</span>
            </div>
            <p className="lf-credit-uni">
              <i className="fas fa-university" />
              Asia Euro University &nbsp;&middot;&nbsp; Year 3 Semester 2 &nbsp;&middot;&nbsp; CS
            </p>

            {/* Team grid */}
            <div className="lf-team-grid">
              {TEAM.map((m, i) => (
                <div key={i} className={`lf-team-member${m.isLead ? ' lf-team-lead' : ''}`}>
                  <div className={`lf-team-avatar lf-av-${i}`}>
                    <img src={m.image} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                  </div>
                  <div className="lf-team-info">
                    <span className="lf-team-name">{m.name}</span>
                    <span className="lf-team-role">
                      <i className={m.isLead ? 'fas fa-star' : 'fas fa-user'} />
                      {m.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="modal-backdrop" onClick={() => setShowForgotPassword(false)} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
              background: 'var(--panel-bg)',
              borderRadius: 'var(--radius)',
              padding: '2rem',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: 'var(--text-main)' }}>🔐 Reset Password</h3>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  ✕
                </button>
              </div>

              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleForgotPassword}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 500 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius)',
                      background: 'var(--bg-color)',
                      color: 'var(--text-main)',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>

                {error && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: 'var(--danger)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius)',
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <i className="fas fa-exclamation-circle" style={{ marginTop: '2px' }} />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    color: 'var(--success)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius)',
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <i className="fas fa-check-circle" style={{ marginTop: '2px' }} />
                    <span>{success}</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius)',
                      background: 'transparent',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 500
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: 'none',
                      borderRadius: 'var(--radius)',
                      background: 'var(--primary)',
                      color: 'white',
                      cursor: forgotLoading ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      opacity: forgotLoading ? 0.6 : 1
                    }}
                  >
                    {forgotLoading ? '⏳ Sending...' : '📧 Send Reset Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Registration Disabled Security Warning Modal */}
        {showRegisterWarning && (
          <div className="modal-backdrop" onClick={() => setShowRegisterWarning(false)} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '2.5rem',
              maxWidth: '420px',
              width: '90%',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
              textAlign: 'center'
            }}>
              {/* Warning Icon */}
              <div style={{
                width: '70px',
                height: '70px',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
              }}>
                <i className="fas fa-lock" style={{ fontSize: '2rem', color: 'white' }} />
              </div>

              <h2 style={{
                color: '#1e293b',
                fontSize: '1.5rem',
                fontWeight: '800',
                marginBottom: '0.5rem',
                margin: '0 0 0.5rem'
              }}>
                <i className="fas fa-lock" style={{ marginRight: '0.5rem' }} />
                Registration Disabled
              </h2>

              <p style={{
                color: '#64748b',
                fontSize: '0.95rem',
                lineHeight: '1.6',
                marginBottom: '1.25rem',
                margin: '0 0 1.25rem'
              }}>
                Registration is currently <strong>disabled for security and data protection</strong> reasons.
              </p>

              <div style={{
                background: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem',
                textAlign: 'left'
              }}>
                <p style={{
                  margin: 0,
                  color: '#dc2626',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'flex-start'
                }}>
                  <i className="fas fa-exclamation-triangle" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Only authorized administrators can create new accounts.</span>
                </p>
              </div>

              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem',
                textAlign: 'left'
              }}>
                <p style={{
                  margin: '0 0 0.5rem',
                  color: '#0369a1',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}>
                  <i className="fas fa-info-circle" style={{ marginRight: '0.5rem' }} />
                  If you need an account:
                </p>
                <ul style={{
                  margin: 0,
                  paddingLeft: '1.25rem',
                  color: '#0284c7',
                  fontSize: '0.8rem'
                }}>
                  <li>Contact your administrator</li>
                  <li>Submit an access request form</li>
                  <li>Provide institutional verification</li>
                </ul>
              </div>

              <button
                onClick={() => setShowRegisterWarning(false)}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1a4d7a 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(30, 60, 114, 0.25)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = '0 6px 16px rgba(30, 60, 114, 0.35)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = '0 2px 8px rgba(30, 60, 114, 0.25)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                ← Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
