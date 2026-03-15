import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { attendanceAPI, studentAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { FiCamera, FiUpload, FiRefreshCw, FiCheck, FiX, FiImage } from 'react-icons/fi';
import './CapturePage.css';

const CapturePage = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [mode, setMode] = useState('choose'); // choose, webcam, preview, processing
  const [capturedImage, setCapturedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [sessionName, setSessionName] = useState('');
  const [classList, setClassList] = useState([]);
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await studentAPI.getClasses();
        if (res.data.classes && res.data.classes.length > 0) {
          setClassList(res.data.classes);
          setClassName(res.data.classes[0]);
        }
      } catch (err) {
        console.error('Fetch classes error:', err);
      }
    };
    fetchClasses();
  }, []);

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

  const handleSubmit = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('sessionName', sessionName || `Điểm danh - ${new Date().toLocaleDateString('vi-VN')}`);
      formData.append('className', className);

      const res = await attendanceAPI.createSession(formData);
      navigate(`/attendance/${res.data.session.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">
        <div className="page-header fade-in">
          <h1>📷 Điểm danh bằng khuôn mặt</h1>
          <p>Chụp ảnh lớp học hoặc tải ảnh lên để AI nhận diện khuôn mặt</p>
        </div>

        {error && (
          <div className="login-error" style={{ marginBottom: 20 }}>
            <span>{error}</span>
          </div>
        )}

        {/* Session Info */}
        <div className="capture-info glass-card fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="info-row">
            <div className="input-group">
              <label>Tên phiên điểm danh</label>
              <input
                type="text"
                className="input-field"
                placeholder="VD: Buổi học sáng thứ 2"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Lớp học</label>
              <select
                className="select-field"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              >
                {classList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mode: Choose */}
        {mode === 'choose' && (
          <div className="capture-choose fade-in" style={{ animationDelay: '0.2s' }}>
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
              <div className="webcam-overlay">
                <div className="webcam-frame"></div>
              </div>
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
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loader" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
                    AI đang xử lý...
                  </>
                ) : (
                  <>
                    <FiCheck /> Xác nhận & Điểm danh
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Processing overlay */}
        {loading && (
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
