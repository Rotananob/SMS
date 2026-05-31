import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../api';
import '../index.css';

export default function Topbar({ pageTitle, user, onLogout }) {
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll();
      setNotifCount(response.data.length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <header className="topbar">
      <div className="topbar-title">{pageTitle}</div>
      <div className="topbar-actions">
        <button className="topbar-icon-btn" onClick={() => { /* Open notifications */ }}>
          <i className="fas fa-bell"></i>
          {notifCount > 0 && <span className="badge">{notifCount}</span>}
        </button>
        <div className="avatar">{getInitial(user?.username)}</div>
      </div>
    </header>
  );
}
