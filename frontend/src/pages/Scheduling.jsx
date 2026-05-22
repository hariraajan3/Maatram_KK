import { useEffect, useState } from 'react';
import { fetchClasses, requestSwap, createSchedule, fetchTutors } from '../services/api';
import Can from '../rbac/Can';
import { useAuth } from "../rbac/AuthContext";

const Scheduling = () => {
  const [classes, setClasses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [weeklySchedules, setWeeklySchedules] = useState([
    { classId: '', scheduleDate: '', scheduleAt: '', subject: 'Maths', medium: 'English', district: 'Chennai', tutorId: '', meetLink: '' }
  ]);
  const [swapForm, setSwapForm] = useState({
    classId: '',
    reason: '',
    proposedByTutorId: '',
    targetTutorId: '',
    desiredDate: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { hasRole } = useAuth();

  const classesListCss = hasRole("tutor")
    ? "lg:col-span-2 bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden"
    : "lg:col-span-3 bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden";

  const loadData = () => {
    setLoading(true);
    fetchClasses()
      .then((data) => {
        setClasses(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    fetchTutors().then(setTutors).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const addRow = () => {
    setWeeklySchedules([...weeklySchedules, {
      classId: '',
      scheduleDate: '',
      scheduleAt: '',
      subject: 'Maths',
      medium: 'English',
      district: 'Chennai',
      tutorId: '',
      meetLink: ''
    }]);
  };

  const updateWeeklyRow = (index, field, value) => {
    const updated = [...weeklySchedules];
    updated[index][field] = value;

    // Auto-update scheduleAt if either date or time changes
    if (field === 'scheduleDate' || field === 'scheduleAtTime') {
      const date = field === 'scheduleDate' ? value : updated[index].scheduleDate;
      const time = field === 'scheduleAtTime' ? value : (updated[index].scheduleAtTime || '09:00');
      if (date && time) {
        updated[index].scheduleAt = `${date}T${time}:00.000Z`;
        updated[index].scheduleAtTime = time; // helper to keep the time input happy
      }
    }

    setWeeklySchedules(updated);
  };

  const removeRow = (index) => {
    setWeeklySchedules(weeklySchedules.filter((_, i) => i !== index));
  };

  const submitWeeklySchedule = async (e) => {
    e.preventDefault();
    try {
      await createSchedule({ schedules: weeklySchedules });
      setMessage('Weekly schedule created successfully!');
      setShowScheduleModal(false);
      setWeeklySchedules([{ classId: '', scheduleDate: '', scheduleAt: '', subject: 'Maths', medium: 'English', district: 'Chennai', tutorId: '', meetLink: '' }]);
      loadData();
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error(error);
      alert('Error creating schedule');
    }
  };

  const submitSwap = async (event) => {
    event.preventDefault();
    try {
      const payload = await requestSwap(swapForm);
      setMessage(`Swap request #${payload?.request?.id || 'local'} submitted successfully`);
      setSwapForm({
        classId: '',
        reason: '',
        proposedByTutorId: '',
        targetTutorId: '',
        desiredDate: '',
      });
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      alert('Error submitting swap request');
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end text-black">
        <div>
          <h2 className="text-3xl font-display font-bold text-black">Scheduling</h2>
          <p className="text-gray-500">Manage and track tutoring sessions</p>
        </div>
        <Can role={['admin', 'tutorLead']}>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-black/20 flex items-center gap-2"
          >
            <span className="material-icons-outlined text-sm">calendar_today</span>
            Schedule New Class
          </button>
        </Can>
      </header>

      {message && (
        <div className="p-4 rounded-xl bg-green-50 text-green-700 text-sm font-medium border border-green-200 animate-fade-in flex items-center gap-3">
          <span className="material-icons-outlined text-lg">check_circle</span>
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upcoming Classes List */}
        <section className={classesListCss}>
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-black">All Scheduled Classes</h3>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
              {classes.length} Total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">IDs</th>
                  <th className="px-6 py-4">Subject & Medium</th>
                  <th className="px-6 py-4">District</th>
                  <th className="px-6 py-4">Tutor</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Meet Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading classes...</span>
                      </div>
                    </td>
                  </tr>
                ) : classes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400 font-medium">No classes scheduled.</td>
                  </tr>
                ) : (
                  classes.map((cls) => (
                    <tr key={cls.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-600 w-fit">PID: {cls.classId}</span>
                          <span className="text-[9px] text-gray-400">DB ID: {cls.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-black">{cls.subject}</span>
                          <span className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">{cls.medium}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{cls.district}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{cls.tutorName}</td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex flex-col">
                          <span className="font-medium text-black">
                            {new Date(cls.scheduleDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(cls.scheduleAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cls.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          cls.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-100' :
                            'bg-gray-50 text-gray-600 border-gray-100'
                          }`}>
                          {cls.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {cls.meetLink ? (
                          <a
                            href={cls.meetLink.startsWith('http') ? cls.meetLink : `https://${cls.meetLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-[10px] font-bold hover:bg-black transition-all shadow-sm active:scale-95"
                          >
                            <span className="material-icons-outlined text-xs">videocam</span>
                            Join
                          </a>
                        ) : (
                          <span className="text-gray-300 text-xs italic">Not available</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <Can role="tutor">
          <section className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 h-fit sticky top-24">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-black">Quick Requests</h3>
              <p className="text-sm text-gray-500 mt-1">
                Swap or reschedule using the <b>DB ID</b>.
              </p>
            </div>

            <form onSubmit={submitSwap} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Class Database ID</label>
                <input
                  name="classId"
                  required
                  value={swapForm.classId}
                  onChange={(e) => setSwapForm({ ...swapForm, classId: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm transition-all"
                  placeholder="Find in DB ID column"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Your ID</label>
                  <input
                    name="proposedByTutorId"
                    required
                    value={swapForm.proposedByTutorId}
                    onChange={(e) => setSwapForm({ ...swapForm, proposedByTutorId: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Target Tutor ID</label>
                  <input
                    name="targetTutorId"
                    required
                    value={swapForm.targetTutorId}
                    onChange={(e) => setSwapForm({ ...swapForm, targetTutorId: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Desired Date & Time</label>
                <input
                  type="datetime-local"
                  name="desiredDate"
                  required
                  value={swapForm.desiredDate}
                  onChange={(e) => setSwapForm({ ...swapForm, desiredDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-black/20"
              >
                Submit Request
              </button>
            </form>
          </section>
        </Can>
      </div>

      {/* Week Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-black">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <header className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 text-black">
              <div>
                <h3 className="text-xl font-bold">Schedule Weekly Classes</h3>
                <p className="text-sm text-gray-500">Plan your sessions for the entire week</p>
              </div>
              <button onClick={() => setShowScheduleModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <span className="material-icons-outlined">close</span>
              </button>
            </header>

            <form onSubmit={submitWeeklySchedule} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      <th className="pb-4 px-2">Class ID</th>
                      <th className="pb-4 px-2">Date</th>
                      <th className="pb-4 px-2">Time</th>
                      <th className="pb-4 px-2">Subject</th>
                      <th className="pb-4 px-2">Medium</th>
                      <th className="pb-4 px-2">District</th>
                      <th className="pb-4 px-2">Tutor</th>
                      <th className="pb-4 px-2">Meet Link</th>
                      <th className="pb-4 px-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {weeklySchedules.map((row, idx) => (
                      <tr key={idx} className="group">
                        <td className="py-4 px-2">
                          <input
                            value={row.classId}
                            onChange={(e) => updateWeeklyRow(idx, 'classId', e.target.value)}
                            className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black text-xs"
                            placeholder="KK-001"
                            required
                          />
                        </td>
                        <td className="py-4 px-2">
                          <input
                            type="date"
                            value={row.scheduleDate}
                            onChange={(e) => updateWeeklyRow(idx, 'scheduleDate', e.target.value)}
                            className="w-32 px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black text-xs"
                            required
                          />
                        </td>
                        <td className="py-4 px-2">
                          <input
                            type="time"
                            value={row.scheduleAtTime || ''}
                            onChange={(e) => updateWeeklyRow(idx, 'scheduleAtTime', e.target.value)}
                            className="w-28 px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black text-xs"
                            required
                          />
                        </td>
                        <td className="py-4 px-2">
                          <select
                            value={row.subject}
                            onChange={(e) => updateWeeklyRow(idx, 'subject', e.target.value)}
                            className="w-28 px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black text-xs"
                          >
                            <option>Maths</option>
                            <option>Physics</option>
                            <option>Chemistry</option>
                            <option>Commerce</option>
                            <option>Economics</option>
                            <option>Accounts</option>
                            <option>Tamil</option>
                            <option>English</option>
                          </select>
                        </td>
                        <td className="py-4 px-2">
                          <select
                            value={row.medium}
                            onChange={(e) => updateWeeklyRow(idx, 'medium', e.target.value)}
                            className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black text-xs"
                          >
                            <option>English</option>
                            <option>Tamil</option>
                          </select>
                        </td>
                        <td className="py-4 px-2">
                          <select
                            value={row.district}
                            onChange={(e) => updateWeeklyRow(idx, 'district', e.target.value)}
                            className="w-28 px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black text-xs"
                          >
                            <option>Chennai</option>
                            <option>Coimbatore</option>
                            <option>Other</option>
                          </select>
                        </td>
                        <td className="py-4 px-2">
                          <select
                            value={row.tutorId}
                            onChange={(e) => updateWeeklyRow(idx, 'tutorId', e.target.value)}
                            className="w-32 px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black text-xs"
                            required
                          >
                            <option value="">Select Tutor</option>
                            {tutors.map(t => (
                              <option key={t.id} value={t.id}>{t.name || t.kkId}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-2">
                          <input
                            value={row.meetLink}
                            onChange={(e) => updateWeeklyRow(idx, 'meetLink', e.target.value)}
                            className="w-32 px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black text-xs"
                            placeholder="Optional (Fallback to Tutor Link)"
                          />
                        </td>
                        <td className="py-4 px-2 text-right">
                          {weeklySchedules.length > 1 && (
                            <button type="button" onClick={() => removeRow(idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                              <span className="material-icons-outlined text-lg">delete</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={addRow}
                className="flex items-center gap-2 text-black font-bold text-sm hover:text-gray-600 transition-colors"
              >
                <span className="material-icons-outlined text-sm">add_circle_outline</span>
                Add Another Class
              </button>
            </form>

            <footer className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-6 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={submitWeeklySchedule}
                className="px-8 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-black/20"
                type="button"
              >
                Save Schedule
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduling;
