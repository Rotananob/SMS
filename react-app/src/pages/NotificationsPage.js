import React, { useState, useEffect } from 'react';
import { notificationService } from '../firestoreService';
import '../index.css';

export default function NotificationsPage({ addToast }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target: 'all'
  });

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((data) => {
      setNotifications(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await notificationService.create(formData);
      addToast('Notification created successfully', 'success');
      setFormData({
        title: '',
        message: '',
        target: 'all'
      });
      setShowForm(false);
    } catch (err) {
      addToast('Error: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this notification?')) {
      try {
        await notificationService.delete(id);
        addToast('Notification deleted successfully', 'success');
      } catch (err) {
        addToast('Delete failed: ' + err.message, 'error');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      title: '',
      message: '',
      target: 'all'
    });
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'success': return 'var(--success)';
      case 'danger': return 'var(--danger)';
      case 'warning': return 'var(--warning)';
      default: return 'var(--primary)';
    }
  };

  const getIconBackground = (type) => {
    switch (type) {
      case 'success': return 'rgba(16, 185, 129, 0.15)';
      case 'danger': return 'rgba(239, 68, 68, 0.15)';
      case 'warning': return 'rgba(245, 158, 11, 0.15)';
      default: return 'rgba(99, 102, 241, 0.15)';
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Notifications Center</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <i className={showForm ? 'fas fa-times' : 'fas fa-plus'}></i> {showForm ? 'Cancel' : 'New Notification'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--panel-bg)', padding: '2rem', borderRadius: 'var(--radius)', marginBottom: '2.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className="fas fa-paper-plane" style={{ color: 'var(--primary)' }}></i> Send Announcement
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                <label>Title</label>
                <div className="input-icon">
                  <i className="fas fa-heading"></i>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="form-control" placeholder="E.g., System Update, Meeting Reminder..." required />
                </div>
              </div>
              <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                <label>Message</label>
                <textarea name="message" value={formData.message} onChange={handleInputChange} className="form-control" rows="3" placeholder="Type your detailed message here..." required></textarea>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Target Audience</label>
                <div className="input-icon">
                  <i className="fas fa-users"></i>
                  <select name="target" value={formData.target} onChange={handleInputChange} className="form-control" style={{ paddingLeft: '3rem' }}>
                    <option value="all">All Users</option>
                    <option value="staff">Staff Only</option>
                    <option value="students">Students Only</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-paper-plane"></i> Send Notification
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center" style={{ padding: '3rem' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
          <p>Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--panel-bg)', borderRadius: 'var(--radius)', border: '1px dashed var(--border-color)' }}>
          <i className="fas fa-bell-slash" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }}></i>
          <h3 style={{ color: 'var(--text-secondary)' }}>No Notifications Yet</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>When there's system activity or announcements, they will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map(notif => (
            <div key={notif.id} style={{ 
              background: 'var(--panel-bg)', 
              borderRadius: 'var(--radius)', 
              padding: '1.5rem', 
              border: '1px solid var(--border-color)', 
              display: 'flex', 
              gap: '1.5rem', 
              alignItems: 'flex-start',
              transition: 'var(--transition)',
              position: 'relative',
              overflow: 'hidden'
            }}
            className="notif-card"
            >
              {!notif.read && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: getIconColor(notif.type) }}></div>}
              
              <div style={{ 
                width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: getIconBackground(notif.type), color: getIconColor(notif.type), fontSize: '1.25rem'
              }}>
                <i className={notif.icon || 'fas fa-bell'}></i>
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 600 }}>{notif.title}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '20px' }}>
                    {notif.createdAt ? new Date(notif.createdAt.toDate?.() || notif.createdAt).toLocaleString() : 'Just now'}
                  </span>
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>{notif.message}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {notif.category && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                        {notif.category}
                      </span>
                    )}
                    {notif.target && notif.target !== 'all' && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                        <i className="fas fa-bullseye" style={{ marginRight: '0.3rem' }}></i>{notif.target}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleDelete(notif.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.2s', padding: '0.5rem' }}
                    title="Delete Notification"
                    onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                    onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
