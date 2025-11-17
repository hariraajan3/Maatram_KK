import { Link, NavLink, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/scheduling', label: 'Scheduling' },
  { to: '/attendance', label: 'Attendance' },
  { to: '/onboarding', label: 'Onboarding' },
  { to: '/analytics', label: 'Analytics' },
];

const Layout = ({ user, onLogout }) => (
  <div className="min-h-screen bg-slate-100 flex">
    <aside className="w-60 bg-white shadow-sm border-r border-slate-100 hidden md:flex flex-col">
      <div className="px-6 py-5 border-b border-slate-50">
        <Link to="/" className="text-2xl font-semibold text-brand-700">
          Maatram KK
        </Link>
        <p className="text-xs text-slate-500 mt-1">Unified tutor platform</p>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-100 text-xs text-slate-500">
        © {new Date().getFullYear()} KK Initiative
      </div>
    </aside>
    <div className="flex-1 flex flex-col">
      <header className="bg-white shadow-sm px-4 md:px-8 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Logged in as</p>
          <p className="text-lg font-semibold text-slate-800 capitalize">{user.role}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="px-3 py-2 rounded-md bg-slate-900 text-white text-xs uppercase tracking-wide"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  </div>
);

Layout.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default Layout;

