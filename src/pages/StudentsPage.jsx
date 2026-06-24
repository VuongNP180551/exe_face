import { useState, useEffect } from 'react';
import { studentAPI, classAPI, SERVER_BASE_URL } from '../services/api';
import Navbar from '../components/Navbar';
import { FiEdit2, FiTrash2, FiUserPlus, FiX, FiCheck, FiSearch, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './StudentsPage.css';

const emptyForm = { studentCode: '', fullName: '', dob: '', className: '' };

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [toast, setToast] = useState(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        studentAPI.getAll(),
        classAPI.getAll()
      ]);
      setStudents(Array.isArray(sRes.data) ? sRes.data : sRes.data.students || []);
      setClasses(Array.isArray(cRes.data) ? cRes.data : cRes.data.classes || []);
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
        await studentAPI.update(editingId, formData);
        showToast('success', 'Cập nhật sinh viên thành công!');
      } else {
        await studentAPI.create(formData);
        showToast('success', 'Thêm sinh viên thành công!');
      }
      setFormData(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      showToast('error', 'Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (s) => {
    setEditingId(s.id);
    setFormData({ studentCode: s.studentCode, fullName: s.fullName, dob: s.dob?.split('T')[0] || '', className: s.className || '' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) return;
    try {
      await studentAPI.delete(id);
      showToast('success', 'Xóa sinh viên thành công!');
      fetchAll();
    } catch (err) {
      showToast('error', 'Lỗi xóa sinh viên');
    }
  };

  const filtered = students.filter(s => {
    const matchSearch = !search || s.fullName?.toLowerCase().includes(search.toLowerCase()) || s.studentCode?.toLowerCase().includes(search.toLowerCase());
    const matchClass = !filterClass || s.className === filterClass;
    return matchSearch && matchClass;
  });

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
            <h1>👥 Quản lý Sinh Viên</h1>
            <p>Thêm, sửa, xóa sinh viên và gán vào lớp học</p>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData(emptyForm); }}>
              <FiUserPlus /> {showForm ? 'Đóng form' : 'Thêm sinh viên'}
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && isAdmin && (
          <div className="glass-card fade-in" style={{ marginBottom: 24 }}>
            <h2 style={{ marginBottom: 20 }}>{editingId ? '✏️ Sửa Sinh Viên' : '➕ Thêm Sinh Viên Mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="class-form-grid">
                <div className="form-group">
                  <label>Mã sinh viên <span style={{ color: 'red' }}>*</span></label>
                  <input className="input-field" placeholder="VD: SV001" value={formData.studentCode}
                    onChange={e => setFormData({ ...formData, studentCode: e.target.value })} required disabled={!!editingId} />
                </div>
                <div className="form-group">
                  <label>Họ và tên <span style={{ color: 'red' }}>*</span></label>
                  <input className="input-field" placeholder="Nguyễn Văn A" value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Ngày sinh</label>
                  <input className="input-field" type="date" value={formData.dob}
                    onChange={e => setFormData({ ...formData, dob: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Gán vào lớp</label>
                  <select className="select-field" value={formData.className}
                    onChange={e => setFormData({ ...formData, className: e.target.value })}>
                    <option value="">-- Chưa có lớp --</option>
                    {classes.map(c => <option key={c.id} value={c.className}>{c.className}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button type="submit" className="btn btn-primary"><FiCheck /> {editingId ? 'Cập nhật' : 'Thêm mới'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingId(null); setFormData(emptyForm); }}><FiX /> Hủy</button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="glass-card fade-in" style={{ marginBottom: 20, padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
              <input className="input-field" style={{ paddingLeft: 36 }} placeholder="Tìm theo tên hoặc mã SV..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="select-field" style={{ width: 'auto', minWidth: 180 }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
              <option value="">Tất cả lớp</option>
              {classes.map(c => <option key={c.id} value={c.className}>{c.className}</option>)}
            </select>
            <span style={{ color: '#888', fontSize: '0.9rem' }}>{filtered.length} sinh viên</span>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card fade-in" style={{ animationDelay: '0.15s' }}>
          {loading ? <div className="loader" style={{ margin: '40px auto' }}></div> : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>#</th>
                    <th>Ảnh</th>
                    <th>Mã SV</th>
                    <th>Họ tên</th>
                    <th>Ngày sinh</th>
                    <th>Lớp học</th>
                    {isAdmin && <th>Thao tác</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', color: '#aaa', padding: 40 }}>Không có sinh viên nào.</td></tr>
                  ) : filtered.map((s, i) => (
                    <tr key={s.id} className="slide-in" style={{ animationDelay: `${i * 0.03}s` }}>
                      <td>{i + 1}</td>
                      <td>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                          {s.avatar ? <img src={`${SERVER_BASE_URL}${s.avatar}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FiUser />}
                        </div>
                      </td>
                      <td><strong>{s.studentCode}</strong></td>
                      <td>{s.fullName}</td>
                      <td>{s.dob ? new Date(s.dob).toLocaleDateString('vi-VN') : '—'}</td>
                      <td>
                        {s.className
                          ? <span style={{ background: 'rgba(102,126,234,0.1)', padding: '3px 10px', borderRadius: 12, fontSize: '0.85rem', color: '#667eea', fontWeight: 600 }}>{s.className}</span>
                          : <span style={{ color: '#ccc', fontSize: '0.85rem' }}>Chưa có lớp</span>}
                      </td>
                      {isAdmin && (
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="icon-btn edit-btn" title="Sửa" onClick={() => handleEdit(s)}><FiEdit2 /></button>
                            <button className="icon-btn delete-btn" title="Xóa" onClick={() => handleDelete(s.id)}><FiTrash2 /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentsPage;
