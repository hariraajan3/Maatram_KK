import { useEffect, useState } from 'react';
import { createOnboarding, fetchOnboarding } from '../services/api';

const Onboarding = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');

  const load = () => fetchOnboarding().then(setRequests);

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    await createOnboarding({ ...form, documents: ['nda.pdf'] });
    setMessage('Request submitted with automated notifications');
    setForm({ name: '', email: '', phone: '' });
    load();
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-slate-900">Tutor onboarding</h2>
        <p className="text-sm text-slate-500">
          Automated workflows for approvals, document capture, and relieving updates.
        </p>
      </header>
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Invite a tutor</h3>
        <form onSubmit={submit} className="grid md:grid-cols-3 gap-3">
          {['name', 'email', 'phone'].map((field) => (
            <input
              key={field}
              required
              name={field}
              placeholder={field}
              value={form[field]}
              onChange={(event) => setForm({ ...form, [field]: event.target.value })}
              className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-300 focus:outline-none text-sm"
            />
          ))}
          <button
            type="submit"
            className="md:col-span-3 bg-brand-500 hover:bg-brand-700 transition text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Trigger onboarding
          </button>
        </form>
        {message && <p className="mt-2 text-sm text-brand-700">{message}</p>}
      </section>

      <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Live requests</h3>
        <div className="space-y-3">
          {requests.map((request) => (
            <article key={request.id || request.email} className="p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{request.name}</p>
                  <p className="text-xs text-slate-500">{request.email}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs bg-amber-100 text-amber-600">
                  {request.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Created{' '}
                {request.createdAt
                  ? new Date(request.createdAt).toLocaleString('en-IN')
                  : 'pending sync'}
              </p>
            </article>
          ))}
          {requests.length === 0 && <p className="text-sm text-slate-500">No requests yet.</p>}
        </div>
      </section>
    </div>
  );
};

export default Onboarding;

