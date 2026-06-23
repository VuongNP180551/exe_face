import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { FiCalendar, FiCheckCircle, FiXCircle, FiUsers, FiTrash2, FiEye, FiMessageSquare } from 'react-icons/fi';
import './HistoryPage.css';

const HistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState([]); // Will hold sessions for Teacher/Admin, records for Student
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Appeal Modal State
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealRecordId, setAppealRecordId] = useState(null);
  const [appealReason, setAppealReason] = useState('');
  const [appealFile, setAppealFile] = useState(null);

  const fetchData = async () => {
    try {
      if (user?.role === 'student') {
        const res = await attendanceAPI.getMyRecords();
        setData(res.data.records);
      } else {
        const res = await attendanceAPI.getSessions();
        setData(res.data.sessions);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleDeleteSession = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phiên điểm danh này?')) return;
    try {
      await attendanceAPI.deleteSession(id);
      setData(data.filter((s) => s.id !== id));
      setToast({ type: 'success', message: 'Đã xóa phiên điểm danh.' });
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast({ type: 'error', message: 'Xóa thất bại.' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleAppealSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('attendanceRecordId', appealRecordId);
      formData.append('reason', appealReason);
      if (appealFile) {
        formData.append('evidence', appealFile);
      }
      
      await attendanceAPI.createAppeal(formData);
      setToast({ type: 'success', message: 'Đã gửi khiếu nại thành công.' });
      setShowAppealModal(false);
      setAppealReason('');
      setAppealFile(null);
    } catch {
      setToast({ type: 'error', message: 'Gửi khiếu nại thất bại.' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const openAppealModal = (recordId) => {
    setAppealRecordId(recordId);
    setShowAppealModal(true);
  };

  const renderStudentView = () => (
    <div className="glass-card history-table-wrapper fade-in">
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Tên phiên điểm danh</th>
            <th>Giáo viên</th>
            <th>Ngày</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {data.map((record, index) => (
            <tr key={record.id} className="slide-in" style={{ animationDelay: `${index * 0.05}s` }}>
              <td>{index + 1}</td>
              <td><strong>{record.session?.sessionName}</strong></td>
              <td>{record.session?.teacher?.fullName || 'N/A'}</td>
              <td><FiCalendar /> {new Date(record.createdAt).toLocaleDateString('vi-VN')}</td>
              <td>
                <span className={`badge badge-${record.status.toLowerCase()}`}>
                  {record.status === 'PRESENT' ? 'CÓ MẶT' : record.status === 'ABSENT' ? 'VẮNG' : record.status}
                </span>
              </td>
              <td>
                {record.status === 'ABSENT' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => openAppealModal(record.id)}>
                    <FiMessageSquare /> Khiếu nại
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTeacherView = () => (
    <div className="glass-card history-table-wrapper fade-in">
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Tên phiên</th>
            <th>Lớp</th>
            <th>Ngày</th>
            <th>Có mặt</th>
            <th>Vắng</th>
            <th>Tổng</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {data.map((session, index) => (
            <tr key={session.id} className="slide-in" style={{ animationDelay: `${index * 0.05}s` }}>
              <td>{index + 1}</td>
              <td><strong>{session.sessionName}</strong></td>
              <td>{session.class?.className || 'N/A'}</td>
              <td><FiCalendar /> {new Date(session.date).toLocaleDateString('vi-VN')}</td>
              <td><span className="stat-present"><FiCheckCircle /> {session.presentCount || 0}</span></td>
              <td><span className="stat-absent"><FiXCircle /> {session.absentCount || 0}</span></td>
              <td><span className="stat-total"><FiUsers /> {session.totalStudents || 0}</span></td>
              <td>
                <span className={`badge badge-${session.status.toLowerCase()}`}>
                  {session.status}
                </span>
              </td>
              <td>
                <div className="action-btns">
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/attendance/${session.id}`)} title="Xem chi tiết">
                    <FiEye />
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteSession(session.id)} title="Xóa">
                    <FiTrash2 />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

        <div className="page-header fade-in">
          <h1>📋 Lịch sử {user?.role === 'student' ? 'của tôi' : 'điểm danh'}</h1>
          <p>{user?.role === 'student' ? 'Xem lại kết quả điểm danh của bạn' : 'Xem lại tất cả các phiên điểm danh đã tạo'}</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="loader"></div></div>
        ) : data.length === 0 ? (
          <div className="empty-state glass-card fade-in">
            <FiCalendar size={48} />
            <p>Chưa có dữ liệu nào</p>
          </div>
        ) : (
          user?.role === 'student' ? renderStudentView() : renderTeacherView()
        )}
      </div>

      {showAppealModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card fade-in" style={{ maxWidth: '400px' }}>
            <h3>Gửi Khiếu Nại Điểm Danh</h3>
            <form onSubmit={handleAppealSubmit}>
              <div className="form-group">
                <label>Lý do / Lời nhắn</label>
                <textarea 
                  className="input-group" 
                  style={{ width: '100%', minHeight: '80px', padding: '10px' }}
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  required
                  placeholder="Ví dụ: Em có đi học nhưng camera không nhận diện được..."
                />
              </div>
              <div className="form-group">
                <label>Ảnh minh chứng (nếu có)</label>
                <input 
                  type="file" 
                  className="input-group" 
                  accept="image/*"
                  onChange={(e) => setAppealFile(e.target.files[0])}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Gửi khiếu nại</button>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAppealModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
