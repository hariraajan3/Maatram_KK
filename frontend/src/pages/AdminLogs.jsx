import { useState, useEffect } from 'react';
import { fetchAuditLogs, fetchRoles, updateRolePermissions } from '../services/api';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([fetchAuditLogs(), fetchRoles()])
      .then(([logsData, rolesData]) => {
        setLogs(logsData);
        setRoles(rolesData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handlePermissionChange = async (roleName, permission) => {
    const role = roles.find(r => r.name === roleName);
    if (!role) return;

    const newPermissions = role.permissions.includes(permission)
      ? role.permissions.filter(p => p !== permission)
      : [...role.permissions, permission];

    try {
      await updateRolePermissions(roleName, newPermissions);
      setRoles(roles.map(r => r.name === roleName ? { ...r, permissions: newPermissions } : r));
      setMessage(`Updated permissions for ${roleName}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update permissions');
    }
  };

  const availablePermissions = ['view_tutors', 'manage_onboarding', 'view_classes', 'view_own_classes', 'mark_attendance', 'manage_schedule', 'view_attendance', 'all'];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-display font-bold text-black">Admin & Audit Logs</h2>
        <p className="text-gray-500 mt-1">Monitor system activity and manage role permissions.</p>
      </header>

      {message && (
        <div className="p-4 bg-blue-50 text-blue-700 rounded-xl font-bold border border-blue-100 animate-fade-in">
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Role Permissions */}
        <section className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-black mb-4">Role Permissions</h3>
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Permissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {roles.map((role) => (
                  <tr key={role.name} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className="font-bold text-black capitalize mb-1">{role.name}</div>
                      <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
                        {role.permissions.length} active
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {availablePermissions.map((perm) => (
                          <button
                            key={perm}
                            onClick={() => handlePermissionChange(role.name, perm)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 ${role.permissions.includes(perm)
                                ? 'bg-maatram-yellow text-black border-maatram-yellow shadow-sm hover:shadow-md'
                                : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600'
                              }`}
                          >
                            {perm.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Audit Logs */}
        <section className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 h-[600px] overflow-y-auto">
          <h3 className="text-lg font-bold text-black mb-4">Audit Logs</h3>
          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-500 text-center py-8">Loading logs...</p>
            ) : logs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No logs found.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all">
                    <span className="material-icons-outlined text-gray-500 text-sm">history</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-black text-sm">{log.userName}</span>
                      <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded-full capitalize">{log.userRole}</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">{log.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminLogs;
