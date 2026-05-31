import React, { useState, useEffect } from 'react';
import { notificationService } from '../firestoreService';
import { useAlert } from '../context/AlertContext';
import LanguageSwitcher from './LanguageSwitcher';
import PasswordChangeModal from './PasswordChangeModal';
import '../index.css';

export default function Topbar({ pageTitle, user, onLogout, onToggleSidebar, addToast }) {
  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((data) => {
      setNotifications(data);
      setNotifCount(data.length);
    });

    return () => unsubscribe();
  }, []);

  const getInitial = (email) => {
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

  const handleSettings = () => {
    setShowPasswordModal(true);
  };

  const handleLogout = () => {
    showAlert({
      type: 'warning',
      title: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      buttons: ['Yes', 'No'],
      onConfirm: onLogout,
      onCancel: () => {}
    });
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationService.delete(id);
      if (addToast) addToast('Notification deleted', 'success');
    } catch (err) {
      if (addToast) addToast('Delete failed: ' + err.message, 'error');
    }
  };

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        <button className="menu-toggle" onClick={onToggleSidebar} title="Toggle Menu" style={{ padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', fontSize: '1.4rem' }}>
          <i className="fas fa-bars"></i>
        </button>
        <div className="topbar-title">
          <i className="fas fa-chevron-right" style={{ marginRight: '0.75rem', color: 'var(--primary)' }}></i>
          {pageTitle}
        </div>
      </div>
      <div className="topbar-actions">
        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }}>
          <button className="topbar-icon-btn" title="Notifications" onClick={() => setShowNotifDropdown(!showNotifDropdown)} style={{ padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>
            <i className="fas fa-bell"></i>
            {notifCount > 0 && <span className="badge">{notifCount}</span>}
          </button>
          
          {showNotifDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: 'var(--panel-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius)',
              minWidth: '320px',
              maxHeight: '400px',
              overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              zIndex: 1000,
              marginTop: '0.5rem'
            }}>
              {notifications.length > 0 ? (
                <div>
                  {notifications.map((notif) => (
                    <div key={notif.id} style={{
                      padding: '1rem',
                      borderBottom: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '0.75rem'
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-main)' }}>{notif.title}</p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{notif.message}</p>
                        <small style={{ color: 'var(--text-muted)' }}>
                          {notif.target && `Target: ${notif.target}`}
                        </small>
                      </div>
                      <button
                        onClick={(e) => handleDeleteNotification(e, notif.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          padding: '0.25rem'
                        }}
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p>No notifications</p>
                </div>
              )}
            </div>
          )}
        </div>

        <LanguageSwitcher />
        
        <button 
          className="topbar-icon-btn" 
          title="Settings" 
          onClick={handleSettings}
          style={{ padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <i className="fas fa-cog"></i>
        </button>
        
        <button
          className="topbar-icon-btn"
          title="Logout"
          onClick={handleLogout}
          style={{ padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
        >
          <i className="fas fa-sign-out-alt"></i>
        </button>

        <div className="avatar" title={user?.email}>{getInitial(user?.email)}</div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <PasswordChangeModal 
          user={user} 
          onClose={() => setShowPasswordModal(false)} 
          addToast={addToast}
        />
      )}
    </header>
  );
}
