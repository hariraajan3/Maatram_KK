import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import RoleRoute from './components/RoleRoute';
import RequirePermission from './RequirePermission';

import Dashboard from './pages/Dashboard';
import Selection from './pages/Selection';
import Scheduling from './pages/Scheduling';
import Attendance from './pages/Attendance';
import OverallAttendance from './pages/OverallAttendance';
import Onboarding from './pages/Onboarding';
import AdminLogs from './pages/AdminLogs';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import './App.css'
import { AuthProvider, useAuth } from './AuthContext';
import { setAuthToken } from './services/api';
import { PERMISSIONS } from './permissions';

const ProtectedLayout = ({ session, onLogout }) => {
  const { setUser } = useAuth();

  useEffect(() => {
    setUser(session?.user || null);
  }, [session, setUser]);

  if (!session) return <Navigate to="/login" replace />;

  return <Layout user={session.user} onLogout={onLogout} />;
};

const App = () => {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem('kk_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
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

  const handleLogin = (payload) => {
    localStorage.setItem('kk_session', JSON.stringify(payload));
    setAuthToken(payload.token);
    setSession(payload);
  };

  const handleLogout = () => {
    localStorage.removeItem('kk_session');
    setAuthToken(null);
    setSession(null);
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Public Routes */}
          <Route
            path="/login"
            element={
              session ? <Navigate to="/" replace /> : <Login onSuccess={handleLogin} />
            }
          />
          <Route
            path="/forgot-password"
            element={
              session ? <Navigate to="/" replace /> : <ForgotPassword />
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={<ProtectedLayout session={session} onLogout={handleLogout} />}
          >
            <Route
              index
              element={
                <RoleRoute allowedRoles={['admin', 'tutorLead', 'coordinator']}>
                  <RequirePermission permission={PERMISSIONS.SELECTION_VIEW}>
                    <Selection />
                  </RequirePermission>
                </RoleRoute>
              }
            />

            <Route
              path="scheduling"
              element={
                <RoleRoute allowedRoles={['admin', 'tutorLead']}>
                  <RequirePermission permission={PERMISSIONS.SCHEDULING_VIEW}>
                    <Scheduling />
                  </RequirePermission>
                </RoleRoute>
              }
            />

            <Route
              path="attendance"
              element={
                <RoleRoute allowedRoles={['admin', 'tutorLead', 'tutor', 'coordinator']}>
                  <RequirePermission permission={PERMISSIONS.ATTENDANCE_VIEW}>
                    <Attendance />
                  </RequirePermission>
                </RoleRoute>
              }
            />

            <Route
              path="onboarding"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <RequirePermission permission={PERMISSIONS.ONBOARDING_MANAGE}>
                    <Onboarding />
                  </RequirePermission>
                </RoleRoute>
              }
            />

            <Route
              path="dashboard"
              element={
                <RoleRoute allowedRoles={['admin', 'tutorLead']}>
                  <RequirePermission permission={PERMISSIONS.DASHBOARD_VIEW}>
                    <Dashboard />
                  </RequirePermission>
                </RoleRoute>
              }
            />

            <Route
              path="admin-logs"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <RequirePermission permission={PERMISSIONS.ADMIN_LOGS}>
                    <AdminLogs />
                  </RequirePermission>
                </RoleRoute>
              }
            />

            <Route
              path="overall-attendance"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <RequirePermission permission={PERMISSIONS.ATTENDANCE_OVERALL_VIEW}>
                    <OverallAttendance />
                  </RequirePermission>
                </RoleRoute>
              }
            />

            <Route
              path="profile"
              element={
                <RequirePermission permission={PERMISSIONS.PROFILE_VIEW}>
                  <Profile />
                </RequirePermission>
              }
            />
          </Route>

          {/* Catch-all */}
          <Route
            path="*"
            element={<Navigate to={session ? '/' : '/login'} replace />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
