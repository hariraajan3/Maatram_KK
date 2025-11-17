import { useEffect, useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { fetchDashboard } from '../services/api';

const metricClasses = 'bg-white rounded-2xl p-5 shadow-sm border border-slate-100';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard().then((payload) => {
      setData(payload);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading dashboard...</p>;
  }

  const metrics = [
    { label: 'Tutors', value: data.meta.totalTutors },
    { label: 'Students', value: data.meta.totalStudents },
    { label: 'Classes', value: data.meta.totalClasses },
    { label: 'Attendance %', value: `${data.meta.attendanceRate}%` },
  ];

  const phaseChart = Object.entries(data.workloadByPhase || {}).map(([phase, value]) => ({
    phase,
    value,
  }));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Today at a glance</h2>
        <p className="text-sm text-slate-500">Selection, scheduling and attendance in one view.</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {metrics.map((metric) => (
            <div key={metric.label} className={metricClasses}>
              <p className="text-xs uppercase tracking-wide text-slate-500">{metric.label}</p>
              <p className="text-3xl font-semibold text-slate-900 mt-3">{metric.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Phase workload</h3>
              <p className="text-xs text-slate-500">Active classes for each KK phase</p>
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={phaseChart}>
                <XAxis dataKey="phase" />
                <Tooltip />
                <Bar dataKey="value" fill="#2f9e44" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Rapid actions</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>• Trigger onboarding approvals</li>
            <li>• Review pending swaps</li>
            <li>• Regroup low progress students</li>
          </ul>
          <p className="mt-6 text-xs text-slate-400">Role: {data.role}</p>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Onboarding queue</h3>
          <div className="mt-4 space-y-3">
            {data.onboardingQueue.length === 0 && (
              <p className="text-sm text-slate-500">No pending approvals 🎉</p>
            )}
            {data.onboardingQueue.map((request) => (
              <article
                key={request.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex justify-between text-sm"
              >
                <div>
                  <p className="font-semibold text-slate-900">{request.name}</p>
                  <p className="text-xs text-slate-500">{request.email}</p>
                </div>
                <span className="px-2 py-1 rounded-full text-[11px] bg-amber-100 text-amber-600">
                  {request.status}
                </span>
              </article>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">High-touch students</h3>
          <div className="mt-4 space-y-3">
            {data.students.map((student) => (
              <article key={student.id} className="p-3 rounded-xl border border-slate-100">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{student.name}</p>
                    <p className="text-xs text-slate-500">
                      {student.phase} • {student.group}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-brand-700">
                    {student.progressScore}%
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

