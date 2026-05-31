import React, { useState, useCallback } from 'react';
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

/* ─── Team members ─── */
const TEAM = [
  { name: 'Rotana NOB',     role: 'Developer', avatar: 'RN', isLead: true  },
  { name: 'RA Piseth',      role: 'Member',    avatar: 'RP', isLead: false },
  { name: 'Vuth Sreyneang', role: 'Member',    avatar: 'VS', isLead: false },
  { name: 'Rothana Choung', role: 'Member',    avatar: 'RC', isLead: false },
  { name: 'Phy Sophorn',    role: 'Member',    avatar: 'PS', isLead: false },
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

  /* ── feedback state ── */
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  /* ── switch login / register ── */
  const switchMode = useCallback((toRegister) => {
    setIsRegistering(toRegister);
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
        setSuccess(t('login.success.welcome'));
        setTimeout(() => onLoginSuccess(cred.user), 1200);
      }
    } catch (err) {
      setError(getErrorMessage(err.code, isRegistering, t));
    } finally {
      setLoading(false);
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

            {/* Full name (register only) */}
            {isRegistering && (
              <div className="form-group lf-slide-in" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <i className="fas fa-shield-alt" style={{ fontSize: '3rem', color: 'var(--danger)', marginBottom: '1rem' }}></i>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Registration Closed</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  For security and system integrity, public registration for Staff & Administrator accounts has been disabled. <br/><br/>
                  Please contact your system administrator to have an account provisioned for you.
                </p>
              </div>
            )}

            {/* Email (Login only) */}
            {!isRegistering && (
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
            )}

            {/* Password (Login only) */}
            {!isRegistering && (
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
                    autoComplete="current-password"
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
                <button type="button" className="lf-forgot">{t('login.forgotPassword')}</button>
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
            {!isRegistering && (
              <button
                id="login-submit-btn"
                type="submit"
                className="lf-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="lf-spinner" />
                    {t('login.signingIn')}
                  </>
                ) : (
                  <>
                    {t('login.tabs.signIn')}
                    <i className="fas fa-arrow-right" style={{ fontSize: '0.9rem' }} />
                  </>
                )}
              </button>
            )}
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

          {/* Toggle link */}
          <div className="lf-toggle-wrap">
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

          {/* Demo hint */}
          <p className="lf-hint">
            <i className="fas fa-info-circle" />
            {t('login.demoHint')}
          </p>

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
                    {m.isLead
                      ? <i className="fas fa-crown" />
                      : <i className="fas fa-user" />}
                  </div>
                  <div className="lf-team-info">
                    <span className="lf-team-name">{m.name}</span>
                    <span className="lf-team-role">
                      <i className={m.isLead ? 'fas fa-code' : 'fas fa-users'} />
                      {m.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
