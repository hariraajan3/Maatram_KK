import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import maatramLogo from '../Maatram logo.jpg';

const navItems = [
  { to: '/', label: 'Selection', roles: ['ADMIN', 'SELECTION_TEAM'], icon: 'how_to_reg' },
  { to: '/scheduling', label: 'Scheduling', roles: ['ADMIN', 'TUTOR_LEADS', 'CLASS_INSPECTION_TEAM'], icon: 'calendar_today' },
  { to: '/tutor-attendance', label: 'Mark Attendance', roles: ['TUTOR', 'ADMIN', 'TUTOR_LEADS'], icon: 'edit_note' },
  { to: '/attendance', label: 'Attendance', roles: ['ADMIN', 'TUTOR_LEADS', 'ATTENDANCE_TRACKING_TEAM'], icon: 'fact_check' },
  { to: '/overall-attendance', label: 'Overall Attendance', roles: ['ADMIN', 'TUTOR_LEADS', 'ATTENDANCE_TRACKING_TEAM'], icon: 'assessment' },
  { to: '/onboarding', label: 'Onboarding', roles: ['ADMIN', 'TUTOR_LEADS'], icon: 'person_add' },
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['ADMIN', 'TUTOR_LEADS'] },
  { to: '/admin-logs', label: 'Admin Logs', roles: ['ADMIN'], icon: 'admin_panel_settings' },
];

const Layout = ({ user, onLogout }) => {
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white-off flex font-sans text-black">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm z-10">
        <div className="px-6 py-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <img
                src={maatramLogo}
                alt="Maatram Logo"
                className="w-full h-full object-contain p-1"
              />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-black tracking-tight">Maatram KK</h1>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            if (item.roles && !item.roles.includes(user.role)) return null;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 ${isActive
                    ? 'bg-maatram-yellow text-black shadow-md translate-x-1'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-black hover:translate-x-1'
                  }`
                }
              >
                <span className="material-icons-outlined text-xl">{item.icon}</span>
                <span className="font-display tracking-wide">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <p className="text-[10px] text-center text-gray-400 mt-4">
            © {new Date().getFullYear()} Maatram Foundation
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="text-xl font-display font-bold text-black">
              {navItems.find(item => item.to === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
                className="relative p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <span className="material-icons-outlined text-xl">notifications</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-30">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-black">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                      No new notifications
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-maatram-yellow text-black flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="text-sm font-bold text-black hidden sm:block">{user.name}</span>
                <span className="material-icons-outlined text-gray-500 text-sm">arrow_drop_down</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-30">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-black">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400 capitalize mt-1">{user.role}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span className="material-icons-outlined text-lg">person</span>
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span className="material-icons-outlined text-lg">logout</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ user, onLogout }} />
          </div>
        </main>
      </div>
    </div>
  );
};

Layout.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    avatar: PropTypes.string,
  }).isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default Layout;
