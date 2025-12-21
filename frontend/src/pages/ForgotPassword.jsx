import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess(false);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword({ email });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-maatram-yellow p-8 space-y-6 text-center">
          <div className="mx-auto w-16 h-16 bg-maatram-yellow rounded-full flex items-center justify-center border-2 border-black">
            <svg
              className="w-8 h-8 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-black mb-2">Check your email</h1>
            <p className="text-black/70 font-medium">
              We've sent a password reset link to <strong className="text-black">{email}</strong>
            </p>
          </div>
          <p className="text-sm text-black/60 font-medium">
            Click the link in the email to reset your password. If you don't see it, check your
            spam folder.
          </p>
          <Link
            to="/login"
            className="block w-full bg-maatram-yellow hover:bg-maatram-yellow-dark text-black py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl border-2 border-black"
          >
            Back to Sign in
          </Link>
        </div>
      </div>
    </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-maatram-yellow p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-black mb-2">Forgot Password?</h1>
            <p className="text-sm text-black/70 font-medium">
              No worries, we'll send you reset instructions.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-black mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full border-2 border-black rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-maatram-yellow focus:border-maatram-yellow outline-none transition font-medium"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-100 border-2 border-red-500 text-red-900 px-4 py-3 rounded-lg text-sm font-bold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-maatram-yellow hover:bg-maatram-yellow-dark text-black py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border-2 border-black"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Back to login link */}
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-black hover:text-black/70 font-bold underline"
            >
              ← Back to Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

