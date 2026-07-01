/* LandingPage.jsx */
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiCamera, FiCheck, FiArrowRight, FiShield, 
  FiActivity, FiDownload, FiUsers, FiLock, 
  FiClock, FiTrendingUp, FiServer 
} from 'react-icons/fi';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-container" id="landing-top">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-logo" onClick={() => scrollToSection('landing-top')}>
          <FiCamera style={{ color: 'var(--accent-secondary)' }} />
          <span>Face Attendance</span>
        </div>
        <ul className="landing-nav-links">
          <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Tính năng</a></li>
          <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>Quy trình</a></li>
          <li><a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }}>Gói dịch vụ</a></li>
        </ul>
        <button className="landing-auth-btn" onClick={handleCTA}>
          {isAuthenticated ? 'Vào Dashboard' : 'Đăng nhập'}
          <FiArrowRight />
        </button>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-left">
          <div className="hero-badge">
            <FiActivity /> Công nghệ AI nhận diện tiên tiến nhất
          </div>
          <h1>Điểm danh khuôn mặt thông minh bằng AI</h1>
          <p>
            Giải pháp chuyển đổi số toàn diện cho trường học và doanh nghiệp. 
            Điểm danh tự động qua camera chỉ trong 1 giây, loại bỏ gian lận, 
            tối ưu hóa quy trình quản lý lịch trình và lớp học thời gian thực.
          </p>
          <div className="hero-actions">
            <button className="hero-btn-primary" onClick={handleCTA}>
              Trải nghiệm ngay <FiArrowRight />
            </button>
            <a href="#features" className="hero-btn-secondary" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>
              Tìm hiểu thêm
            </a>
          </div>
        </div>

        <div className="hero-right">
          <div className="scan-visualizer">
            <div className="scan-avatar-placeholder">
              <div className="scan-grid-overlay"></div>
              <div className="scan-laser-line"></div>
              <div className="scan-box-corner corner-tl"></div>
              <div className="scan-box-corner corner-tr"></div>
              <div className="scan-box-corner corner-bl"></div>
              <div className="scan-box-corner corner-br"></div>
              <FiUsers size={80} style={{ opacity: 0.8, color: 'var(--accent-primary-hover)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Quy trình hoạt động */}
      <section className="landing-section" id="how-it-works">
        <div className="section-header">
          <h2>Quy trình hoạt động đơn giản</h2>
          <p>Tối ưu hóa quản lý điểm danh chỉ với 3 bước cực kỳ nhanh chóng.</p>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">1</div>
            <div className="step-icon"><FiUsers /></div>
            <h3>Đăng ký gương mặt</h3>
            <p>Sinh viên hoặc nhân viên tự tải ảnh chân dung lên hồ sơ cá nhân với nhiều góc độ khác nhau để làm dữ liệu AI.</p>
          </div>
          <div className="step-card">
            <div className="step-num">2</div>
            <div className="step-icon"><FiCamera /></div>
            <h3>Quét điểm danh</h3>
            <p>Giáo viên kích hoạt camera lớp học. AI tự động quét, đối khớp với dữ liệu và ghi nhận trạng thái có mặt ngay lập tức.</p>
          </div>
          <div className="step-card">
            <div className="step-num">3</div>
            <div className="step-icon"><FiActivity /></div>
            <h3>Báo cáo thời gian thực</h3>
            <p>Xem thống kê điểm danh trực quan, gửi phản hồi/khiếu nại nếu có sai sót và xuất báo cáo file CSV chỉ với 1 click.</p>
          </div>
        </div>
      </section>

      {/* Tính năng nổi bật */}
      <section className="landing-section" id="features">
        <div className="section-header">
          <h2>Tính năng vượt trội</h2>
          <p>Trải nghiệm hệ thống quản lý chuyên nghiệp và tự động hóa cao.</p>
        </div>
        <div className="features-grid">
          <div className="feature-item-card">
            <div className="feature-icon-wrapper"><FiShield /></div>
            <h3>Nhận diện chính xác</h3>
            <p>Sử dụng thuật toán học sâu nhận diện khuôn mặt tiên tiến, chính xác cao dưới nhiều góc độ và điều kiện ánh sáng.</p>
          </div>
          <div className="feature-item-card">
            <div className="feature-icon-wrapper"><FiClock /></div>
            <h3>Khóa điểm danh 24h</h3>
            <p>Hệ thống tự động khóa tính năng chỉnh sửa sau 24 giờ kể từ khi mở điểm danh nhằm bảo đảm tính khách quan và minh bạch.</p>
          </div>
          <div className="feature-item-card">
            <div className="feature-icon-wrapper"><FiActivity /></div>
            <h3>Khiếu nại trực tuyến</h3>
            <p>Sinh viên vắng mặt có thể gửi khiếu nại kèm ảnh minh chứng trực tiếp trên hệ thống để giảng viên phê duyệt lại.</p>
          </div>
          <div className="feature-item-card">
            <div className="feature-icon-wrapper"><FiDownload /></div>
            <h3>Xuất báo cáo CSV</h3>
            <p>Cho phép giáo viên xuất chi tiết lịch sử điểm danh của từng buổi học ra file Excel/CSV nhanh chóng để lưu trữ hoặc chấm điểm.</p>
          </div>
          <div className="feature-item-card">
            <div className="feature-icon-wrapper"><FiUsers /></div>
            <h3>Phân quyền linh hoạt</h3>
            <p>Phân chia vai trò rõ ràng giữa Admin quản lý, Giảng viên tạo lớp điểm danh và Sinh viên theo dõi lịch sử chuyên cần.</p>
          </div>
          <div className="feature-item-card">
            <div className="feature-icon-wrapper"><FiLock /></div>
            <h3>Bảo mật an toàn</h3>
            <p>Toàn bộ ảnh khuôn mặt và dữ liệu điểm danh được mã hóa và bảo mật tuyệt đối trên hạ tầng đám mây AWS.</p>
          </div>
        </div>
      </section>

      {/* Bảng giá / Gói dịch vụ */}
      <section className="landing-section" id="pricing">
        <div className="section-header">
          <h2>Gói dịch vụ linh hoạt</h2>
          <p>Chọn gói dịch vụ phù hợp với quy mô lớp học hoặc tổ chức của bạn.</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Dùng thử (Trial)</h3>
              <p>Phù hợp cho các cá nhân muốn trải nghiệm thử công nghệ quét AI.</p>
            </div>
            <div className="pricing-amount">
              <span className="price">0</span>
              <span className="currency">đ</span>
              <span className="period">/ 30 ngày</span>
            </div>
            <ul className="pricing-features">
              <li><FiCheck /> Quản lý tối đa 2 lớp học</li>
              <li><FiCheck /> Đăng ký tối đa 30 sinh viên</li>
              <li><FiCheck /> Điểm danh quét khuôn mặt cơ bản</li>
              <li><FiCheck /> Lưu trữ lịch sử vĩnh viễn</li>
            </ul>
            <button className="pricing-btn" onClick={handleCTA}>Trải nghiệm ngay</button>
          </div>

          <div className="pricing-card popular">
            <div className="popular-badge">Khuyên dùng</div>
            <div className="pricing-header">
              <h3>Chuyên nghiệp (Pro)</h3>
              <p>Phù hợp cho các trường học và giảng viên quản lý giảng dạy.</p>
            </div>
            <div className="pricing-amount">
              <span className="price">199k</span>
              <span className="currency">đ</span>
              <span className="period">/ tháng</span>
            </div>
            <ul className="pricing-features">
              <li><FiCheck /> Không giới hạn số lượng lớp học</li>
              <li><FiCheck /> Không giới hạn số lượng sinh viên</li>
              <li><FiCheck /> Hỗ trợ nhận diện AI đa góc độ</li>
              <li><FiCheck /> Tính năng khiếu nại & Khóa 24h</li>
              <li><FiCheck /> Xuất báo cáo Excel/CSV nhanh</li>
            </ul>
            <button className="pricing-btn" onClick={handleCTA}>Đăng ký ngay</button>
          </div>

          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Doanh nghiệp (Enterprise)</h3>
              <p>Dành cho quy mô lớn của các khoa, trường học hoặc doanh nghiệp.</p>
            </div>
            <div className="pricing-amount">
              <span className="price">Liên hệ</span>
            </div>
            <ul className="pricing-features">
              <li><FiCheck /> Toàn bộ quyền lợi của gói Pro</li>
              <li><FiCheck /> Tích hợp API vào hệ thống quản lý có sẵn</li>
              <li><FiCheck /> Hỗ trợ hạ tầng server riêng biệt trên AWS</li>
              <li><FiCheck /> Hỗ trợ kỹ thuật 24/7</li>
            </ul>
            <button className="pricing-btn" onClick={handleCTA}>Liên hệ chúng tôi</button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="cta-glass-card">
          <h2>Sẵn sàng tự động hóa điểm danh?</h2>
          <p>
            Hãy cùng loại bỏ bảng điểm danh giấy truyền thống phức tạp. 
            Chuyển đổi số lớp học của bạn với Face Attendance ngay hôm nay!
          </p>
          <button className="hero-btn-primary" onClick={handleCTA}>
            Bắt đầu miễn phí ngay <FiArrowRight />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <h3>Face Attendance</h3>
            <p>Hệ thống nhận diện khuôn mặt tự động bằng AI, tối ưu hóa điểm danh lớp học chuyên nghiệp.</p>
            <div className="footer-status">
              <span className="status-dot"></span>
              <FiServer /> Cloud Server: AWS Hoạt động tốt
            </div>
          </div>
          <div className="footer-links">
            <h4>Đường dẫn nhanh</h4>
            <ul>
              <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Tính năng</a></li>
              <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>Quy trình</a></li>
              <li><a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }}>Bảng giá</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Hỗ trợ kỹ thuật</h4>
            <ul>
              <li><a href="mailto:support@faceattendance.duckdns.org">support@faceattendance.duckdns.org</a></li>
              <li><a href="#landing-top" onClick={(e) => { e.preventDefault(); scrollToSection('landing-top'); }}>Về đầu trang</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Face Attendance System. All rights reserved.</p>
          <p>Designed with ❤️ for Advanced Education Projects</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
