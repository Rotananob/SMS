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

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          + {showForm ? 'Cancel' : 'New Notification'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Create Notification</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                <label>Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="form-control" required />
              </div>
              <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                <label>Message</label>
                <textarea name="message" value={formData.message} onChange={handleInputChange} className="form-control" rows="3" required></textarea>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Target</label>
                <select name="target" value={formData.target} onChange={handleInputChange} className="form-control">
                  <option value="all">All Students</option>
                  <option value="staff">Staff Only</option>
                  <option value="students">Students Only</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">Send</button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <div className="error-msg">No notifications yet</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Message</th>
                <th>Target</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map(notif => (
                <tr key={notif.id}>
                  <td><strong>{notif.title}</strong></td>
                  <td>{notif.message}</td>
                  <td>{notif.target}</td>
                  <td>{notif.created_at ? new Date(notif.created_at.toDate?.() || notif.created_at).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <button className="btn" style={{ padding: '0.5rem 0.75rem', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }} onClick={() => handleDelete(notif.id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
