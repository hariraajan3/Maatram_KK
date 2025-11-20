import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Scheduling from './pages/Scheduling';
import Attendance from './pages/Attendance';
import Onboarding from './pages/Onboarding';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import { login as loginApi, signup as signupApi, setAuthToken } from './services/api';
import './App.css';

const App = () => {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem('kk_session');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Unable to parse session', error);
      return null;
    }
  });

  useEffect(() => {
    if (session?.token) {
      setAuthToken(session.token);
    } else {
      setAuthToken(null);
    }
  }, [session]);

  const handleLogin = async (credentials) => {
    const payload = await loginApi(credentials);
    setSession(payload);
    localStorage.setItem('kk_session', JSON.stringify(payload));
  };

  const handleSignup = async (userData) => {
    const payload = await signupApi(userData);
    setSession(payload);
    localStorage.setItem('kk_session', JSON.stringify(payload));
  };

  const handleLogout = () => {
    localStorage.removeItem('kk_session');
    setSession(null);
    setAuthToken(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={session ? <Navigate to="/" replace /> : <Login onSuccess={handleLogin} />}
        />
        <Route
          path="/signup"
          element={session ? <Navigate to="/" replace /> : <Signup />}
        />
        <Route
          path="/forgot-password"
          element={session ? <Navigate to="/" replace /> : <ForgotPassword />}
        />
        <Route
          path="/"
          element={
            session ? (
              <Layout user={session.user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="scheduling" element={<Scheduling />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to={session ? '/' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
