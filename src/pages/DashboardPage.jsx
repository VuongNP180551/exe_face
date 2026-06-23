import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI, studentAPI, adminAPI } from '../services/api';
import Navbar from '../components/Navbar';
import {
  FiCamera, FiClock, FiUsers, FiCheckCircle, FiXCircle,
  FiArrowRight, FiCalendar, FiUser, FiBook, FiBarChart2, FiMessageSquare
} from 'react-icons/fi';
import './DashboardPage.css';

// ─── STUDENT DASHBOARD ──────────────────────────────────────────────────────
const StudentDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [myRecords, setMyRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await attendanceAPI.getMyRecords();
        setMyRecords(res.data.records || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const presentCount = myRecords.filter(r => r.status === 'PRESENT').length;
  const absentCount = myRecords.filter(r => r.status === 'ABSENT').length;
  const total = myRecords.length;
  const rate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        {/* Welcome */}
        <div className="dashboard-welcome fade-in">
          <div>
            <h1>Xin chào, {user?.fullName} 👋</h1>
            <p>Đây là tổng quan điểm danh cá nhân của bạn</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/profile')}>
            <FiUser /> Cập nhật hồ sơ
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="glass-card stat-card">
            <div className="stat-icon primary"><FiCalendar /></div>
            <div className="stat-info">
              <h3>{total}</h3>
              <p>Tổng buổi học</p>
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon success"><FiCheckCircle /></div>
            <div className="stat-info">
              <h3>{presentCount}</h3>
              <p>Đã có mặt</p>
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon danger"><FiXCircle /></div>
            <div className="stat-info">
              <h3>{absentCount}</h3>
              <p>Đã vắng</p>
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon secondary"><FiBarChart2 /></div>
            <div className="stat-info">
              <h3
                style={{
                  color: rate >= 80 ? '#27ae60' : rate >= 60 ? '#f39c12' : '#e74c3c'
                }}
              >
                {rate}%
              </h3>
              <p>Tỷ lệ chuyên cần</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 style={{ marginBottom: 16 }}>Chức năng nhanh</h2>
          <div className="about-grid">
            <div className="about-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/history')}>
              <div className="about-icon"><FiClock /></div>
              <h3>Lịch sử điểm danh</h3>
              <p>Xem chi tiết từng buổi học và trạng thái có mặt / vắng của bạn.</p>
            </div>
            <div className="about-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
              <div className="about-icon"><FiUser /></div>
              <h3>Hồ sơ & Khuôn mặt</h3>
              <p>Cập nhật ảnh khuôn mặt để hệ thống AI nhận diện chính xác hơn.</p>
            </div>
            <div className="about-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/history')}>
              <div className="about-icon"><FiMessageSquare /></div>
              <h3>Gửi khiếu nại</h3>
              <p>Nếu hệ thống ghi nhầm vắng, bạn có thể gửi khiếu nại với minh chứng.</p>
            </div>
            <div className="about-item">
              <div className="about-icon"><FiBarChart2 /></div>
              <h3>Tỷ lệ chuyên cần</h3>
              <p>
                Chuyên cần của bạn:{' '}
                <strong style={{ color: rate >= 80 ? '#27ae60' : '#e74c3c' }}>{rate}%</strong>
                {rate < 80 && ' — Cần cải thiện!'}
                {rate >= 80 && ' — Tốt lắm!'}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Records */}
        <div className="fade-in" style={{ animationDelay: '0.3s', marginTop: 24 }}>
          <div className="section-header">
            <h2>Lịch sử điểm danh gần đây</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/history')}>
              Xem tất cả <FiArrowRight />
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="loader"></div></div>
          ) : myRecords.length === 0 ? (
            <div className="empty-state glass-card">
              <FiCalendar size={48} />
              <p>Chưa có dữ liệu điểm danh nào</p>
            </div>
          ) : (
            <div className="sessions-grid">
              {myRecords.slice(0, 6).map((record) => (
                <div key={record.id} className="glass-card session-card">
                  <div className="session-card-header">
                    <h3>{record.session?.sessionName || 'Buổi học'}</h3>
                    <span className={`badge badge-${record.status === 'PRESENT' ? 'present' : 'absent'}`}>
                      {record.status === 'PRESENT' ? 'Có mặt' : 'Vắng'}
                    </span>
                  </div>
                  <p className="session-date">
                    <FiCalendar /> {record.session?.date ? new Date(record.session.date).toLocaleDateString('vi-VN') : '—'}
                  </p>
                  {record.confidence && (
                    <p style={{ fontSize: '0.82rem', color: '#888', marginTop: 4 }}>
                      AI nhận diện: {record.confidence.toFixed(1)}%
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── ADMIN CHARTS SECTION ────────────────────────────────────────────────────
const AdminCharts = () => {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminAPI.getStats();
        setStats(res.data);
      } catch {
        // ignore
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (statsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <div className="loader"></div>
      </div>
    );
  }

  if (!stats) return null;

  const usersByRole = stats.usersByRole || {};
  const roleData = [
    { label: 'Admin', value: usersByRole.admin || 0, gradient: 'linear-gradient(180deg, #8b5cf6, #6d28d9)' },
    { label: 'Teacher', value: usersByRole.teacher || 0, gradient: 'linear-gradient(180deg, #3b82f6, #1d4ed8)' },
    { label: 'Student', value: usersByRole.student || 0, gradient: 'linear-gradient(180deg, #10b981, #047857)' },
  ];
  const maxRoleValue = Math.max(...roleData.map(d => d.value), 1);

  const sessionsPerDay = stats.sessionsPerDay || [];
  const maxSessionValue = Math.max(...sessionsPerDay.map(d => d.count), 1);

  const chartContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: 20,
    marginTop: 20,
  };

  const chartCardStyle = {
    padding: '24px',
    borderRadius: 12,
  };

  const barContainerStyle = {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 16,
    height: 180,
    marginTop: 20,
    paddingTop: 8,
  };

  const barWrapperStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  };

  return (
    <div className="fade-in" style={{ animationDelay: '0.25s' }}>
      <h2 style={{ marginBottom: 4, marginTop: 24 }}>📊 Thống kê hệ thống</h2>
      <div style={chartContainerStyle}>
        {/* Chart 1: Users by Role */}
        <div className="glass-card" style={chartCardStyle}>
          <h3 style={{ margin: '0 0 4px', fontSize: '1rem' }}>Tài khoản trong hệ thống</h3>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#888' }}>
            Tổng: {stats.totalUsers || 0} — Hoạt động: {stats.activeUsers || 0}
          </p>
          <div style={barContainerStyle}>
            {roleData.map((item) => {
              const heightPct = maxRoleValue > 0 ? (item.value / maxRoleValue) * 100 : 0;
              return (
                <div key={item.label} style={barWrapperStyle}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                    {item.value}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 56,
                      height: `${Math.max(heightPct, 5)}%`,
                      background: item.gradient,
                      borderRadius: '8px 8px 4px 4px',
                      transition: 'height 0.5s ease',
                      minHeight: 8,
                    }}
                  />
                  <span style={{ marginTop: 8, fontSize: '0.78rem', color: '#aaa' }}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Sessions per Day */}
        <div className="glass-card" style={chartCardStyle}>
          <h3 style={{ margin: '0 0 4px', fontSize: '1rem' }}>Điểm danh 7 ngày gần đây</h3>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#888' }}>
            Tổng phiên: {stats.totalSessions || 0} — Lớp học: {stats.totalClasses || 0}
          </p>
          <div style={barContainerStyle}>
            {sessionsPerDay.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '0.85rem' }}>
                Chưa có dữ liệu
              </div>
            ) : (
              sessionsPerDay.map((item, idx) => {
                const heightPct = maxSessionValue > 0 ? (item.count / maxSessionValue) * 100 : 0;
                const dayColors = [
                  'linear-gradient(180deg, #f59e0b, #d97706)',
                  'linear-gradient(180deg, #ef4444, #b91c1c)',
                  'linear-gradient(180deg, #8b5cf6, #6d28d9)',
                  'linear-gradient(180deg, #3b82f6, #1d4ed8)',
                  'linear-gradient(180deg, #10b981, #047857)',
                  'linear-gradient(180deg, #ec4899, #be185d)',
                  'linear-gradient(180deg, #06b6d4, #0e7490)',
                ];
                const dateStr = item.date ? new Date(item.date + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '';
                return (
                  <div key={idx} style={barWrapperStyle}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                      {item.count}
                    </span>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 40,
                        height: `${Math.max(heightPct, 5)}%`,
                        background: dayColors[idx % dayColors.length],
                        borderRadius: '8px 8px 4px 4px',
                        transition: 'height 0.5s ease',
                        minHeight: 8,
                      }}
                    />
                    <span style={{ marginTop: 8, fontSize: '0.72rem', color: '#aaa' }}>
                      {dateStr}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── TEACHER / ADMIN DASHBOARD ───────────────────────────────────────────────
const TeacherAdminDashboard = ({ user }) => {
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
        setSessions(sessRes.data.sessions || []);
        setStudentCount((stuRes.data.students || []).length);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalPresent = sessions.reduce((s, sess) => s + (sess.presentCount || 0), 0);
  const totalAbsent = sessions.reduce((s, sess) => s + (sess.absentCount || 0), 0);

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        <div className="dashboard-welcome fade-in">
          <div>
            <h1>Xin chào, {user?.fullName} 👋</h1>
            <p>Chào mừng bạn đến với hệ thống điểm danh bằng khuôn mặt</p>
          </div>
          {user?.role === 'teacher' && (
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/capture')}>
              <FiCamera /> Bắt đầu điểm danh
            </button>
          )}
        </div>

        <div className="stats-grid fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="glass-card stat-card">
            <div className="stat-icon primary"><FiClock /></div>
            <div className="stat-info"><h3>{sessions.length}</h3><p>Phiên điểm danh</p></div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon secondary"><FiUsers /></div>
            <div className="stat-info"><h3>{studentCount}</h3><p>Sinh viên</p></div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon success"><FiCheckCircle /></div>
            <div className="stat-info"><h3>{totalPresent}</h3><p>Tổng có mặt</p></div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon danger"><FiXCircle /></div>
            <div className="stat-info"><h3>{totalAbsent}</h3><p>Tổng vắng</p></div>
          </div>
        </div>

        {/* Admin Charts */}
        {user?.role === 'admin' && <AdminCharts />}

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
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loader"></div></div>
          ) : sessions.length === 0 ? (
            <div className="empty-state glass-card">
              <FiCalendar size={48} />
              <p>Chưa có phiên điểm danh nào</p>
              {user?.role === 'teacher' && (
                <button className="btn btn-primary" onClick={() => navigate('/capture')}>Tạo phiên đầu tiên</button>
              )}
            </div>
          ) : (
            <div className="sessions-grid">
              {sessions.slice(0, 6).map((session) => (
                <div key={session.id} className="glass-card session-card" onClick={() => navigate(`/attendance/${session.id}`)}>
                  <div className="session-card-header">
                    <h3>{session.sessionName}</h3>
                    <span className={`badge badge-${session.status === 'FINALIZED' ? 'present' : 'processing'}`}>
                      {session.status === 'FINALIZED' ? 'Đã chốt' : session.status}
                    </span>
                  </div>
                  <p className="session-date"><FiCalendar /> {new Date(session.date).toLocaleDateString('vi-VN')}</p>
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

// ─── MAIN ────────────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user } = useAuth();
  if (user?.role === 'student') return <StudentDashboard user={user} />;
  return <TeacherAdminDashboard user={user} />;
};

export default DashboardPage;
