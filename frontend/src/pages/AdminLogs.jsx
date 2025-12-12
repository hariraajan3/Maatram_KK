import { useState, useEffect } from 'react';
import { fetchAuditLogs, fetchRoles, updateRolePermissions, fetchUsers, assignRole, deleteUser } from '../services/api';

const AdminLogs = () => {
  const [activeSection, setActiveSection] = useState('audit'); // 'audit', 'roles', 'permissions'
  const [logs, setLogs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [logsData, rolesData, usersData] = await Promise.all([
        fetchAuditLogs(),
        fetchRoles(),
        fetchUsers()
      ]);
      setLogs(logsData);
      setRoles(rolesData);
      setUsers(usersData);
    } catch (error) {
      // Fallback dummy data
      setLogs([
        {
          id: 'log1',
          userName: 'Akila Admin',
          userRole: 'admin',
          action: 'UPDATE_ROLE_PERMISSIONS',
          details: 'Updated permissions for tutorLead role',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'log2',
          userName: 'Latha Lead',
          userRole: 'tutorLead',
          action: 'CREATE_ONBOARDING',
          details: 'Created onboarding request for Rajesh Kumar',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'log3',
          userName: 'Akila Admin',
          userRole: 'admin',
          action: 'ASSIGN_ROLE',
          details: 'Changed role for Siva Tutor from tutor to tutorLead',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
      setRoles([
        { name: 'admin', permissions: ['all'] },
        { name: 'tutorLead', permissions: ['view_tutors', 'manage_onboarding', 'view_classes'] },
        { name: 'tutor', permissions: ['view_own_classes', 'mark_attendance'] },
        { name: 'coordinator', permissions: ['view_classes', 'manage_schedule', 'view_attendance'] },
      ]);
      setUsers([
        {
          id: 'u1',
          name: 'Akila Admin',
          email: 'admin@maatram.org',
          role: 'admin',
          avatar: 'https://ui-avatars.com/api/?name=Akila+Admin',
        },
        {
          id: 'u2',
          name: 'Latha Lead',
          email: 'lead@maatram.org',
          role: 'tutorLead',
          avatar: 'https://ui-avatars.com/api/?name=Latha+Lead',
        },
        {
          id: 'u3',
          name: 'Siva Tutor',
          email: 'tutor@maatram.org',
          role: 'tutor',
          avatar: 'https://ui-avatars.com/api/?name=Siva+Tutor',
        },
        {
          id: 'u4',
          name: 'Priya Coordinator',
          email: 'coord@maatram.org',
          role: 'coordinator',
          avatar: 'https://ui-avatars.com/api/?name=Priya+Coord',
        },
      ]);
      setMessage({ type: 'error', text: 'Using dummy data - API connection failed' });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = async (roleName, permission) => {
    const role = roles.find(r => r.name === roleName);
    if (!role) return;

    const newPermissions = role.permissions.includes(permission)
      ? role.permissions.filter(p => p !== permission)
      : [...role.permissions, permission];

    try {
      await updateRolePermissions(roleName, newPermissions);
      setRoles(roles.map(r => r.name === roleName ? { ...r, permissions: newPermissions } : r));
      setMessage({ type: 'success', text: `Updated permissions for ${roleName}` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update permissions' });
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await assignRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setEditingUser(null);
      setMessage({ type: 'success', text: 'Role updated successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      await loadAllData(); // Reload to get updated audit logs
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update role' });
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      setMessage({ type: 'success', text: 'User deleted successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      await loadAllData(); // Reload to get updated audit logs
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete user' });
    }
  };

  const availablePermissions = ['view_tutors', 'manage_onboarding', 'view_classes', 'view_own_classes', 'mark_attendance', 'manage_schedule', 'view_attendance', 'all'];
  const availableRoles = ['admin', 'tutorLead', 'tutor', 'coordinator'];

  const sections = [
    { id: 'roles', label: 'Roles & Users', icon: 'people' },
    { id: 'permissions', label: 'Permissions', icon: 'lock' },
    { id: 'audit', label: 'Audit Logs', icon: 'history' },
  ];

  return (
    <div className="space-y-6">
      {message.text && (
        <div className={`p-3 rounded-xl font-bold border animate-fade-in text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border-green-100' 
            : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          {message.text}
        </div>
      )}

      {/* Individual Button-style Section Selector */}
      <div className="flex justify-between items-center gap-4">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
              activeSection === section.id
                ? 'bg-maatram-yellow text-black shadow-md'
                : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-black border border-gray-200'
            }`}
          >
            <span className="material-icons-outlined text-2xl">{section.icon}</span>
            <span className="font-display">{section.label}</span>
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">Loading...</p>
          </div>
        ) : (
          <>
            {/* Roles & Users Section */}
            {activeSection === 'roles' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-black flex items-center gap-2">
                    <span className="material-icons-outlined text-xl">people</span>
                    Roles & Users Management
                  </h3>
                  <p className="text-xs text-gray-500">Total Users: {users.length}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Current Role</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-4 py-6 text-center text-gray-500 text-sm">No users found.</td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {user.avatar ? (
                                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-maatram-yellow flex items-center justify-center text-black font-bold text-sm">
                                    {user.name.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-black text-sm">{user.name}</div>
                                  <div className="text-[10px] text-gray-400">ID: {user.id.slice(0, 8)}...</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-gray-700 break-all">{user.email}</span>
                            </td>
                            <td className="px-4 py-3">
                              {editingUser === user.id ? (
                                <select
                                  value={selectedRole || user.role}
                                  onChange={(e) => setSelectedRole(e.target.value)}
                                  className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-maatram-yellow"
                                >
                                  {availableRoles.map((role) => (
                                    <option key={role} value={role}>
                                      {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="px-2 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 capitalize">
                                  {user.role}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                {editingUser === user.id ? (
                                  <>
                                    <button
                                      onClick={() => handleRoleChange(user.id, selectedRole || user.role)}
                                      className="px-3 py-1.5 bg-maatram-yellow text-black rounded-lg text-xs font-bold hover:shadow-md transition-all"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingUser(null);
                                        setSelectedRole('');
                                      }}
                                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-all"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingUser(user.id);
                                        setSelectedRole(user.role);
                                      }}
                                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all flex items-center gap-1"
                                    >
                                      <span className="material-icons-outlined text-xs">edit</span>
                                      Change
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(user.id, user.name)}
                                      className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-all flex items-center gap-1"
                                    >
                                      <span className="material-icons-outlined text-xs">delete</span>
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Permissions Section */}
            {activeSection === 'permissions' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <span className="material-icons-outlined text-xl">lock</span>
                  Role Permissions
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Configure which permissions each role can access. Click on permission buttons to toggle access.
                </p>
                <div className="space-y-4">
                  {roles.map((role) => (
                    <div key={role.name} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-base font-bold text-black capitalize mb-1">{role.name}</h4>
                          <p className="text-xs text-gray-500">
                            {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''} active
                            {role.permissions.includes('all') && ' (Full Access)'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availablePermissions.map((perm) => (
                          <button
                            key={perm}
                            onClick={() => handlePermissionChange(role.name, perm)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 ${
                              role.permissions.includes(perm)
                                ? 'bg-maatram-yellow text-black border-maatram-yellow shadow-sm hover:shadow-md'
                                : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600'
                            }`}
                          >
                            <span className="material-icons-outlined text-sm mr-1 align-middle">
                              {role.permissions.includes(perm) ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                            {perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audit Logs Section */}
            {activeSection === 'audit' && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <span className="material-icons-outlined text-xl">history</span>
                  Audit Logs
                </h3>
                <div className="max-h-[500px] overflow-y-auto space-y-2">
                  {logs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No audit logs found.</p>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 group">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all">
                          <span className="material-icons-outlined text-gray-500 text-lg">history</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-bold text-black text-sm">{log.userName || 'System'}</span>
                            <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded-full capitalize">
                              {log.userRole || 'system'}
                            </span>
                            <span className="text-xs text-gray-400 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-mono">
                              {log.action || 'ACTION'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 font-medium mb-1 break-words">{log.details || 'No details available'}</p>
                          <p className="text-[10px] text-gray-400 font-mono">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          
          </>
          
        )}
      </div>
    </div>
  );
};

export default AdminLogs;
