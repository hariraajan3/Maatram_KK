import { useEffect, useState } from 'react';
import { createOnboarding, fetchOnboarding, updateOnboardingStatus } from '../services/api';
import { ROLES } from '../permissions';

const MEDIUMS = ['Tamil', 'English'];
const DISTRICTS = ['Chennai', 'Coimbatore', 'Other'];
const SUBJECTS = ['Physics', 'Maths', 'Chemistry', 'Commerce', 'Economics', 'Accounts', 'Tamil', 'English'];

const Onboarding = () => {
  const [form, setForm] = useState({
    role: ROLES.TUTOR,
    name: '',
    email: '',
    phone: '',
    medium: '',
    district: '',
    subjects: [],
  });
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => fetchOnboarding()
    .then((data) => {
      setRequests(data);
      setLoading(false);
    })
    .catch(() => {
      // Fallback dummy data
      setRequests([
        {
          id: 'req1',
          name: 'Rajesh Kumar',
          email: 'rajesh@example.com',
          phoneEncrypted: 'encrypted_phone',
          status: 'pending',
          requestedBy: 'admin1',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'req2',
          name: 'Meera Sharma',
          email: 'meera@example.com',
          phoneEncrypted: 'encrypted_phone',
          status: 'pending',
          requestedBy: 'admin1',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'req3',
          name: 'Arjun Patel',
          email: 'arjun@example.com',
          phoneEncrypted: 'encrypted_phone',
          status: 'approved',
          requestedBy: 'admin1',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
      setLoading(false);
    });

  useEffect(() => {
    load();
  }, []);

  const toggleSubject = (subject) => {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await createOnboarding({ ...form, documents: ['nda.pdf'] });
      setMessage('Invitation sent! Automated onboarding workflow triggered.');
      setForm({ role: ROLES.TUTOR, name: '', email: '', phone: '', medium: '', district: '', subjects: [] });
      load();
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage('Failed to send invitation. Please try again.');
    }
  };

  const handleApprove = async (id) => {
    try {
      await updateOnboardingStatus(id, 'approved');
      load();
    } catch (error) {
      console.error('Failed to approve', error);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-black">Tutor Onboarding</h2>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-bold border border-green-100">
            {requests.filter(r => r.status === 'completed').length} Active
          </div>
          <div className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-bold border border-yellow-100">
            {requests.filter(r => r.status === 'pending').length} Pending
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Invite Form */}
        <section className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 h-fit">
          <h3 className="text-lg font-bold text-black mb-4">Invite New User</h3>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-maatram-yellow focus:border-transparent outline-none text-sm transition-all"
              >
                <option value={ROLES.TUTOR}>Tutor</option>
                <option value={ROLES.TUTOR_LEAD}>Tutor Lead</option>
                <option value={ROLES.ADMIN}>Admin</option>
                <option value={ROLES.SELECTION_TEAM}>Selection Team</option>
                <option value={ROLES.ATTENDANCE_TRACKING_TEAM}>Attendance Tracking Team</option>
                <option value={ROLES.STUDENTS_TRACKING_TEAM}>Students Tracking Team</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
              <input
                required
                name="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-maatram-yellow focus:border-transparent outline-none text-sm transition-all"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
              <input
                required
                type="email"
                name="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-maatram-yellow focus:border-transparent outline-none text-sm transition-all"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number</label>
              <input
                required
                type="tel"
                name="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-maatram-yellow focus:border-transparent outline-none text-sm transition-all"
                placeholder="+91 98765 43210"
              />
            </div>

            {(form.role === ROLES.TUTOR || form.role === ROLES.TUTOR_LEAD) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Medium</label>
                  <select
                    value={form.medium}
                    onChange={(e) => setForm({ ...form, medium: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-maatram-yellow focus:border-transparent outline-none text-sm transition-all"
                  >
                    <option value="">Select medium</option>
                    {MEDIUMS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">District</label>
                  <select
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-maatram-yellow focus:border-transparent outline-none text-sm transition-all"
                  >
                    <option value="">Select district</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {form.role === ROLES.TUTOR && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subjects</label>
                <div className="grid grid-cols-4 gap-2">
                  {SUBJECTS.map((subject) => (
                    <label key={subject} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={form.subjects.includes(subject)}
                        onChange={() => toggleSubject(subject)}
                        className="rounded"
                      />
                      <span className="text-xs font-bold">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <span className="material-icons-outlined text-sm">send</span>
              Send Invitation
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm font-bold text-center animate-fade-in ${message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}>
              {message}
            </div>
          )}
        </section>

        {/* Requests List */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-black">Onboarding Pipeline</h3>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No active onboarding requests.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {requests.map((request) => (
                  <div key={request.id || request.email} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-maatram-yellow flex items-center justify-center text-black font-bold">
                        {request.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-black">{request.name}</h4>
                        <p className="text-sm text-gray-500">{request.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Invited on {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Today'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Document Status Steps */}
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Invite</span>
                        </div>
                        <div className="w-8 h-0.5 bg-gray-200"></div>
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${request.status !== 'pending' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Docs</span>
                        </div>
                        <div className="w-8 h-0.5 bg-gray-200"></div>
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${request.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Active</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${request.status === 'approved'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          }`}>
                          {request.status}
                        </span>
                        {request.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="px-3 py-1 bg-black text-white text-xs font-bold rounded hover:bg-gray-800 transition-colors"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Onboarding;
