import { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { FiBell, FiCheck } from 'react-icons/fi';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(Array.isArray(res.data) ? res.data : res.data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        <div className="notifications-container fade-in">
          <div className="glass-card list-card">
            <div className="section-header">
              <h2><FiBell /> Thông báo của bạn</h2>
            </div>
            
            {loading ? (
              <div className="loader"></div>
            ) : notifications.length === 0 ? (
              <div className="empty-state">
                <FiBell size={48} />
                <p>Bạn không có thông báo nào.</p>
              </div>
            ) : (
              <div className="notification-list">
                {notifications.map(n => (
                  <div key={n.id} className={`notification-item glass-card ${n.isRead ? 'read' : 'unread'}`}>
                    <div className="notification-content">
                      <h3>{n.title}</h3>
                      <p>{n.message}</p>
                      <span className="notification-time">{new Date(n.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                    {!n.isRead && (
                      <button className="btn btn-secondary btn-sm" onClick={() => handleMarkAsRead(n.id)}>
                        <FiCheck /> Đánh dấu đã đọc
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
