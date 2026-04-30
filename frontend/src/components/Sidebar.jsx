import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import BrandLogo from './BrandLogo';

const navItems = [
  { to: '/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
  { to: '/employees', icon: 'bi-people', label: 'Employees' },
  { to: '/tasks', icon: 'bi-list-check', label: 'Tasks' },
  { to: '/attendance', icon: 'bi-calendar-check', label: 'Attendance' },
  { to: '/reports', icon: 'bi-file-earmark-bar-graph', label: 'Reports' }
];

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside
      className="d-flex flex-column position-fixed top-0 start-0 text-white"
      style={{ width: '240px', height: '100vh', backgroundColor: '#1a3c5e' }}
    >
      <div className="d-flex align-items-center px-3" style={{ height: '64px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <BrandLogo titleColor="#ffffff" subtitleColor="rgba(255,255,255,0.75)" titleSize="20px" subtitleSize="11px" />
      </div>

      <nav className="mt-2 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `d-flex align-items-center text-decoration-none text-white px-3 mb-1 ${
                isActive ? 'sidebar-active' : ''
              }`
            }
            style={{ height: '44px', fontSize: '14px', transition: 'all 0.2s', borderRadius: '4px' }}
          >
            <i className={`bi ${item.icon} me-2`}></i>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="d-flex align-items-center mb-2">
          <Avatar name={user?.name} size={40} />
          <div className="ms-2">
            <div className="fw-semibold" style={{ fontSize: '13px' }}>
              {user?.name || 'User'}
            </div>
            <span className="badge text-bg-light text-uppercase" style={{ fontSize: '10px' }}>
              {user?.role || 'employee'}
            </span>
          </div>
        </div>
        <button type="button" className="btn btn-sm btn-outline-light w-100" onClick={logout}>
          <i className="bi bi-box-arrow-right me-1"></i> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

