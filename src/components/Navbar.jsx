import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiCamera, FiClock, FiLogOut, FiUser, FiUsers, FiBook, FiCalendar, FiCheckSquare, FiBell } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    const items = [
      { path: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
    ];

    if (user?.role === 'admin') {
      items.push({ path: '/admin/users', label: 'Tài khoản', icon: <FiUsers /> });
      items.push({ path: '/classes', label: 'Lớp học', icon: <FiBook /> });
      items.push({ path: '/schedules', label: 'Lịch trình', icon: <FiCalendar /> });
    } else if (user?.role === 'teacher') {
      items.push({ path: '/capture', label: 'Điểm danh', icon: <FiCamera /> });
      items.push({ path: '/history', label: 'Lịch sử', icon: <FiClock /> });
      items.push({ path: '/students', label: 'Học sinh', icon: <FiUsers /> });
      items.push({ path: '/classes', label: 'Lớp học', icon: <FiBook /> });
    } else if (user?.role === 'student') {
      items.push({ path: '/history', label: 'Lịch sử', icon: <FiClock /> });
      items.push({ path: '/classes', label: 'Lớp học', icon: <FiBook /> });
      items.push({ path: '/registrations', label: 'Đăng ký', icon: <FiCheckSquare /> });
    }
    return items;
  };

  const navItems = getNavItems();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <div className="brand-icon">FA</div>
          <span>Face Attendance</span>
        </Link>

        <div className="navbar-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="navbar-user">

          <Link to="/notifications" className="nav-icon-btn" title="Thông báo">
            <FiBell />
          </Link>
          <Link to="/profile" className="user-info">
            <FiUser />
            <span>{user?.fullName}</span>
          </Link>
          <button className="btn-logout" onClick={handleLogout} title="Đăng xuất">
            <FiLogOut />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
