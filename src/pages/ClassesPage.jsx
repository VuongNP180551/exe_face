import { useState, useEffect } from 'react';
import { classAPI, studentAPI } from '../services/api';
import Navbar from '../components/Navbar';
import {
  FiEdit2, FiTrash2, FiPlus, FiX, FiUsers, FiBook,
  FiClock, FiMapPin, FiChevronDown, FiChevronUp, FiUserPlus, FiCheck
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './ClassesPage.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_LABELS = { Monday: 'Thứ 2', Tuesday: 'Thứ 3', Wednesday: 'Thứ 4', Thursday: 'Thứ 5', Friday: 'Thứ 6', Saturday: 'Thứ 7', Sunday: 'Chủ nhật' };

const emptyForm = { className: '', subject: '', description: '', room: '', dayOfWeek: 'Monday', startTime: '08:00', endTime: '10:00', maxStudents: 30 };

const ClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedClass, setExpandedClass] = useState(null);
  const [addStudentModal, setAddStudentModal] = useState(null); // classId
  const [addStudentMode, setAddStudentMode] = useState('existing'); // 'existing' | 'new'
  const [newStudentForm, setNewStudentForm] = useState({ studentCode: '', fullName: '', email: '' });
  const [toast, setToast] = useState(null);
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'teacher';

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    try {
      const [classRes, studentRes] = await Promise.all([
        classAPI.getAll(),
        studentAPI.getAll()
      ]);
      setClasses(Array.isArray(classRes.data) ? classRes.data : classRes.data.classes || []);
      setAllStudents(Array.isArray(studentRes.data) ? studentRes.data : studentRes.data.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await classAPI.update(editingId, formData);
        showToast('success', 'Cập nhật lớp học thành công!');
      } else {
        await classAPI.create(formData);
        showToast('success', 'Thêm lớp học thành công!');
      }
      setFormData(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      showToast('error', 'Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setFormData({
      className: c.className,
      subject: c.subject || '',
      description: c.description || '',
      room: c.room || '',
      dayOfWeek: c.dayOfWeek || 'Monday',
      startTime: c.startTime?.slice(0, 5) || '08:00',
      endTime: c.endTime?.slice(0, 5) || '10:00',
      maxStudents: c.maxStudents || 30,
    });
    setShowForm(true);
    setExpandedClass(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lớp học này?')) return;
    try {
      await classAPI.delete(id);
      showToast('success', 'Xóa lớp học thành công!');
      fetchAll();
    } catch (err) {
      showToast('error', 'Lỗi xóa lớp học');
    }
  };

  const handleAddStudentToClass = async (student, targetClass) => {
    try {
      await studentAPI.update(student.id, { ...student, className: targetClass.className });
      showToast('success', `Đã thêm ${student.fullName} vào lớp ${targetClass.className}!`);
      fetchAll();
    } catch (err) {
      showToast('error', 'Lỗi khi thêm sinh viên vào lớp');
    }
  };

  const handleRemoveStudentFromClass = async (student) => {
    if (!window.confirm(`Xóa ${student.fullName} khỏi lớp này?`)) return;
    try {
      await studentAPI.update(student.id, { ...student, className: '' });
      showToast('success', `Đã xóa ${student.fullName} khỏi lớp!`);
      fetchAll();
    } catch (err) {
      showToast('error', 'Lỗi khi xóa sinh viên khỏi lớp');
    }
  };

  const handleCreateStudent = async (e, targetClass) => {
    e.preventDefault();
    try {
      await studentAPI.create({
        ...newStudentForm,
        className: targetClass.className
      });
      showToast('success', `Đã tạo và thêm sinh viên ${newStudentForm.fullName} vào lớp!`);
      setNewStudentForm({ studentCode: '', fullName: '', email: '' });
      setAddStudentMode('existing');
      fetchAll();
    } catch (err) {
      showToast('error', 'Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStudentsInClass = (className) => allStudents.filter(s => s.className === className);
  const getStudentsNotInClass = (className) => allStudents.filter(s => s.className !== className);

  const currentAddClass = addStudentModal ? classes.find(c => c.id === addStudentModal) : null;

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        {toast && (
          <div className={`toast toast-${toast.type}`} style={{ position: 'fixed', top: 80, right: 20, zIndex: 9999 }}>
            {toast.message}
          </div>
        )}

        <div className="page-header fade-in">
          <div>
            <h1>🏫 Quản lý Lớp Học</h1>
            <p>Tạo lớp học và quản lý danh sách sinh viên trong từng lớp</p>
          </div>
          {canEdit && (
            <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData(emptyForm); }}>
              <FiPlus /> {showForm ? 'Đóng form' : 'Thêm lớp mới'}
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && canEdit && (
          <div className="glass-card fade-in" style={{ marginBottom: 24 }}>
            <h2 style={{ marginBottom: 20 }}>{editingId ? '✏️ Sửa Lớp Học' : '➕ Thêm Lớp Học Mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="class-form-grid">
                <div className="form-group">
                  <label>Tên lớp <span style={{ color: 'red' }}>*</span></label>
                  <input className="input-field" placeholder="VD: Vật Lý Đại Cương" value={formData.className}
                    onChange={e => setFormData({ ...formData, className: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Môn học <span style={{ color: 'red' }}>*</span></label>
                  <input className="input-field" placeholder="VD: Vật lý" value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Phòng học</label>
                  <input className="input-field" placeholder="VD: A1-201" value={formData.room}
                    onChange={e => setFormData({ ...formData, room: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Ngày học</label>
                  <select className="select-field" value={formData.dayOfWeek}
                    onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })}>
                    {DAYS.map(d => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Giờ bắt đầu <span style={{ color: 'red' }}>*</span></label>
                  <input className="input-field" type="time" value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Giờ kết thúc <span style={{ color: 'red' }}>*</span></label>
                  <input className="input-field" type="time" value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })} required />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Mô tả</label>
                  <input className="input-field" placeholder="Mô tả ngắn về lớp học" value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button type="submit" className="btn btn-primary"><FiCheck /> {editingId ? 'Cập nhật' : 'Tạo lớp'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingId(null); setFormData(emptyForm); }}><FiX /> Hủy</button>
              </div>
            </form>
          </div>
        )}

        {/* Class List */}
        {loading ? <div className="loader" style={{ margin: '60px auto' }}></div> : (
          <div className="class-list">
            {classes.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>
                <FiBook size={48} style={{ marginBottom: 16 }} />
                <p>Chưa có lớp học nào. Hãy thêm lớp mới!</p>
              </div>
            ) : classes.map((c, idx) => {
              const studentsInClass = getStudentsInClass(c.className);
              const isExpanded = expandedClass === c.id;
              return (
                <div key={c.id} className="class-card glass-card fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="class-card-header" onClick={() => setExpandedClass(isExpanded ? null : c.id)}>
                    <div className="class-card-info">
                      <div className="class-color-dot" style={{ backgroundColor: `hsl(${c.id * 47}, 65%, 55%)` }}></div>
                      <div>
                        <h3>{c.className}</h3>
                        <p className="class-subject"><FiBook /> {c.subject}</p>
                      </div>
                    </div>
                    <div className="class-card-meta">
                      {c.room && <span className="class-meta-tag"><FiMapPin /> {c.room}</span>}
                      {c.dayOfWeek && <span className="class-meta-tag"><FiClock /> {DAY_LABELS[c.dayOfWeek] || c.dayOfWeek} {c.startTime?.slice(0,5)}–{c.endTime?.slice(0,5)}</span>}
                      <span className="class-meta-tag students-count"><FiUsers /> {studentsInClass.length} SV</span>
                      {canEdit && (
                        <div className="class-actions" onClick={e => e.stopPropagation()}>
                          <button className="icon-btn edit-btn" title="Sửa" onClick={() => handleEdit(c)}><FiEdit2 /></button>
                          <button className="icon-btn delete-btn" title="Xóa" onClick={() => handleDelete(c.id)}><FiTrash2 /></button>
                        </div>
                      )}
                      <span className="expand-icon">{isExpanded ? <FiChevronUp /> : <FiChevronDown />}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="class-students-panel">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h4>👥 Danh sách sinh viên ({studentsInClass.length})</h4>
                        {canEdit && (
                          <button className="btn btn-primary btn-sm" onClick={() => setAddStudentModal(c.id)}>
                            <FiUserPlus /> Thêm sinh viên
                          </button>
                        )}
                      </div>
                      {studentsInClass.length === 0 ? (
                        <p style={{ color: '#aaa', textAlign: 'center', padding: '20px 0' }}>Chưa có sinh viên nào trong lớp này.</p>
                      ) : (
                        <div className="student-chips">
                          {studentsInClass.map(s => (
                            <div key={s.id} className="student-chip">
                              <div className="student-chip-avatar">
                                {s.avatar ? <img src={`http://localhost:5000${s.avatar}`} alt="" /> : s.fullName?.charAt(0)}
                              </div>
                              <div>
                                <strong>{s.fullName}</strong>
                                <span>{s.studentCode}</span>
                              </div>
                              {canEdit && (
                                <button className="chip-remove-btn" title="Xóa khỏi lớp" onClick={() => handleRemoveStudentFromClass(s)}>
                                  <FiX />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add Student Modal */}
        {addStudentModal && currentAddClass && (
          <div className="modal-overlay" onClick={() => setAddStudentModal(null)}>
            <div className="modal-content glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, width: '90%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3>Thêm sinh viên vào <strong>{currentAddClass.className}</strong></h3>
                <button className="icon-btn" onClick={() => { setAddStudentModal(null); setAddStudentMode('existing'); }}><FiX /></button>
              </div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <button 
                  className={`btn ${addStudentMode === 'existing' ? 'btn-primary' : 'btn-secondary'}`} 
                  onClick={() => setAddStudentMode('existing')}
                >Chọn từ danh sách</button>
                <button 
                  className={`btn ${addStudentMode === 'new' ? 'btn-primary' : 'btn-secondary'}`} 
                  onClick={() => setAddStudentMode('new')}
                >Tạo sinh viên mới</button>
              </div>

              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {addStudentMode === 'existing' ? (
                  getStudentsNotInClass(currentAddClass.className).length === 0 ? (
                    <p style={{ color: '#aaa', textAlign: 'center', padding: 20 }}>Tất cả sinh viên đã ở trong lớp này hoặc không có sinh viên nào.</p>
                  ) : getStudentsNotInClass(currentAddClass.className).map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#667eea', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                          {s.avatar ? <img src={`http://localhost:5000${s.avatar}`} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} /> : s.fullName?.charAt(0)}
                        </div>
                        <div>
                          <strong>{s.fullName}</strong>
                          <div style={{ fontSize: '0.85rem', color: '#888' }}>{s.studentCode} {s.className ? `• Đang ở lớp: ${s.className}` : '• Chưa có lớp'}</div>
                        </div>
                      </div>
                      <button className="btn btn-success btn-sm" onClick={() => { handleAddStudentToClass(s, currentAddClass); setAddStudentModal(null); }}>
                        <FiUserPlus /> Thêm
                      </button>
                    </div>
                  ))
                ) : (
                  <form onSubmit={(e) => handleCreateStudent(e, currentAddClass)} style={{ display: 'flex', flexDirection: 'column', gap: 15, paddingRight: 10 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 5 }}>Mã Sinh Viên *</label>
                      <input className="input-field" required placeholder="VD: SV001" value={newStudentForm.studentCode} onChange={e => setNewStudentForm({...newStudentForm, studentCode: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 5 }}>Họ và Tên *</label>
                      <input className="input-field" required placeholder="Nguyễn Văn A" value={newStudentForm.fullName} onChange={e => setNewStudentForm({...newStudentForm, fullName: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 5 }}>Email</label>
                      <input className="input-field" type="email" placeholder="sv001@school.edu.vn" value={newStudentForm.email} onChange={e => setNewStudentForm({...newStudentForm, email: e.target.value})} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: 10 }}>
                      <FiUserPlus /> Tạo và Thêm vào Lớp
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassesPage;
