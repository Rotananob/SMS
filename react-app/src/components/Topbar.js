import React, { useState, useEffect } from 'react';
import { notificationService } from '../firestoreService';
import '../index.css';

export default function Topbar({ pageTitle, user, onLogout }) {
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((data) => {
      setNotifCount(data.length);
    });

    return () => unsubscribe();
  }, []);

  const getInitial = (email) => {
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

  return (
    <header className="topbar">
      <div className="topbar-title">
        <i className="fas fa-chevron-right" style={{ marginRight: '0.75rem', color: 'var(--primary)' }}></i>
        {pageTitle}
      </div>
      <div className="topbar-actions">
        <button className="topbar-icon-btn" title="Notifications">
          <i className="fas fa-bell"></i>
          {notifCount > 0 && <span className="badge">{notifCount}</span>}
        </button>
        <button className="topbar-icon-btn" title="Settings">
          <i className="fas fa-cog"></i>
        </button>
        <div className="avatar" title={user?.email}>{getInitial(user?.email)}</div>
      </div>
    </header>
  );
}
