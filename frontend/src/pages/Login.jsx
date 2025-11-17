import { useState } from 'react';
import PropTypes from 'prop-types';
import '../App.css';

const Login = ({ onSuccess }) => {
  const [form, setForm] = useState({ email: 'admin@maatram.org', password: 'admin@123' });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await onSuccess(form);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 space-y-4"
      >
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Maatram KK</h1>
          <p className="text-sm text-slate-500">Unified operations console</p>
        </div>
        <div>
          <label htmlFor="email" className="text-xs uppercase text-slate-500 tracking-wide">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-300 focus:outline-none"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
        </div>
        <div>
          <label htmlFor="password" className="text-xs uppercase text-slate-500 tracking-wide">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-300 focus:outline-none"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full bg-brand-500 hover:bg-brand-700 transition text-white py-2 rounded-lg font-semibold"
        >
          Sign in
        </button>
        <p className="text-[11px] text-slate-400">
          Use seeded credentials (admin@maatram.org / admin@123) to explore the prototype.
        </p>
      </form>
    </div>
  );
};

Login.propTypes = {
  onSuccess: PropTypes.func.isRequired,
};

export default Login;

