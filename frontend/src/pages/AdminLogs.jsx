import { useState } from 'react';

const initialUsers = [
  { id: 'U1', name: 'Akila Admin', email: 'admin@maatram.org', role: 'admin' },
  { id: 'U2', name: 'Sanjay Lead', email: 'sanjay@maatram.org', role: 'lead' },
  { id: 'U3', name: 'Priya Tutor', email: 'priya@maatram.org', role: 'tutor' },
  { id: 'U4', name: 'Kumar Tutor', email: 'kumar@maatram.org', role: 'tutor' },
];

const roles = ['admin', 'lead', 'tutor'];

const AdminLogs = () => {
  const [users, setUsers] = useState(initialUsers);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('tutor');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const changeRole = (id, newRole) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
    setSuccess('Role updated');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }
    // simple email validation
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    const newUser = {
      id: `U${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
    };
    setUsers((prev) => [newUser, ...prev]);
    setName('');
    setEmail('');
    setRole('tutor');
    setSuccess('User added');
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold text-black">Admin Logs & Role Management</h2>
        <p className="text-sm text-black/70 mt-1">View permissions and update user roles (local demo).</p>
      </section>

      <section className="bg-white rounded-2xl p-6 shadow-lg border-2 border-maatram-yellow">
        <h3 className="text-lg font-bold text-black mb-4">Add User</h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-6">
          <div>
            <label className="text-xs font-bold text-black/70">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border-2 border-black rounded-md px-3 py-2 outline-none"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-black/70">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border-2 border-black rounded-md px-3 py-2 outline-none"
              placeholder="email@example.org"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-black/70">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full border-2 border-black rounded-md px-3 py-2 outline-none"
            >
              {roles.map((r) => (
                <option value={r} key={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-maatram-yellow text-black font-bold rounded-md border-2 border-black hover:bg-maatram-yellow-dark transition"
            >
              Add
            </button>
          </div>
        </form>
        {error && <p className="text-sm text-red-700 font-bold mb-2">{error}</p>}
        {success && <p className="text-sm text-green-700 font-bold mb-2">{success}</p>}

        <h3 className="text-lg font-bold text-black mb-4">User Roles</h3>
        <table className="w-full text-left">
          <thead className="bg-maatram-yellow/30">
            <tr>
              <th className="px-4 py-2 text-xs font-bold">Name</th>
              <th className="px-4 py-2 text-xs font-bold">Email</th>
              <th className="px-4 py-2 text-xs font-bold">Role</th>
              <th className="px-4 py-2 text-xs font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-maatram-yellow">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-maatram-yellow/10">
                <td className="px-4 py-3 font-bold text-black">{u.name}</td>
                <td className="px-4 py-3 text-sm text-black/70">{u.email}</td>
                <td className="px-4 py-3 text-sm font-bold text-black">{u.role}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {roles.map((r) => (
                      <button
                        key={r}
                        onClick={() => changeRole(u.id, r)}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-colors border-2 border-black ${
                          u.role === r ? 'bg-maatram-yellow text-black' : 'bg-white text-black/80 hover:bg-maatram-yellow/20'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminLogs;
