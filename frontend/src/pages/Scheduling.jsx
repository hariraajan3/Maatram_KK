import { useEffect, useState } from 'react';
import { fetchClasses, requestSwap } from '../services/api';

const Scheduling = () => {
  const [classes, setClasses] = useState([]);
  const [swapForm, setSwapForm] = useState({
    classId: '',
    reason: '',
    proposedByTutorId: '',
    targetTutorId: '',
    desiredDate: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses()
      .then((data) => {
        setClasses(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback dummy data
        setClasses([
          {
            id: 'c1',
            phase: 'Selection',
            tutorId: 't1',
            tutorName: 'Siva Tutor',
            studentGroup: 'KK-2025-A',
            startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
            status: 'scheduled',
            modality: 'virtual',
          },
          {
            id: 'c2',
            phase: 'Scheduling',
            tutorId: 't1',
            tutorName: 'Siva Tutor',
            studentGroup: 'KK-2025-B',
            startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
            status: 'scheduled',
            modality: 'in-person',
          },
          {
            id: 'c3',
            phase: 'Attendance',
            tutorId: 't2',
            tutorName: 'Priya Tutor',
            studentGroup: 'KK-2025-C',
            startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
            status: 'scheduled',
            modality: 'virtual',
          },
        ]);
        setLoading(false);
      });
  }, []);

  const submitSwap = async (event) => {
    event.preventDefault();
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
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-black">Scheduling Cockpit</h2>
          <p className="text-gray-500 mt-1">Manage classes, swaps, and cancellations.</p>
        </div>
        <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg">
          + Schedule New Class
        </button>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upcoming Classes List */}
        <section className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-black">Upcoming Classes</h3>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
              {classes.length} Scheduled
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Phase & Group</th>
                  <th className="px-6 py-4">Tutor</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Mode</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading classes...</td>
                  </tr>
                ) : classes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No classes scheduled.</td>
                  </tr>
                ) : (
                  classes.map((cls) => (
                    <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-black">{cls.phase}</p>
                        <p className="text-xs text-gray-500">{cls.studentGroup}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{cls.tutorName}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(cls.startTime).toLocaleString('en-IN', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${cls.modality === 'online' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                          }`}>
                          {cls.modality}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                          {cls.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-gray-400 hover:text-black transition-colors">
                          <span className="material-icons-outlined text-lg">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Swap Request Form */}
        <section className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 h-fit sticky top-24">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-black">Request Swap / Reschedule</h3>
            <p className="text-sm text-gray-500 mt-1">
              Admins and leads will be notified instantly.
            </p>
          </div>

          <form onSubmit={submitSwap} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Class ID</label>
              <input
                name="classId"
                required
                value={swapForm.classId}
                onChange={(e) => setSwapForm({ ...swapForm, classId: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-maatram-yellow focus:border-transparent outline-none text-sm transition-all"
                placeholder="e.g. CLS-2024-001"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Current Tutor ID</label>
                <input
                  name="proposedByTutorId"
                  required
                  value={swapForm.proposedByTutorId}
                  onChange={(e) => setSwapForm({ ...swapForm, proposedByTutorId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-maatram-yellow focus:border-transparent outline-none text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Target Tutor ID</label>
                <input
                  name="targetTutorId"
                  required
                  value={swapForm.targetTutorId}
                  onChange={(e) => setSwapForm({ ...swapForm, targetTutorId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-maatram-yellow focus:border-transparent outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Desired Date & Time</label>
              <input
                type="datetime-local"
                name="desiredDate"
                required
                value={swapForm.desiredDate}
                onChange={(e) => setSwapForm({ ...swapForm, desiredDate: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-maatram-yellow focus:border-transparent outline-none text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Reason</label>
              <textarea
                name="reason"
                required
                rows="3"
                value={swapForm.reason}
                onChange={(e) => setSwapForm({ ...swapForm, reason: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-maatram-yellow focus:border-transparent outline-none text-sm transition-all"
                placeholder="Briefly explain why..."
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-maatram-yellow text-black font-bold rounded-xl hover:bg-maatram-yellow-dark transition-colors shadow-lg shadow-maatram-yellow/20"
            >
              Submit Request
            </button>

            {message && (
              <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm font-medium border border-green-100 text-center animate-fade-in">
                {message}
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
};

export default Scheduling;
