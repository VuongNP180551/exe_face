import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { FiUser, FiLock, FiEye, FiEyeOff, FiMail, FiKey, FiArrowLeft } from 'react-icons/fi';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: otp+newPass
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotMsg, setForgotMsg] = useState({ type: '', text: '' });
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setForgotMsg({ type: '', text: '' });
    setForgotLoading(true);
    try {
      const res = await authAPI.forgotPassword({ email: forgotEmail });
      setForgotMsg({ type: 'success', text: res.data.message || 'Đã gửi mã OTP!' });
      setForgotStep(2);
    } catch (err) {
      setForgotMsg({ type: 'error', text: err.response?.data?.message || 'Gửi OTP thất bại.' });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotMsg({ type: '', text: '' });
    setForgotLoading(true);
    try {
      const res = await authAPI.resetPassword({ email: forgotEmail, otp: forgotOtp, newPassword: forgotNewPass });
      setForgotMsg({ type: 'success', text: res.data.message || 'Đổi mật khẩu thành công!' });
      setTimeout(() => {
        setShowForgot(false);
        setForgotStep(1);
        setForgotEmail('');
        setForgotOtp('');
        setForgotNewPass('');
        setForgotMsg({ type: '', text: '' });
      }, 2000);
    } catch (err) {
      setForgotMsg({ type: 'error', text: err.response?.data?.message || 'Đổi mật khẩu thất bại.' });
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgot = () => {
    setShowForgot(false);
    setForgotStep(1);
    setForgotEmail('');
    setForgotOtp('');
    setForgotNewPass('');
    setForgotMsg({ type: '', text: '' });
  };

  return (
    <div className="login-page">
      <div className="login-bg-effects">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
      </div>

      <div className="login-container fade-in">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-icon">FA</div>
          </div>
          <h1>Face Attendance</h1>
          <p>Hệ thống điểm danh bằng khuôn mặt</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <span>{error}</span>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <div className="input-wrapper">
              <FiUser className="input-icon" />
              <input
                id="username"
                type="text"
                className="input-field"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading}>
            {loading ? (
              <>
                <div className="loader" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        <div className="login-footer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => setShowForgot(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              fontSize: '0.9rem',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Quên mật khẩu?
          </button>
          <p>Demo: <strong>teacher01</strong> / <strong>123456</strong></p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={closeForgot}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(30, 30, 60, 0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: '32px 28px',
              width: '100%',
              maxWidth: 400,
              color: '#fff',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              {forgotStep === 2 && (
                <button
                  onClick={() => { setForgotStep(1); setForgotMsg({ type: '', text: '' }); }}
                  style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', padding: 0 }}
                >
                  <FiArrowLeft size={20} />
                </button>
              )}
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>
                {forgotStep === 1 ? '🔑 Quên mật khẩu' : '🔐 Đặt lại mật khẩu'}
              </h2>
            </div>

            {forgotMsg.text && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  marginBottom: 16,
                  fontSize: '0.85rem',
                  background: forgotMsg.type === 'success' ? 'rgba(39,174,96,0.15)' : 'rgba(231,76,60,0.15)',
                  border: `1px solid ${forgotMsg.type === 'success' ? 'rgba(39,174,96,0.4)' : 'rgba(231,76,60,0.4)'}`,
                  color: forgotMsg.type === 'success' ? '#27ae60' : '#e74c3c',
                }}
              >
                {forgotMsg.text}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleSendOtp}>
                <p style={{ color: '#aaa', fontSize: '0.88rem', marginBottom: 16 }}>
                  Nhập email đã đăng ký. Chúng tôi sẽ gửi mã OTP để xác thực.
                </p>
                <div style={{ position: 'relative', marginBottom: 16 }}>
                  <FiMail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                  <input
                    type="email"
                    className="input-field"
                    placeholder="your@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    style={{ paddingLeft: 38, width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={forgotLoading}
                  style={{ width: '100%', padding: '12px 0' }}
                >
                  {forgotLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <p style={{ color: '#aaa', fontSize: '0.88rem', marginBottom: 16 }}>
                  Nhập mã OTP đã gửi đến <strong style={{ color: '#667eea' }}>{forgotEmail}</strong> và mật khẩu mới.
                </p>
                <div style={{ position: 'relative', marginBottom: 12 }}>
                  <FiKey style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Mã OTP (6 chữ số)"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    required
                    maxLength={6}
                    style={{ paddingLeft: 38, width: '100%', boxSizing: 'border-box', fontSize: '1.1rem', letterSpacing: 4, textAlign: 'center' }}
                  />
                </div>
                <div style={{ position: 'relative', marginBottom: 16 }}>
                  <FiLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Mật khẩu mới"
                    value={forgotNewPass}
                    onChange={(e) => setForgotNewPass(e.target.value)}
                    required
                    minLength={6}
                    style={{ paddingLeft: 38, width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={forgotLoading}
                  style={{ width: '100%', padding: '12px 0' }}
                >
                  {forgotLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                </button>
              </form>
            )}

            <button
              onClick={closeForgot}
              style={{
                display: 'block',
                margin: '16px auto 0',
                background: 'none',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
