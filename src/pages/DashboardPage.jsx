import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI, studentAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { FiCamera, FiClock, FiUsers, FiCheckCircle, FiXCircle, FiArrowRight, FiCalendar } from 'react-icons/fi';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessRes, stuRes] = await Promise.all([
          attendanceAPI.getSessions(),
          studentAPI.getAll(),
        ]);
        setSessions(sessRes.data.sessions);
        setStudentCount(stuRes.data.students.length);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalPresent = sessions.reduce((s, session) => s + (session.presentCount || 0), 0);
  const totalAbsent = sessions.reduce((s, session) => s + (session.absentCount || 0), 0);

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        {/* Welcome Section */}
        <div className="dashboard-welcome fade-in">
          <div>
            <h1>Xin chào, {user?.fullName} 👋</h1>
            <p>Chào mừng bạn đến với hệ thống điểm danh bằng khuôn mặt</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/capture')}>
            <FiCamera /> Bắt đầu điểm danh
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="glass-card stat-card">
            <div className="stat-icon primary"><FiClock /></div>
            <div className="stat-info">
              <h3>{sessions.length}</h3>
              <p>Phiên điểm danh</p>
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon secondary"><FiUsers /></div>
            <div className="stat-info">
              <h3>{studentCount}</h3>
              <p>Sinh viên</p>
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon success"><FiCheckCircle /></div>
            <div className="stat-info">
              <h3>{totalPresent}</h3>
              <p>Tổng có mặt</p>
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon danger"><FiXCircle /></div>
            <div className="stat-info">
              <h3>{totalAbsent}</h3>
              <p>Tổng vắng</p>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="dashboard-about glass-card fade-in" style={{ animationDelay: '0.2s' }}>
          <h2>Về Face Attendance</h2>
          <div className="about-grid">
            <div className="about-item">
              <div className="about-icon">📷</div>
              <h3>Nhận diện khuôn mặt</h3>
              <p>Sử dụng AI để nhận diện sinh viên từ ảnh chụp lớp học, tự động điểm danh nhanh chóng.</p>
            </div>
            <div className="about-item">
              <div className="about-icon">⚡</div>
              <h3>Nhanh chóng & Chính xác</h3>
              <p>Xử lý ảnh và điểm danh chỉ trong vài giây, giảm thời gian điểm danh truyền thống.</p>
            </div>
            <div className="about-item">
              <div className="about-icon">✏️</div>
              <h3>Chỉnh sửa linh hoạt</h3>
              <p>Giáo viên có thể xem và chỉnh sửa kết quả điểm danh trước khi lưu chính thức.</p>
            </div>
            <div className="about-item">
              <div className="about-icon">📊</div>
              <h3>Thống kê chi tiết</h3>
              <p>Theo dõi lịch sử điểm danh, tỷ lệ có mặt/vắng theo từng phiên học.</p>
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="section-header">
            <h2>Điểm danh gần đây</h2>
            {sessions.length > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/history')}>
                Xem tất cả <FiArrowRight />
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="loader"></div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="empty-state glass-card">
              <FiCalendar size={48} />
              <p>Chưa có phiên điểm danh nào</p>
              <button className="btn btn-primary" onClick={() => navigate('/capture')}>
                Tạo phiên đầu tiên
              </button>
            </div>
          ) : (
            <div className="sessions-grid">
              {sessions.slice(0, 6).map((session) => (
                <div
                  key={session.id}
                  className="glass-card session-card"
                  onClick={() => navigate(`/attendance/${session.id}`)}
                >
                  <div className="session-card-header">
                    <h3>{session.sessionName}</h3>
                    <span className={`badge badge-${session.status === 'saved' ? 'present' : 'processing'}`}>
                      {session.status === 'saved' ? 'Đã lưu' : 'Chưa lưu'}
                    </span>
                  </div>
                  <p className="session-date">
                    <FiCalendar /> {new Date(session.date).toLocaleDateString('vi-VN')}
                  </p>
                  <div className="session-stats">
                    <span className="stat-present"><FiCheckCircle /> {session.presentCount || 0}</span>
                    <span className="stat-absent"><FiXCircle /> {session.absentCount || 0}</span>
                    <span className="stat-total"><FiUsers /> {session.totalStudents || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
