import { useState, useEffect } from 'react';
import { auditLogs,  getUsers, deleteUser } from '../services/adminApi';

const AdminLogs = () => {
  const [activeSection, setActiveSection] = useState('roles'); 
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [usersData , userRoles] = await Promise.all([
        getUsers(),
      ]);
      const mappedData = Array.isArray(usersData?.users) ? usersData.users : [];
      setUsers(mappedData);
      
    } 
    catch (error) {
      console.error('Failed to load admin logs data:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to load data from server' });
    } 
    finally {
      setLoading(false);
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
      await loadAllData(); 
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete user' });
    }
  };

  const sections = [
    { id: 'roles', label: 'Roles & Users', icon: 'people' },
    { id: 'audit', label: 'Audit Logs', icon: 'history' },
  ];

  return (
    <div className="space-y-6">
      {message.text && (
        <div className={`p-3 rounded-xl font-bold border animate-fade-in text-sm ${message.type === 'success'
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
            className={`flex-1 flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeSection === section.id
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
                       users.map((user, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div>
                                  <div className="font-bold text-black text-sm">{user.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-gray-700 break-all">{user.email}</span>
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-xs text-gray-700 capitalize">{user.role}</span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleDeleteUser(id, user.name)}
                                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-all flex items-center gap-1"
                              >
                               <span className="material-icons-outlined text-xs">delete</span>
                                 Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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
