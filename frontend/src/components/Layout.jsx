import { Link, NavLink, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';

// navItems can include an optional `roles` array to restrict visibility
const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/scheduling', label: 'Scheduling', roles: ['admin', 'lead'] },
  { to: '/attendance', label: 'Attendance', roles: ['admin', 'lead', 'tutor'] },
  { to: '/onboarding', label: 'Onboarding', roles: ['admin'] },
  { to: '/admin-logs', label: 'Admin Logs', roles: ['admin'] },
];

const Layout = ({ user, onLogout }) => (
  <div className="min-h-screen bg-white flex">
    <aside className="w-60 bg-white shadow-lg border-r-2 border-maatram-yellow hidden md:flex flex-col">
      <div className="px-6 py-5 border-b-2 border-maatram-yellow bg-maatram-yellow">
        <Link to="/" className="text-2xl font-bold text-black">
          Maatram KK
        </Link>
        <p className="text-xs text-black/70 mt-1 font-medium">Unified tutor platform</p>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2 bg-white">
        {navItems.map((item) =>
          // render the nav item only if there is no roles restriction
          // or the current user's role is included in the allowed roles
          ((!item.roles || item.roles.includes(user.role)) && (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-maatram-yellow text-black shadow-md'
                    : 'text-black hover:bg-maatram-yellow/20 hover:text-black'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))
        )}
      </nav>
      <div className="p-4 border-t-2 border-maatram-yellow bg-maatram-yellow text-xs text-black font-medium">
        © {new Date().getFullYear()} Maatram Foundation
      </div>
    </aside>
    <div className="flex-1 flex flex-col bg-white">
      <header className="bg-white border-b-2 border-maatram-yellow px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-sm text-black/60 font-medium">Logged in as</p>
          <p className="text-lg font-bold text-black capitalize">{user.role}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <Link
              to="/profile"
              className="block hover:opacity-80 transition-opacity cursor-pointer"
            >
              <p className="text-sm font-bold text-black">{user.name}</p>
              <p className="text-xs text-black/60">{user.email}</p>
            </Link>
          </div>
          <Link
            to="/profile"
            className="px-4 py-2 rounded-lg bg-maatram-yellow hover:bg-maatram-yellow-dark text-black text-xs uppercase tracking-wide font-bold transition-all shadow-md hover:shadow-lg"
          >
            Profile
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-2 rounded-lg bg-black hover:bg-black/90 text-white text-xs uppercase tracking-wide font-bold transition-all shadow-md hover:shadow-lg"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8 bg-white">
        <Outlet context={{ user, onLogout }} />
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

