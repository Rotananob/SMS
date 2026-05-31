import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../api';
import '../index.css';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll();
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsAPI.delete(id);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        <button className="btn btn-primary">+ New Notification</button>
      </div>

      {loading ? (
        <p>Loading...</p>
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
                  <td>{notif.title}</td>
                  <td>{notif.message}</td>
                  <td>{notif.target}</td>
                  <td>{new Date(notif.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="action-btn delete" onClick={() => handleDelete(notif.id)}>
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
