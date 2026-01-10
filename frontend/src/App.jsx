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
import SetPassword from './pages/SetPassword';

import './App.css';

import { AuthProvider } from './AuthContext';
import { setAuthToken } from './services/api';
import { PERMISSIONS } from './permissions';
import { ROLES } from './permissions';
import { useAuth } from './AuthContext';

const ProtectedLayout = ({ session, onLogout }) => {
  if (!session) return <Navigate to="/login" replace />;
  return <Layout user={session.user} onLogout={onLogout} />;
};

const HomeRedirect = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === ROLES.TUTOR || user.role === ROLES.ATTENDANCE_TRACKING_TEAM) {
    return <Navigate to="/attendance" replace />;
  }

  if (user.role === ROLES.CLASS_INSPECTION_TEAM) {
    return <Navigate to="/scheduling" replace />;
  }

  return (
    <RoleRoute
      allowedRoles={[
        ROLES.ADMIN,
        ROLES.TUTOR_LEAD,
        ROLES.SELECTION_TEAM
      ]}
    >
      <RequirePermission permission={PERMISSIONS.SELECTION_VIEW}>
        <Selection />
      </RequirePermission>
    </RoleRoute>
  );
};

const App = () => {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem('kk_session');
      if (!saved) return null;
      const parsed = JSON.parse(saved);

      const ROLE_MAP = {
        'ADMIN': 'admin',
        'TUTOR_LEAD': 'tutorLead',
        'TUTOR': 'tutor',
        'SELECTION_TEAM': 'selectionTeam',
        'ATTENDANCE_TRACKING_TEAM': 'attendanceTrackingTeam',
        'CLASS_INSPECTION_TEAM': 'classInspectionTeam',
      };

      if (parsed.user && parsed.user.role) {
        parsed.user.role = ROLE_MAP[parsed.user.role] || parsed.user.role;
      }
      if (parsed.token) {
        setAuthToken(parsed.token);
      }

      return parsed;
    } catch {
      return null;
    }
  });

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
      <AuthProvider userData={session?.user}>
        <Routes>

          {/* ================= PUBLIC ROUTES ================= */}
          <Route
            path="/login"
            element={
              session
                ? <Navigate to="/" replace />
                : <Login onSuccess={handleLogin} />
            }
          />

          <Route
            path="/forgot-password"
            element={
              session
                ? <Navigate to="/" replace />
                : <ForgotPassword />
            }
          />

          <Route
            path="/set-password"
            element={<SetPassword />}
          />

          {/* ================= PROTECTED LAYOUT ================= */}
          <Route
            path="/"
            element={
              <ProtectedLayout
                session={session}
                onLogout={handleLogout}
              />
            }
          >

            {/* ================= SELECTION ================= */}
            <Route
              index
              element={<HomeRedirect />}
            />

            {/* ================= SCHEDULING ================= */}
            <Route
              path="scheduling"
              element={
                <RoleRoute
                  allowedRoles={[
                    ROLES.ADMIN,
                    ROLES.CLASS_INSPECTION_TEAM,
                    ROLES.TUTOR_LEAD,
                    ROLES.TUTOR,
                  ]}
                >
                  <RequirePermission permission={PERMISSIONS.SCHEDULING_VIEW}>
                    <Scheduling />
                  </RequirePermission>
                </RoleRoute>
              }
            />

            {/* ================= ATTENDANCE ================= */}
            <Route
              path="attendance"
              element={
                <RoleRoute
                  allowedRoles={[
                    ROLES.ADMIN,
                    ROLES.TUTOR_LEAD,
                    ROLES.TUTOR,
                    ROLES.ATTENDANCE_TRACKING_TEAM,
                  ]}
                >
                  <RequirePermission permission={PERMISSIONS.ATTENDANCE_VIEW}>
                    <Attendance />
                  </RequirePermission>
                </RoleRoute>
              }
            />

            {/* ================= OVERALL ATTENDANCE ================= */}
            <Route
              path="overall-attendance"
              element={
                <RoleRoute
                  allowedRoles={[
                    ROLES.ADMIN,
                    ROLES.TUTOR_LEAD,
                    ROLES.ATTENDANCE_TRACKING_TEAM,
                  ]}
                >
                  <RequirePermission permission={PERMISSIONS.ATTENDANCE_OVERALL_VIEW}>
                    <OverallAttendance />
                  </RequirePermission>
                </RoleRoute>
              }
            />

            {/* ================= ONBOARDING ================= */}
            <Route
              path="onboarding"
              element={
                <RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.TUTOR_LEAD]}>
                  <RequirePermission permission={PERMISSIONS.ONBOARDING_MANAGE}>
                    <Onboarding />
                  </RequirePermission>
                </RoleRoute>
              }
            />

            {/* ================= DASHBOARD ================= */}
            <Route
              path="dashboard"
              element={
                <RoleRoute
                  allowedRoles={[
                    ROLES.ADMIN,
                    ROLES.TUTOR_LEAD,
                  ]}
                >
                  <RequirePermission permission={PERMISSIONS.DASHBOARD_VIEW}>
                    <Dashboard />
                  </RequirePermission>
                </RoleRoute>
              }
            />

            {/* ================= ADMIN LOGS ================= */}
            <Route
              path="admin-logs"
              element={
                <RoleRoute allowedRoles={[ROLES.ADMIN]}>
                  <RequirePermission permission={PERMISSIONS.ADMIN_LOGS}>
                    <AdminLogs />
                  </RequirePermission>
                </RoleRoute>
              }
            />

            {/* ================= PROFILE ================= */}
            <Route
              path="profile"
              element={
                <RequirePermission permission={PERMISSIONS.PROFILE_VIEW}>
                  <Profile />
                </RequirePermission>
              }
            />

          </Route>

          {/* ================= CATCH ALL ================= */}
          <Route
            path="*"
            element={
              <Navigate to={session ? '/' : '/login'} replace />
            }
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
