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
import { login as loginApi, setAuthToken } from './services/api';
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
          <Route
            index
            element={
              // <RoleRoute allowedRoles={['ADMIN', 'SELECTION_TEAM']}>
                <Selection />
              // </RoleRoute>
            }
          />
          <Route
            path="scheduling"
            element={
              // <RoleRoute allowedRoles={['ADMIN', 'TUTOR_LEADS', 'CLASS_INSPECTION_TEAM']}>
                <Scheduling />
              // </RoleRoute>
            }
          />
          <Route
            path="attendance"
            element={
              // <RoleRoute allowedRoles={['ADMIN', 'TUTOR_LEADS', 'ATTENDANCE_TRACKING_TEAM']}>
                <Attendance />
              // </RoleRoute>
            }
          />
          <Route
            path="onboarding"
            element={
              // <RoleRoute allowedRoles={['ADMIN', 'TUTOR_LEADS']}>
                <Onboarding />
              // </RoleRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              // <RoleRoute allowedRoles={['ADMIN', 'TUTOR_LEADS']}>
                <Dashboard />
              // </RoleRoute>
            }
          />
          <Route
            path="admin-logs"
            element={
              // <RoleRoute allowedRoles={['ADMIN']}>
                <AdminLogs />
              // </RoleRoute>
            }
          />
          <Route
            path="overall-attendance"
            element={
              // <RoleRoute allowedRoles={['ADMIN', 'TUTOR_LEADS', 'ATTENDANCE_TRACKING_TEAM']}>
                <OverallAttendance />
              
            }
          />
          {/* <Route
            path="tutor-attendance"
            element={
              // <RoleRoute allowedRoles={['TUTOR', 'ADMIN', 'TUTOR_LEADS']}>
                <TutorAttendance />
              // </RoleRoute>
            }
          /> */}
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to={session ? '/' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
