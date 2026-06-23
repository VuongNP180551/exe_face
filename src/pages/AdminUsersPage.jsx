import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { FiEdit2, FiTrash2, FiUserPlus } from 'react-icons/fi';
import './AdminUsersPage.css';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', email: '', fullName: '', role: 'teacher', studentCode: '', className: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getUsers();
      setUsers(Array.isArray(res.data) ? res.data : res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminAPI.updateUser(editingId, formData);
      } else {
        await adminAPI.createUser(formData);
      }
      setFormData({ username: '', password: '', email: '', fullName: '', role: 'teacher', studentCode: '', className: '' });
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (u) => {
    setEditingId(u.id);
    setFormData({ username: u.username, password: '', email: u.email, fullName: u.fullName, role: u.role, studentCode: '', className: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa user này?')) return;
    try {
      await adminAPI.deleteUser(id);
      fetchUsers();
    } catch (err) {
      alert('Lỗi xóa user');
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        <div className="admin-container fade-in">
          <div className="glass-card form-card">
            <h2>{editingId ? 'Sửa Người Dùng' : 'Thêm Người Dùng'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-grid">
                <input type="text" placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required disabled={!!editingId} className="input-field" />
                {!editingId && <input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required className="input-field" />}
                <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="input-field" />
                <input type="text" placeholder="Họ Tên" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required className="input-field" />
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="input-field">
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
                {formData.role === 'student' && !editingId && (
                  <>
                    <input type="text" placeholder="Mã sinh viên" value={formData.studentCode} onChange={e => setFormData({...formData, studentCode: e.target.value})} required className="input-field" />
                    <input type="text" placeholder="Lớp (VD: Vật lý)" value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})} className="input-field" />
                  </>
                )}
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary"><FiUserPlus /> {editingId ? 'Cập nhật' : 'Thêm mới'}</button>
                {editingId && <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setFormData({ username: '', password: '', email: '', fullName: '', role: 'teacher', studentCode: '', className: '' }); }}>Hủy</button>}
              </div>
            </form>
          </div>

          <div className="glass-card table-card mt-4">
            <h2>Danh sách Người Dùng</h2>
            {loading ? <div className="loader"></div> : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Họ tên</th>
                      <th>Email</th>
                      <th>Quyền</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.username}</td>
                        <td>{u.fullName}</td>
                        <td>{u.email}</td>
                        <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                        <td>
                          <button className="icon-btn edit-btn" onClick={() => handleEdit(u)}><FiEdit2 /></button>
                          <button className="icon-btn delete-btn" onClick={() => handleDelete(u.id)}><FiTrash2 /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
