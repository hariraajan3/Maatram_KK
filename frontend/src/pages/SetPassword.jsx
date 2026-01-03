import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Assuming API_URL is defined somewhere or we use the relative path if proxied
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SetPassword = () => {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setMessage({ type: 'error', text: 'Invalid or missing setup token.' });
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        if (password.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await axios.post(`${API_URL}/auth/setup-account`, {
                token,
                password
            });

            setMessage({ type: 'success', text: response.data.message });
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to set password. Link might be expired.'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Link</h2>
                    <p className="text-gray-600">This setup link is invalid or has expired. Please contact your administrator for a new invitation.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-maatram-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-icons-outlined text-3xl">lock</span>
                    </div>
                    <h2 className="text-2xl font-bold text-black">Set Your Password</h2>
                    <p className="text-gray-500 mt-2">Create a secure password for your Maatram account.</p>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                        <span className="material-icons-outlined text-lg">
                            {message.type === 'success' ? 'check_circle' : 'error_outline'}
                        </span>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">New Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-maatram-yellow focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Confirm Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-maatram-yellow focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 bg-black text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Setting Password...
                            </>
                        ) : (
                            'Complete Registration'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetPassword;
