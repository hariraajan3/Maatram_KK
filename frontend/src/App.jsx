import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import RoleRoute from './components/RoleRoute';
import Dashboard from './pages/Dashboard';
import Selection from './pages/Selection';
import Scheduling from './pages/Scheduling';
import Attendance from './pages/Attendance';
import OverallAttendance from './pages/TutorManagement';
import TutorAttendance from './pages/TutorAttendance';
import Onboarding from './pages/Onboarding';
import AdminLogs from './pages/AdminLogs';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import { setAuthToken } from './services/api';
import './App.css';
import { AuthProvider, useAuth } from "./AuthContext";
import RequirePermission from "./RequirePermission";
import { PERMISSIONS } from './permissions';

/**
 * Main routes component - separated to use AuthContext hooks
 */
const AppRoutes = ({ session, handleLogout }) => {
  const { setUser } = useAuth();

  // Update AuthContext when session changes
  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    } else {
      setUser(null);
    }
  }, [session, setUser]);

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={session ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/forgot-password"
        element={session ? <Navigate to="/" replace /> : <ForgotPassword />}
      />

      {/* Protected routes */}
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
        {/* Selection - admin, tutorLead, coordinator */}
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

        {/* Scheduling - admin, tutorLead */}
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

        {/* Attendance - admin, tutorLead, tutor, coordinator */}
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

        {/* Onboarding - admin only */}
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

        {/* Dashboard - admin, tutorLead */}
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

        {/* Admin Logs - admin only */}
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

        {/* Overall Attendance - admin only */}
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

        {/* Tutor Attendance - tutor, tutorLead */}
        <Route
          path="tutor-attendance"
          element={
            <RoleRoute allowedRoles={['tutor', 'tutorLead']}>
              <RequirePermission permission={PERMISSIONS.TUTOR_ATTENDANCE_MANAGE}>
                <TutorAttendance />
              </RequirePermission>
            </RoleRoute>
          }
        />

        {/* Profile - all authenticated users */}
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
      <Route path="*" element={<Navigate to={session ? '/' : '/login'} replace />} />
    </Routes>
  );
};

/**
 * Main App component
 */
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

  // Listen for storage changes (e.g., from Login page)
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('kk_session');
        setSession(saved ? JSON.parse(saved) : null);
      } catch (error) {
        console.warn('Unable to parse session from storage', error);
        setSession(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (session?.token) {
      setAuthToken(session.token);
    } else {
      setAuthToken(null);
    }
  }, [session]);

  const handleLogin = async (payload) => {
    // payload expected to be { token, user }
    try {
      setSession(payload);
      if (payload?.token) setAuthToken(payload.token);
      localStorage.setItem('kk_session', JSON.stringify(payload));
    } catch (e) {
      console.error('Error saving session', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kk_session');
    setSession(null);
    setAuthToken(null);
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes session={session} handleLogout={handleLogout} handleLogin={handleLogin} />
      </AuthProvider>
    </BrowserRouter>
  );
};


export default App;