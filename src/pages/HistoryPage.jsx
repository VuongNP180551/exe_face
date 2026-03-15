import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { attendanceAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { FiCalendar, FiCheckCircle, FiXCircle, FiUsers, FiTrash2, FiEye } from 'react-icons/fi';
import './HistoryPage.css';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchSessions = async () => {
    try {
      const res = await attendanceAPI.getSessions();
      setSessions(res.data.sessions);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phiên điểm danh này?')) return;
    try {
      await attendanceAPI.deleteSession(id);
      setSessions(sessions.filter((s) => s.id !== id));
      setToast({ type: 'success', message: 'Đã xóa phiên điểm danh.' });
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast({ type: 'error', message: 'Xóa thất bại.' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        {toast && (
          <div className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        )}

        <div className="page-header fade-in">
          <h1>📋 Lịch sử điểm danh</h1>
          <p>Xem lại tất cả các phiên điểm danh đã tạo</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div className="loader"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="empty-state glass-card fade-in">
            <FiCalendar size={48} />
            <p>Chưa có phiên điểm danh nào</p>
            <button className="btn btn-primary" onClick={() => navigate('/capture')}>
              Tạo phiên mới
            </button>
          </div>
        ) : (
          <div className="glass-card history-table-wrapper fade-in" style={{ animationDelay: '0.1s' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tên phiên</th>
                  <th>Ngày</th>
                  <th>Có mặt</th>
                  <th>Vắng</th>
                  <th>Tổng</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, index) => (
                  <tr key={session.id} className="slide-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <td>{index + 1}</td>
                    <td><strong>{session.sessionName}</strong></td>
                    <td>
                      <span className="history-date">
                        <FiCalendar /> {new Date(session.date).toLocaleDateString('vi-VN')}
                      </span>
                    </td>
                    <td>
                      <span className="stat-present"><FiCheckCircle /> {session.presentCount || 0}</span>
                    </td>
                    <td>
                      <span className="stat-absent"><FiXCircle /> {session.absentCount || 0}</span>
                    </td>
                    <td>
                      <span className="stat-total"><FiUsers /> {session.totalStudents || 0}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${session.status === 'saved' ? 'present' : 'processing'}`}>
                        {session.status === 'saved' ? 'Đã lưu' : 'Chưa lưu'}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/attendance/${session.id}`)}
                          title="Xem chi tiết"
                        >
                          <FiEye />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(session.id)}
                          title="Xóa"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
