import { useEffect, useState } from 'react';
import { fetchAttendance, recordAttendance } from '../services/api';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [form, setForm] = useState({ classId: '', studentId: '', present: true, notes: '' });
  const [message, setMessage] = useState('');

  const refresh = () => fetchAttendance().then(setAttendance);

  useEffect(() => {
    refresh();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    await recordAttendance(form);
    setMessage('Attendance saved');
    setForm({ classId: '', studentId: '', present: true, notes: '' });
    refresh();
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-slate-900">Attendance & progress</h2>
        <p className="text-sm text-slate-500">
          Digitized attendance with instant archival of older data and persistent student history.
        </p>
      </header>

      <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">Mark attendance</h3>
        <form onSubmit={submit} className="grid md:grid-cols-4 gap-3">
          {['classId', 'studentId', 'notes'].map((field) => (
            <input
              key={field}
              required={field !== 'notes'}
              name={field}
              placeholder={field === 'notes' ? 'Notes (optional)' : field}
              value={form[field]}
              onChange={(event) => setForm({ ...form, [field]: event.target.value })}
              className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-300 focus:outline-none text-sm"
            />
          ))}
          <select
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            value={form.present}
            onChange={(event) => setForm({ ...form, present: event.target.value === 'true' })}
          >
            <option value="true">Present</option>
            <option value="false">Absent</option>
          </select>
          <button
            type="submit"
            className="md:col-span-4 bg-slate-900 text-white rounded-lg py-2 text-sm font-semibold"
          >
            Save attendance
          </button>
        </form>
        {message && <p className="text-sm text-brand-700 mt-2">{message}</p>}
      </section>

      <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Recent records</h3>
          <button type="button" onClick={refresh} className="text-sm text-brand-700 underline">
            Refresh
          </button>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500 border-b">
              <tr>
                <th className="py-2">Class</th>
                <th>Student</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {attendance.map((entry) => (
                <tr key={entry.id}>
                  <td className="py-2 font-semibold text-slate-900">{entry.classId}</td>
                  <td>{entry.studentId}</td>
                  <td>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        entry.present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {entry.present ? 'Present' : 'Absent'}
                    </span>
                  </td>
                  <td>{entry.notes || '-'}</td>
                  <td>{new Date(entry.date).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {attendance.length === 0 && (
            <p className="text-sm text-slate-500">No attendance recorded yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Attendance;

