import { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../App.css';
import { login } from '../services/api';
import { Eye, EyeOff } from 'lucide-react';


const Login = ({ onSuccess }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = await login(form);
      if (typeof onSuccess === 'function') {
        await onSuccess(payload);

        window.location.href = '/';
      } 
      else {
        localStorage.setItem('kk_session', JSON.stringify(payload));
        window.location.href = '/';
      }
    } 
    catch (loginErr) {
      console.error('Login error:', loginErr);
      setError(loginErr?.response?.data?.message || 'Unable to login. Please try again.');
    } 
    finally {
      setLoading(false);
    }
  };

  // main
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.2)] border border-gray-100 p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-black mb-2">Maatram KK</h1>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-black mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-maatram-yellow focus:border-maatram-yellow outline-none transition font-medium"
                placeholder="Enter your email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-black mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-maatram-yellow focus:border-maatram-yellow outline-none transition font-medium pr-10"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-black hover:text-black/70 font-bold"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            {error && (
              <div className="bg-red-100 border-2 border-red-500 text-red-900 px-4 py-3 rounded-lg text-sm font-bold">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-maatram-yellow hover:bg-maatram-yellow-dark text-black py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

Login.propTypes = {
  onSuccess: PropTypes.func,
};

export default Login;
