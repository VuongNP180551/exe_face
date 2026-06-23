import { useState, useEffect } from 'react';
import { registrationAPI, studentAPI, classAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { FiCheck, FiX, FiPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './AdminUsersPage.css'; // Reusing common styles

const RegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ studentId: '', classId: '' });
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'teacher';

  const fetchData = async () => {
    try {
      const [regRes, stuRes, classRes] = await Promise.all([
        registrationAPI.getAll(),
        studentAPI.getAll(),
        classAPI.getAll()
      ]);
      setRegistrations(Array.isArray(regRes.data) ? regRes.data : regRes.data.registrations || []);
      setStudents(Array.isArray(stuRes.data) ? stuRes.data : stuRes.data.students || []);
      setClasses(Array.isArray(classRes.data) ? classRes.data : classRes.data.classes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registrationAPI.create(formData);
      setFormData({ studentId: '', classId: '' });
      fetchData();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await registrationAPI.updateStatus(id, { status });
      fetchData();
    } catch (err) {
      alert('Lỗi cập nhật trạng thái');
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        <div className="admin-container fade-in">
          {canEdit && (
            <div className="glass-card form-card">
              <h2>Đăng ký Sinh viên vào Lớp</h2>
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-grid">
                  <select value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} required className="input-field">
                    <option value="">-- Chọn Sinh Viên --</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.studentCode} - {s.fullName}</option>)}
                  </select>
                  <select value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})} required className="input-field">
                    <option value="">-- Chọn Lớp --</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
                  </select>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary"><FiPlus /> Thêm Đăng Ký</button>
                </div>
              </form>
            </div>
          )}

          <div className="glass-card table-card mt-4">
            <h2>Danh sách Đăng ký</h2>
            {loading ? <div className="loader"></div> : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sinh viên</th>
                      <th>Lớp học</th>
                      <th>Ngày đăng ký</th>
                      <th>Trạng thái</th>
                      {canEdit && <th>Thao tác</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map(r => {
                      const studentInfo = students.find(s => s.id === r.studentId);
                      const classInfo = classes.find(c => c.id === r.classId);
                      return (
                        <tr key={r.id}>
                          <td>{studentInfo ? `${studentInfo.studentCode} - ${studentInfo.fullName}` : r.studentId}</td>
                          <td>{classInfo ? classInfo.className : r.classId}</td>
                          <td>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</td>
                          <td>
                            <span className={`badge badge-${r.status === 'approved' ? 'student' : r.status === 'rejected' ? 'admin' : 'teacher'}`}>
                              {r.status}
                            </span>
                          </td>
                          {canEdit && (
                            <td>
                              {r.status === 'pending' && (
                                <>
                                  <button className="icon-btn edit-btn" onClick={() => handleUpdateStatus(r.id, 'approved')} title="Duyệt"><FiCheck /></button>
                                  <button className="icon-btn delete-btn" onClick={() => handleUpdateStatus(r.id, 'rejected')} title="Từ chối"><FiX /></button>
                                </>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
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

export default RegistrationsPage;
