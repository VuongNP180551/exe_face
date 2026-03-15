import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attendanceAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { FiSave, FiArrowLeft, FiCheckCircle, FiXCircle, FiEdit3, FiUsers, FiCalendar } from 'react-icons/fi';
import './AttendancePage.css';

const AttendancePage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [edited, setEdited] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await attendanceAPI.getSession(sessionId);
        setSession(res.data.session);
        setRecords(
          res.data.session.records.map((r) => ({
            id: r.id,
            studentCode: r.student.studentCode,
            fullName: r.student.fullName,
            className: r.student.className,
            status: r.status,
            note: r.note || '',
          }))
        );
      } catch {
        setToast({ type: 'error', message: 'Không thể tải dữ liệu phiên điểm danh.' });
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const toggleStatus = (index) => {
    const updated = [...records];
    updated[index].status = updated[index].status === 'present' ? 'absent' : 'present';
    setRecords(updated);
    setEdited(true);
  };

  const updateNote = (index, note) => {
    const updated = [...records];
    updated[index].note = note;
    setRecords(updated);
    setEdited(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await attendanceAPI.updateSession(sessionId, {
        records: records.map((r) => ({
          id: r.id,
          status: r.status,
          note: r.note,
        })),
        status: 'saved',
      });
      setEdited(false);
      setToast({ type: 'success', message: 'Điểm danh đã được lưu thành công!' });
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast({ type: 'error', message: 'Lưu thất bại. Vui lòng thử lại.' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;

  if (loading) {
    return (
      <div className="page-container">
        <Navbar />
        <div className="page-content" style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        {/* Toast */}
        {toast && (
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? <FiCheckCircle /> : <FiXCircle />} {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="attendance-header fade-in">
          <div className="header-left">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard')}>
              <FiArrowLeft /> Quay lại
            </button>
            <div>
              <h1>{session?.sessionName}</h1>
              <p className="session-meta">
                <FiCalendar /> {session && new Date(session.date).toLocaleDateString('vi-VN')}
                <span className="meta-separator">•</span>
                <FiUsers /> {records.length} sinh viên
              </p>
            </div>
          </div>
          <button
            className="btn btn-success btn-lg"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="loader" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
                Đang lưu...
              </>
            ) : (
              <>
                <FiSave /> Lưu điểm danh
              </>
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="attendance-stats fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="glass-card att-stat">
            <div className="att-stat-value present">{presentCount}</div>
            <div className="att-stat-label">Có mặt</div>
          </div>
          <div className="glass-card att-stat">
            <div className="att-stat-value absent">{absentCount}</div>
            <div className="att-stat-label">Vắng</div>
          </div>
          <div className="glass-card att-stat">
            <div className="att-stat-value total">{records.length}</div>
            <div className="att-stat-label">Tổng</div>
          </div>
          <div className="glass-card att-stat">
            <div className="att-stat-value rate">
              {records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0}%
            </div>
            <div className="att-stat-label">Tỷ lệ</div>
          </div>
        </div>

        {/* Info banner */}
        {edited && (
          <div className="edit-banner fade-in">
            <FiEdit3 />
            <span>Bạn đã chỉnh sửa danh sách. Nhấn <strong>"Lưu điểm danh"</strong> để lưu thay đổi.</span>
          </div>
        )}

        {/* Table */}
        <div className="glass-card attendance-table-wrapper fade-in" style={{ animationDelay: '0.2s' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>MSSV</th>
                <th>Họ & Tên</th>
                <th>Lớp</th>
                <th>Trạng thái</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={record.id} className="slide-in" style={{ animationDelay: `${index * 0.03}s` }}>
                  <td>{index + 1}</td>
                  <td><strong>{record.studentCode}</strong></td>
                  <td>{record.fullName}</td>
                  <td>{record.className}</td>
                  <td>
                    <button
                      className={`badge badge-${record.status} status-toggle`}
                      onClick={() => toggleStatus(index)}
                      title="Nhấn để thay đổi trạng thái"
                    >
                      {record.status === 'present' ? (
                        <><FiCheckCircle /> Có mặt</>
                      ) : (
                        <><FiXCircle /> Vắng</>
                      )}
                    </button>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="note-input"
                      placeholder="Thêm ghi chú..."
                      value={record.note}
                      onChange={(e) => updateNote(index, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
