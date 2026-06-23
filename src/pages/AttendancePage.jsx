import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attendanceAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { FiSave, FiArrowLeft, FiCheckCircle, FiXCircle, FiUsers, FiCalendar, FiMessageSquare, FiDownload } from 'react-icons/fi';
import './AttendancePage.css';

const AttendancePage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [records, setRecords] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [finalizing, setFinalizing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchSessionAndAppeals = async () => {
    try {
      const [sessionRes, appealsRes] = await Promise.all([
        attendanceAPI.getSession(sessionId),
        attendanceAPI.getAppeals()
      ]);
      setSession(sessionRes.data.session);
      setRecords(
        sessionRes.data.session.records.map((r) => ({
          id: r.id,
          studentCode: r.student.studentCode,
          fullName: r.student.fullName,
          className: r.student.className,
          status: r.status,
          confidence: r.confidence,
          isManualEdited: r.isManualEdited,
          note: r.note || '',
        }))
      );
      
      const filteredAppeals = appealsRes.data.appeals.filter(
        a => a.attendanceRecord?.sessionId === parseInt(sessionId)
      );
      setAppeals(filteredAppeals);
    } catch {
      setToast({ type: 'error', message: 'Không thể tải dữ liệu phiên điểm danh.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionAndAppeals();
  }, [sessionId]);

  const isExpired = session && (Date.now() - new Date(session.createdAt).getTime()) > 24 * 60 * 60 * 1000;
  const isLocked = session?.status === 'FINALIZED' || isExpired;

  const toggleStatus = async (index) => {
    if (session?.status === 'FINALIZED') {
      setToast({ type: 'error', message: 'Phiên này đã chốt sổ, không thể sửa.' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (isExpired) {
      setToast({ type: 'error', message: 'Đã quá 24 giờ, không thể chỉnh sửa điểm danh.' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const updated = [...records];
    const newStatus = updated[index].status === 'PRESENT' ? 'ABSENT' : 'PRESENT';
    updated[index].status = newStatus;
    updated[index].isManualEdited = true;
    setRecords(updated);

    try {
      await attendanceAPI.updateRecord(sessionId, updated[index].id, {
        status: newStatus,
        note: updated[index].note
      });
    } catch {
      setToast({ type: 'error', message: 'Sửa trạng thái thất bại.' });
      fetchSessionAndAppeals(); // revert
    }
  };

  const handleFinalize = async () => {
    setFinalizing(true);
    try {
      await attendanceAPI.finalizeSession(sessionId);
      setToast({ type: 'success', message: 'Đã chốt sổ điểm danh thành công!' });
      setTimeout(() => setToast(null), 3000);
      fetchSessionAndAppeals();
    } catch {
      setToast({ type: 'error', message: 'Chốt sổ thất bại. Vui lòng thử lại.' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setFinalizing(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await attendanceAPI.exportSession(sessionId);
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${sessionId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setToast({ type: 'success', message: 'Xuất CSV thành công!' });
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast({ type: 'error', message: 'Xuất CSV thất bại. Vui lòng thử lại.' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setExporting(false);
    }
  };

  const handleApproveAppeal = async (appealId, status) => {
    try {
      await attendanceAPI.updateAppeal(appealId, { status });
      setToast({ type: 'success', message: `Đã ${status === 'APPROVED' ? 'duyệt' : 'từ chối'} khiếu nại.` });
      setTimeout(() => setToast(null), 3000);
      fetchSessionAndAppeals();
    } catch {
      setToast({ type: 'error', message: 'Lỗi khi xử lý khiếu nại.' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const absentCount = records.filter((r) => r.status === 'ABSENT').length;

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
        {toast && (
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? <FiCheckCircle /> : <FiXCircle />} {toast.message}
          </div>
        )}

        {/* 24-hour expired warning */}
        {isExpired && session?.status !== 'FINALIZED' && (
          <div
            className="fade-in"
            style={{
              background: 'rgba(243, 156, 18, 0.12)',
              border: '1px solid rgba(243, 156, 18, 0.4)',
              borderRadius: 10,
              padding: '12px 18px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: '#f39c12',
              fontSize: '0.92rem',
              fontWeight: 500,
            }}
          >
            ⏰ Đã quá 24 giờ - Không thể chỉnh sửa điểm danh
          </div>
        )}

        {/* Header */}
        <div className="attendance-header fade-in">
          <div className="header-left">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/history')}>
              <FiArrowLeft /> Lịch sử
            </button>
            <div>
              <h1>{session?.sessionName}</h1>
              <p className="session-meta">
                <FiCalendar /> {session && new Date(session.date).toLocaleDateString('vi-VN')}
                <span className="meta-separator">•</span>
                <FiUsers /> {records.length} sinh viên
                <span className="meta-separator">•</span>
                Trạng thái: <strong>{session?.status}</strong>
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-secondary btn-lg"
              onClick={handleExportCSV}
              disabled={exporting}
            >
              {exporting ? 'Đang xuất...' : <>📥 Xuất CSV</>}
            </button>
            {session?.status !== 'FINALIZED' && (
              <button
                className="btn btn-success btn-lg"
                onClick={handleFinalize}
                disabled={finalizing}
              >
                {finalizing ? 'Đang xử lý...' : <><FiSave /> Chốt sổ điểm danh</>}
              </button>
            )}
          </div>
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

        {/* Appeals Section */}
        {appeals.length > 0 && (
          <div className="glass-card fade-in" style={{ marginBottom: '20px', animationDelay: '0.15s', borderLeft: '4px solid #f39c12' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiMessageSquare /> Khiếu nại từ sinh viên</h3>
            <div style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
              {appeals.map(appeal => (
                <div key={appeal.id} style={{ padding: '15px', background: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{appeal.student?.fullName}</strong> ({appeal.student?.studentCode})
                      <p style={{ margin: '8px 0', color: '#555' }}>Lý do: {appeal.reason}</p>
                      {appeal.evidenceUrl && (
                        <a href={`http://localhost:5000${appeal.evidenceUrl}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem', color: '#3498db' }}>
                          Xem minh chứng
                        </a>
                      )}
                    </div>
                    {appeal.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn btn-success btn-sm" onClick={() => handleApproveAppeal(appeal.id, 'APPROVED')}>Duyệt (Có mặt)</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleApproveAppeal(appeal.id, 'REJECTED')}>Từ chối</button>
                      </div>
                    ) : (
                      <span className={`badge badge-${appeal.status.toLowerCase()}`}>{appeal.status}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
                <th>AI Confidence</th>
                <th>Trạng thái</th>
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
                    {record.confidence ? `${record.confidence.toFixed(1)}%` : 'N/A'}
                    {record.isManualEdited && <span style={{ marginLeft: 8, fontSize: '0.8rem', color: '#f39c12' }}>(Sửa tay)</span>}
                  </td>
                  <td>
                    <button
                      className={`badge badge-${record.status.toLowerCase()} status-toggle`}
                      onClick={() => toggleStatus(index)}
                      title="Nhấn để thay đổi trạng thái"
                      disabled={isLocked}
                      style={{ cursor: isLocked ? 'default' : 'pointer' }}
                    >
                      {record.status === 'PRESENT' ? (
                        <><FiCheckCircle /> Có mặt</>
                      ) : (
                        <><FiXCircle /> Vắng</>
                      )}
                    </button>
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
