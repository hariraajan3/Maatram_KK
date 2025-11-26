import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/scheduling', label: 'Scheduling', roles: ['admin', 'lead'], icon: 'calendar_today' },
  { to: '/attendance', label: 'Attendance', roles: ['admin', 'lead', 'tutor'], icon: 'fact_check' },
  { to: '/onboarding', label: 'Onboarding', roles: ['admin'], icon: 'person_add' },
  { to: '/admin-logs', label: 'Admin Logs', roles: ['admin'], icon: 'admin_panel_settings' },
];

const Layout = ({ user, onLogout }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white-off flex font-sans text-black">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm z-10">
        <div className="px-6 py-8 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-maatram-yellow flex items-center justify-center text-black font-bold text-xl shadow-sm group-hover:scale-105 transition-transform">
              M
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-black tracking-tight">Maatram KK</h1>
              <p className="text-xs text-gray-500 font-medium">Unified Platform</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
          {navItems.map((item) => {
            if (item.roles && !item.roles.includes(user.role)) return null;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-maatram-yellow text-black shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                  }`
                }
              >
                <span className="material-icons-outlined text-lg">{/* Icon placeholder if needed */}</span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-maatram-black text-white flex items-center justify-center text-xs font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-black truncate">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full py-2 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors shadow-sm"
            >
              Sign Out
            </button>
          </div>
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
          <div className="flex items-center gap-4">
            <Link to="/profile" className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
              <span className="sr-only">Profile</span>
              {/* Profile Icon Placeholder */}
              <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            </Link>
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
  }).isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default Layout;
