import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, studentAPI, SERVER_BASE_URL } from '../services/api';
import Navbar from '../components/Navbar';
import { FiUser, FiMail, FiCamera, FiSave, FiTrash2, FiImage } from 'react-icons/fi';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ fullName: '', email: '' });
  const [faceDataList, setFaceDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingFace, setUploadingFace] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({ fullName: user.fullName || '', email: user.email || '' });
      if (user.role === 'student' && user.studentId) {
        fetchFaceData();
      }
    }
  }, [user]);

  const fetchFaceData = async () => {
    try {
      const res = await studentAPI.getFaceData(user.studentId);
      setFaceDataList(res.data.faceData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await userAPI.updateProfile(formData);
      setMessage('Cập nhật thông tin thành công!');
    } catch (error) {
      setMessage('Có lỗi xảy ra khi cập nhật.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const data = new FormData();
      data.append('avatar', file);
      await userAPI.uploadAvatar(data);
      setMessage('Cập nhật ảnh đại diện thành công! Vui lòng đăng nhập lại để cập nhật ảnh.');
    } catch (error) {
      setMessage('Lỗi upload ảnh.');
    } finally {
      setLoading(false);
    }
  };

  const handleFaceDataUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingFace(true);
    setMessage('');
    try {
      const data = new FormData();
      for (let i = 0; i < files.length; i++) {
        data.append('images', files[i]);
      }
      await studentAPI.uploadFaceData(user.studentId, data);
      setMessage('Tải ảnh khuôn mặt thành công!');
      fetchFaceData();
    } catch (error) {
      setMessage('Lỗi upload ảnh khuôn mặt.');
    } finally {
      setUploadingFace(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDeleteFaceData = async (faceId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) return;
    try {
      await studentAPI.deleteFaceData(user.studentId, faceId);
      fetchFaceData();
    } catch (error) {
      setMessage('Lỗi khi xóa ảnh.');
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        <div className="profile-container fade-in">
          <div className="glass-card profile-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2>Hồ sơ cá nhân</h2>
            {message && <div className="alert-info">{message}</div>}
            
            <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
              <div className="left-panel">
                <div className="avatar-section">
                  <div className="avatar-preview">
                    {user?.avatar ? (
                      <img src={`${SERVER_BASE_URL}${user.avatar}`} alt="Avatar" />
                    ) : (
                      <FiUser size={48} />
                    )}
                  </div>
                  <label className="btn btn-secondary">
                    <FiCamera /> Đổi Avatar
                    <input type="file" hidden accept="image/*" onChange={handleAvatarChange} disabled={loading} />
                  </label>
                </div>

                {user?.role === 'student' && (
                  <div className="face-data-section" style={{ marginTop: '2rem' }}>
                    <h3>Dữ liệu Khuôn mặt</h3>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
                      Tải lên các góc mặt khác nhau để AI nhận diện điểm danh chính xác hơn.
                    </p>
                    
                    <div className="face-gallery" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      {faceDataList.map(fd => (
                        <div key={fd.id} className="face-item" style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden' }}>
                          <img src={`${SERVER_BASE_URL}${fd.faceImageUrl}`} alt="Face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            className="btn-delete-face" 
                            onClick={() => handleDeleteFaceData(fd.id)}
                            style={{ position: 'absolute', top: 2, right: 2, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <label className="btn btn-primary btn-block">
                      {uploadingFace ? 'Đang tải...' : <><FiImage /> Thêm ảnh khuôn mặt</>}
                      <input type="file" hidden accept="image/*" multiple onChange={handleFaceDataUpload} disabled={uploadingFace} />
                    </label>
                  </div>
                )}
              </div>

              <div className="right-panel">
                <form onSubmit={handleUpdateProfile} className="profile-form">
                  <div className="form-group">
                    <label>Tài khoản</label>
                    <div className="input-group">
                      <input type="text" value={user?.username || ''} disabled style={{ backgroundColor: '#f5f5f5' }} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Vai trò</label>
                    <div className="input-group">
                      <input type="text" value={user?.role?.toUpperCase() || ''} disabled style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Họ và tên</label>
                    <div className="input-group">
                      <FiUser className="input-icon" />
                      <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <div className="input-group">
                      <FiMail className="input-icon" />
                      <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: '2rem' }}>
                    <FiSave /> Lưu thay đổi
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
