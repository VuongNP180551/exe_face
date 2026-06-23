import { useState, useEffect } from 'react';
import { scheduleAPI, classAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './AdminUsersPage.css'; // Reusing common styles

const SchedulesPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ classId: '', dayOfWeek: 'Monday', startTime: '', endTime: '', room: '' });
  const [editingId, setEditingId] = useState(null);
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'teacher';

  const fetchData = async () => {
    try {
      const [schedRes, classRes] = await Promise.all([
        scheduleAPI.getAll(),
        classAPI.getAll()
      ]);
      setSchedules(Array.isArray(schedRes.data) ? schedRes.data : schedRes.data.schedules || []);
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
      if (editingId) {
        await scheduleAPI.update(editingId, formData);
      } else {
        await scheduleAPI.create(formData);
      }
      setFormData({ classId: '', dayOfWeek: 'Monday', startTime: '', endTime: '', room: '' });
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (s) => {
    setEditingId(s.id);
    setFormData({ classId: s.classId, dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime, room: s.room || '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch trình này?')) return;
    try {
      await scheduleAPI.delete(id);
      fetchData();
    } catch (err) {
      alert('Lỗi xóa lịch trình');
    }
  };

  const daysOfWeek = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        <div className="admin-container fade-in">
          {canEdit && (
            <div className="glass-card form-card">
              <h2>{editingId ? 'Sửa Lịch Trình' : 'Thêm Lịch Trình'}</h2>
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-grid">
                  <select value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})} required className="input-field" disabled={!!editingId}>
                    <option value="">-- Chọn Lớp --</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
                  </select>
                  <select value={formData.dayOfWeek} onChange={e => setFormData({...formData, dayOfWeek: e.target.value})} required className="input-field">
                    <option value="Monday">Thứ 2</option>
                    <option value="Tuesday">Thứ 3</option>
                    <option value="Wednesday">Thứ 4</option>
                    <option value="Thursday">Thứ 5</option>
                    <option value="Friday">Thứ 6</option>
                    <option value="Saturday">Thứ 7</option>
                    <option value="Sunday">Chủ nhật</option>
                  </select>
                  <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} required className="input-field" />
                  <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} required className="input-field" />
                  <input type="text" placeholder="Phòng học" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} required className="input-field" />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary"><FiPlus /> {editingId ? 'Cập nhật' : 'Thêm mới'}</button>
                  {editingId && <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setFormData({ classId: '', dayOfWeek: 'Monday', startTime: '', endTime: '', room: '' }); }}>Hủy</button>}
                </div>
              </form>
            </div>
          )}

          <div className="glass-card table-card mt-4">
            <h2>Danh sách Lịch Trình</h2>
            {loading ? <div className="loader"></div> : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Lớp học</th>
                      <th>Ngày trong tuần</th>
                      <th>Phòng học</th>
                      <th>Thời gian</th>
                      {canEdit && <th>Thao tác</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map(s => {
                      const classInfo = classes.find(c => c.id === s.classId);
                      return (
                        <tr key={s.id}>
                          <td>{classInfo ? classInfo.className : s.classId}</td>
                          <td>{s.dayOfWeek}</td>
                          <td>{s.room}</td>
                          <td>{s.startTime} - {s.endTime}</td>
                          {canEdit && (
                            <td>
                              <button className="icon-btn edit-btn" onClick={() => handleEdit(s)}><FiEdit2 /></button>
                              <button className="icon-btn delete-btn" onClick={() => handleDelete(s.id)}><FiTrash2 /></button>
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

export default SchedulesPage;
