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

  useEffect(() => {
    fetchClasses().then(setClasses);
  }, []);

  const submitSwap = async (event) => {
    event.preventDefault();
    const payload = await requestSwap(swapForm);
    setMessage(`Swap #${payload?.request?.id || 'local'} captured`);
    setSwapForm({
      classId: '',
      reason: '',
      proposedByTutorId: '',
      targetTutorId: '',
      desiredDate: '',
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-slate-900">Scheduling cockpit</h2>
        <p className="text-sm text-slate-500">
          Coordinate live classes, handle swaps, reschedules, and cancellations with instant alerts.
        </p>
      </header>
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Upcoming classes</h3>
          <span className="text-xs text-slate-500">{classes.length} records</span>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2">Phase</th>
                <th>Group</th>
                <th>Tutor</th>
                <th>Start</th>
                <th>Mode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {classes.map((cls) => (
                <tr key={cls.id}>
                  <td className="py-2 font-semibold text-slate-900">{cls.phase}</td>
                  <td>{cls.studentGroup}</td>
                  <td>{cls.tutorName}</td>
                  <td>{new Date(cls.startTime).toLocaleString('en-IN')}</td>
                  <td className="capitalize">{cls.modality}</td>
                  <td>
                    <span className="px-2 py-1 text-xs rounded-full bg-brand-50 text-brand-700">
                      {cls.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {classes.length === 0 && <p className="text-sm text-slate-500">No classes yet.</p>}
        </div>
      </section>

      <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900">Class swap / reschedule</h3>
        <p className="text-sm text-slate-500 mb-4">
          Capture swap requests. Admins and tutor leads get notified instantly via email + WhatsApp.
        </p>
        <form onSubmit={submitSwap} className="grid md:grid-cols-2 gap-4">
          {['classId', 'proposedByTutorId', 'targetTutorId'].map((field) => (
            <input
              key={field}
              name={field}
              required
              placeholder={field}
              value={swapForm[field]}
              onChange={(event) => setSwapForm({ ...swapForm, [field]: event.target.value })}
              className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-300 focus:outline-none text-sm"
            />
          ))}
          <input
            type="datetime-local"
            name="desiredDate"
            required
            value={swapForm.desiredDate}
            onChange={(event) => setSwapForm({ ...swapForm, desiredDate: event.target.value })}
            className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-300 focus:outline-none text-sm"
          />
          <textarea
            name="reason"
            required
            placeholder="Reason and context"
            value={swapForm.reason}
            onChange={(event) => setSwapForm({ ...swapForm, reason: event.target.value })}
            className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-300 focus:outline-none text-sm md:col-span-2"
          />
          <div className="md:col-span-2 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Automated approvals and notifications keep everyone aligned.
            </p>
            <button
              type="submit"
              className="bg-brand-500 hover:bg-brand-700 transition text-white px-4 py-2 rounded-lg text-sm"
            >
              Submit request
            </button>
          </div>
          {message && <p className="text-sm text-brand-700">{message}</p>}
        </form>
      </section>
    </div>
  );
};

export default Scheduling;

