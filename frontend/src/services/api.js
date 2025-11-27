import axios from 'axios';

// If VITE_API_URL is not set, the app will run in mock mode and avoid
// making real network requests (this prevents ERR_CONNECTION_REFUSED logs
// when the backend is not running during development).
const API_BASE = import.meta.env.VITE_API_URL || null;
const USE_MOCK = !API_BASE;

const client = USE_MOCK
  ? null
  : axios.create({
    baseURL: API_BASE,
  });

const mockUser = {
  id: 'mock-admin',
  name: 'Akila Admin',
  role: 'admin',
  email: 'admin@maatram.org',
};

const mockDashboard = {
  meta: {
    totalTutors: 24,
    totalStudents: 180,
    totalClasses: 42,
    upcomingClasses: 12,
    attendanceRate: 93,
  },
  workloadByPhase: {
    Selection: 8,
    Scheduling: 15,
    Attendance: 19,
  },
  onboardingQueue: [],
  swapQueue: [],
  students: [
    { id: 's1', name: 'Mani K', phase: 'Selection', group: 'KK-2025-A', progressScore: 76 },
    { id: 's2', name: 'Harini D', phase: 'Scheduling', group: 'KK-2025-B', progressScore: 83 },
  ],
  role: 'admin',
};

export const setAuthToken = (token) => {
  if (!client) return;
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }
};

export const login = async (credentials) => {
  if (USE_MOCK) {
    // simple mock login for local development
    if (credentials.password === 'admin@123' || credentials.email === 'admin@maatram.org') {
      const session = { token: 'mock-token', user: mockUser };
      setAuthToken(session.token);
      return session;
    }
    // mimic API failure
    const err = new Error('Invalid credentials (mock)');
    err.response = { status: 401 };
    throw err;
  }

  try {
    const { data } = await client.post('/auth/login', credentials);
    setAuthToken(data.token);
    return data;
  } catch (error) {
    throw error;
  }
};

export const signup = async (userData) => {
  if (USE_MOCK) {
    const session = { token: 'mock-token', user: mockUser };
    setAuthToken(session.token);
    return session;
  }
  try {
    const { data } = await client.post('/auth/signup', userData);
    setAuthToken(data.token);
    return data;
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (emailData) => {
  if (USE_MOCK) return { ok: true };
  try {
    const { data } = await client.post('/auth/forgot-password', emailData);
    return data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (resetData) => {
  try {
    const { data } = await client.post('/auth/reset-password', resetData);
    return data;
  } catch (error) {
    throw error;
  }
};

export const socialLogin = async (provider, token) => {
  if (USE_MOCK) {
    const session = { token: 'mock-token', user: mockUser };
    setAuthToken(session.token);
    return session;
  }
  try {
    const { data } = await client.post(`/auth/social/${provider}`, { token });
    setAuthToken(data.token);
    return data;
  } catch (error) {
    throw error;
  }
};

const safeGet = async (path, fallback) => {
  if (USE_MOCK) {
    console.warn(`API not configured, returning mock fallback for ${path}`);
    return fallback;
  }
  try {
    const { data } = await client.get(path);
    return data;
  } catch (error) {
    // If the request is unauthorized, clear session and redirect to login
    if (error.response && error.response.status === 401) {
      console.warn(`Unauthorized request for ${path} - clearing session and redirecting to /login`);
      try {
        localStorage.removeItem('kk_session');
      } catch (e) {
        // ignore
      }
      try {
        setAuthToken(null);
      } catch (e) {
        // ignore
      }
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return fallback;
    }

    console.warn(`Falling back for ${path}`, error.message);
    return fallback;
  }
};

const safePost = async (path, payload, fallback) => {
  if (USE_MOCK) {
    console.warn(`API not configured, returning mock fallback for POST ${path}`);
    return fallback || { ok: true };
  }
  try {
    const { data } = await client.post(path, payload);
    return data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.warn(`Unauthorized POST to ${path} - clearing session and redirecting to /login`);
      try {
        localStorage.removeItem('kk_session');
      } catch (e) { }
      try {
        setAuthToken(null);
      } catch (e) { }
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return fallback || { ok: true };
    }

    console.warn(`Falling back for ${path}`, error.message);
    return fallback || { ok: true };
  }
};

export const fetchDashboard = () => safeGet('/dashboard', mockDashboard);

export const fetchClasses = () =>
  safeGet('/schedule', { classes: [] }).then((res) => res.classes || []);

export const fetchAttendance = () =>
  safeGet('/attendance', { attendance: [] }).then((res) => res.attendance || []);

export const recordAttendance = (payload) =>
  safePost('/attendance', payload, { record: payload });

export const recordBulkAttendance = (attendanceList) =>
  safePost('/attendance/bulk', { attendance: attendanceList }, { success: true });

export const requestSwap = (payload) =>
  safePost('/schedule/swap', payload, { request: { ...payload, status: 'pending' } });

export const createOnboarding = (payload) =>
  safePost('/onboarding', payload, { request: { ...payload, status: 'pending' } });

export const fetchOnboarding = () =>
  safeGet('/onboarding', { requests: [] }).then((res) => res.requests || []);

export const updateOnboardingStatus = (id, status) =>
  safePost(`/onboarding/${id}/status`, { status }, { request: { id, status } });

export const fetchAuditLogs = () =>
  safeGet('/admin/logs', { logs: [] }).then((res) => res.logs || []);

export const fetchRoles = () =>
  safeGet('/admin/roles', { roles: [] }).then((res) => res.roles || []);

export const updateRolePermissions = (roleName, permissions) =>
  safePost('/admin/roles/permissions', { roleName, permissions }, { role: { name: roleName, permissions } });

export const assignRole = (userId, newRole) =>
  safePost('/admin/users/role', { userId, newRole }, { user: { id: userId, role: newRole } });

export const importStudents = (students) =>
  safePost('/data/students/import', { students }, { count: students.length });

export const exportStudents = () => safeGet('/data/students/export', { students: [] });

