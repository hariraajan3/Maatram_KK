import { useMemo, useState } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { exportStudents, importStudents } from '../services/api';

const Analytics = () => {
  const [importPayload, setImportPayload] = useState('');
  const [status, setStatus] = useState('');

  const weeklyData = useMemo(
    () => [
      { week: 'W1', productivity: 78 },
      { week: 'W2', productivity: 82 },
      { week: 'W3', productivity: 90 },
      { week: 'W4', productivity: 88 },
    ],
    [],
  );

  const handleImport = async () => {
    try {
      const parsed = JSON.parse(importPayload || '[]');
      const response = await importStudents(parsed);
      setStatus(`Imported ${response.count} rows`);
    } catch (error) {
      setStatus(`Unable to import: ${error.message}`);
    }
  };

  const handleExport = async () => {
    const { students } = await exportStudents();
    const blob = new Blob([JSON.stringify(students, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kk-students.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-slate-900">Insights & automation</h2>
        <p className="text-sm text-slate-500">
          Real-time dashboards for admins and leads, plus Excel-compatible data sync.
        </p>
      </header>

      <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Tutor productivity trend</h3>
            <p className="text-xs text-slate-500">Weekly blended score (attendance + feedback)</p>
          </div>
          <span className="text-sm bg-brand-50 text-brand-700 px-3 py-1 rounded-full">
            node-cron + analytics
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={weeklyData}>
              <XAxis dataKey="week" />
              <Tooltip />
              <Line type="monotone" dataKey="productivity" stroke="#2f9e44" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Excel import / export</h3>
            <p className="text-sm text-slate-500">
              Paste spreadsheet JSON to import, or export the mastered dataset securely.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm"
          >
            Export students
          </button>
        </div>
        <textarea
          rows={4}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          placeholder='[{"name":"New Student","guardianContact":"9876543210"}]'
          value={importPayload}
          onChange={(event) => setImportPayload(event.target.value)}
        />
        <div className="flex items-center justify-between mt-3">
          <button
            type="button"
            onClick={handleImport}
            className="bg-brand-500 hover:bg-brand-700 transition text-white px-4 py-2 rounded-lg text-sm"
          >
            Import data
          </button>
          {status && <p className="text-sm text-slate-500">{status}</p>}
        </div>
      </section>
    </div>
  );
};

export default Analytics;

