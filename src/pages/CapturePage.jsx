import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { attendanceAPI, classAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { FiCamera, FiUpload, FiRefreshCw, FiCheck, FiX, FiImage, FiPlayCircle } from 'react-icons/fi';
import './CapturePage.css';

const CapturePage = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [mode, setMode] = useState('init'); // init, choose, webcam, preview
  const [session, setSession] = useState(null); // stores the created session
  const [capturedImage, setCapturedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [sessionName, setSessionName] = useState('');
  const [classList, setClassList] = useState([]);
  const [classId, setClassId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await classAPI.getAll();
        const classes = Array.isArray(res.data) ? res.data : (res.data.classes || []);
        if (classes.length > 0) {
          setClassList(classes);
          setClassId(classes[0].id);
        }
      } catch (err) {
        console.error('Fetch classes error:', err);
      }
    };
    fetchClasses();
  }, []);

  const handleOpenSession = async () => {
    if (!classId) {
      setError('Vui lòng chọn lớp học');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await attendanceAPI.createSession({ classId, sessionName });
      setSession(res.data.session);
      setMode('choose');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi khi tạo phiên điểm danh.');
    } finally {
      setLoading(false);
    }
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setMode('preview');

      // Convert base64 to file
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
          setImageFile(file);
        });
    }
  }, [webcamRef]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedImage(reader.result);
        setMode('preview');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setImageFile(null);
    setMode('webcam');
  };

  const handleProcessAI = async () => {
    if (!imageFile || !session) return;
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      await attendanceAPI.processSession(session.id, formData);
      navigate(`/attendance/${session.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra trong quá trình xử lý ảnh.');
      setLoading(false); // only disable loading if error, otherwise it navigates
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        <div className="page-header fade-in">
          <h1>📷 Điểm danh bằng khuôn mặt</h1>
          <p>Tạo phiên và tải ảnh lớp học để AI nhận diện khuôn mặt</p>
        </div>

        {error && (
          <div className="alert-info" style={{ backgroundColor: '#ffecec', color: '#e74c3c', borderColor: '#fadbd8', marginBottom: 20 }}>
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Open Session */}
        {mode === 'init' && (
          <div className="capture-info glass-card fade-in" style={{ animationDelay: '0.1s', maxWidth: '600px', margin: '0 auto' }}>
            <h3>Bước 1: Mở phiên điểm danh</h3>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Tên phiên điểm danh (Không bắt buộc)</label>
              <input
                type="text"
                className="input-field"
                placeholder={`VD: Điểm danh - ${new Date().toLocaleDateString('vi-VN')}`}
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Lớp học</label>
              <select
                className="select-field"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
              >
                {classList.map((c) => (
                  <option key={c.id} value={c.id}>{c.className}</option>
                ))}
              </select>
            </div>
            <button 
              className="btn btn-primary btn-block" 
              onClick={handleOpenSession} 
              disabled={loading}
              style={{ marginTop: '1.5rem' }}
            >
              {loading ? 'Đang tạo...' : <><FiPlayCircle /> Bắt đầu điểm danh</>}
            </button>
          </div>
        )}

        {/* Step 2: Choose Mode */}
        {mode === 'choose' && (
          <div className="capture-choose fade-in">
            <h3 style={{ textAlign: 'center', marginBottom: '2rem' }}>
              Bước 2: Cung cấp ảnh lớp học
            </h3>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <div className="glass-card choose-card" onClick={() => setMode('webcam')}>
                <div className="choose-icon"><FiCamera /></div>
                <h3>Chụp ảnh</h3>
                <p>Sử dụng webcam để chụp ảnh lớp học trực tiếp</p>
              </div>
              <div className="glass-card choose-card" onClick={() => fileInputRef.current.click()}>
                <div className="choose-icon upload"><FiUpload /></div>
                <h3>Tải ảnh lên</h3>
                <p>Chọn ảnh có sẵn từ máy tính của bạn</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {/* Mode: Webcam */}
        {mode === 'webcam' && (
          <div className="capture-webcam fade-in">
            <div className="webcam-container glass-card">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                width="100%"
                videoConstraints={{
                  width: 1280,
                  height: 720,
                  facingMode: 'user',
                }}
                className="webcam-video"
              />
            </div>
            <div className="capture-actions">
              <button className="btn btn-secondary" onClick={() => setMode('choose')}>
                <FiX /> Hủy
              </button>
              <button className="btn btn-primary btn-lg capture-btn" onClick={capture}>
                <FiCamera /> Chụp ảnh
              </button>
              <button className="btn btn-secondary" onClick={() => fileInputRef.current.click()}>
                <FiUpload /> Tải ảnh
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        )}

        {/* Mode: Preview */}
        {mode === 'preview' && (
          <div className="capture-preview fade-in">
            <div className="preview-container glass-card">
              <img src={capturedImage} alt="Captured" className="preview-image" />
            </div>
            <div className="capture-actions">
              <button className="btn btn-secondary" onClick={handleRetake}>
                <FiRefreshCw /> Chụp lại
              </button>
              <button
                className="btn btn-success btn-lg"
                onClick={handleProcessAI}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loader" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
                    AI đang xử lý...
                  </>
                ) : (
                  <>
                    <FiCheck /> Xác nhận & Xử lý AI
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Processing overlay */}
        {loading && mode === 'preview' && (
          <div className="loading-overlay">
            <div className="processing-animation">
              <div className="processing-circle"></div>
              <FiImage className="processing-icon" />
            </div>
            <h2>AI đang nhận diện khuôn mặt...</h2>
            <p>Vui lòng chờ trong giây lát</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CapturePage;
