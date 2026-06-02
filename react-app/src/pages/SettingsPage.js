import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { authService } from '../authService';
import PasswordChangeModal from '../components/PasswordChangeModal';
import '../index.css';

export default function SettingsPage({ user, addToast, onUserUpdate }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.displayName || 'Admin User',
    email: user?.email || '',
    phone: '',
    role: user?.role || 'Administrator'
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load user profile from Firebase
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.displayName || user.email?.split('@')[0] || 'Admin User',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || user.email?.includes('admin') ? 'Administrator' : 'User'
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // TODO: Update user profile in Firestore
      // For now, just show success
      if (onUserUpdate) {
        onUserUpdate({
          ...user,
          displayName: profileData.name,
          phone: profileData.phone
        });
      }
      if (addToast) addToast(t('messages.updateSuccess') || '✅ Profile updated successfully', 'success');
    } catch (err) {
      console.error('Error updating profile:', err);
      if (addToast) addToast('Error updating profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('nav.settings') || 'Settings'}</h1>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Settings Sidebar */}
        <div style={{ width: '250px', flexShrink: 0 }}>
          <div style={{ background: 'var(--panel-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <button 
              style={{ width: '100%', padding: '1rem 1.5rem', textAlign: 'left', background: activeTab === 'profile' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', border: 'none', borderLeft: activeTab === 'profile' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-main)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'var(--transition)' }}
              onClick={() => setActiveTab('profile')}
            >
              <i className="fas fa-user-circle"></i> {t('pages.settings.profile') || 'Profile Settings'}
            </button>
            <button 
              style={{ width: '100%', padding: '1rem 1.5rem', textAlign: 'left', background: activeTab === 'account' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', border: 'none', borderLeft: activeTab === 'account' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'account' ? 'var(--primary)' : 'var(--text-main)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'var(--transition)' }}
              onClick={() => setActiveTab('account')}
            >
              <i className="fas fa-shield-alt"></i> {t('pages.settings.security') || 'Security & Account'}
            </button>
            <button 
              style={{ width: '100%', padding: '1rem 1.5rem', textAlign: 'left', background: activeTab === 'preferences' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', border: 'none', borderLeft: activeTab === 'preferences' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'preferences' ? 'var(--primary)' : 'var(--text-main)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'var(--transition)' }}
              onClick={() => setActiveTab('preferences')}
            >
              <i className="fas fa-sliders-h"></i> {t('pages.settings.preferences') || 'Preferences'}
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          {activeTab === 'profile' && (
            <div style={{ background: 'var(--panel-bg)', borderRadius: 'var(--radius)', padding: '2rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>{t('pages.settings.profile') || 'Profile Settings'}</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white', fontWeight: 700 }}>
                  {profileData.email ? profileData.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <button type="button" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => addToast('Avatar upload coming soon', 'info')}>
                    <i className="fas fa-camera"></i> Change Avatar
                  </button>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Recommended size: 256x256px</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>{t('forms.fullName') || 'Full Name'}</label>
                    <div className="input-icon">
                      <i className="fas fa-user"></i>
                      <input type="text" name="name" value={profileData.name} onChange={handleInputChange} className="form-control" />
                    </div>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>{t('forms.email') || 'Email Address'}</label>
                    <div className="input-icon">
                      <i className="fas fa-envelope"></i>
                      <input type="email" name="email" value={profileData.email} disabled className="form-control" style={{ opacity: 0.7 }} />
                    </div>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>{t('forms.phone') || 'Phone Number'}</label>
                    <div className="input-icon">
                      <i className="fas fa-phone"></i>
                      <input type="text" name="phone" value={profileData.phone} onChange={handleInputChange} className="form-control" placeholder="+855 ..." />
                    </div>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Role</label>
                    <div className="input-icon">
                      <i className="fas fa-briefcase"></i>
                      <input type="text" value={profileData.role} disabled className="form-control" style={{ opacity: 0.7 }} />
                    </div>
                    <small style={{ color: 'var(--warning)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fas fa-lock"></i> Only Owner can change roles
                    </small>
                  </div>
                </div>
                
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    <i className="fas fa-save"></i> {isLoading ? 'Saving...' : (t('buttons.save') || 'Save Changes')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'account' && (
            <div style={{ background: 'var(--panel-bg)', borderRadius: 'var(--radius)', padding: '2rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>{t('pages.settings.security') || 'Security & Account'}</h3>
              
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Change Password</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Ensure your account is using a long, random password to stay secure.</p>
                <button className="btn btn-secondary" onClick={() => setShowPasswordModal(true)}>
                  <i className="fas fa-key"></i> Update Password
                </button>
              </div>
              
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem', color: 'var(--danger)' }}>Danger Zone</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Once you delete your account, there is no going back. Please be certain.</p>
                <button type="button" className="btn btn-danger" onClick={() => {
                  if (window.confirm('Are you absolutely sure? This action cannot be undone.')) {
                    if (addToast) addToast('Account deletion coming soon', 'warning');
                  }
                }}>
                  <i className="fas fa-trash-alt"></i> Delete Account
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div style={{ background: 'var(--panel-bg)', borderRadius: 'var(--radius)', padding: '2rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>{t('pages.settings.preferences') || 'Preferences'}</h3>
              
              <div className="form-group">
                <label>System Theme</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button className="btn btn-secondary" style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-color)', color: 'var(--text-main)', border: '2px solid var(--primary)' }}>
                    <i className="fas fa-moon" style={{ fontSize: '1.5rem' }}></i>
                    Dark Mode (Default)
                  </button>
                  <button className="btn btn-secondary" style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: 0.5 }} disabled>
                    <i className="fas fa-sun" style={{ fontSize: '1.5rem' }}></i>
                    Light Mode (Coming Soon)
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '2rem' }}>
                <label>Email Notifications</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-main)', fontWeight: 400, textTransform: 'none' }}>
                    <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} /> Receive weekly reports
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-main)', fontWeight: 400, textTransform: 'none' }}>
                    <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} /> Security alerts
                  </label>
                </div>
              </div>
              
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={() => addToast('Preferences saved', 'success')}>
                  <i className="fas fa-save"></i> {t('buttons.save') || 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {showPasswordModal && (
        <PasswordChangeModal 
          user={user} 
          onClose={() => setShowPasswordModal(false)} 
          addToast={addToast}
        />
      )}
    </div>
  );
}
