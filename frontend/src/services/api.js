import axios from 'axios';

// Set this in Vercel / local `.env` as VITE_BACKEND_API=https://your-backend-domain.com
// If not set:
// - in dev, Vite proxy in `vite.config.js` forwards `/api` to http://localhost:4000
// - in prod, you should set VITE_BACKEND_API to your deployed backend URL
const RAW_BASE = import.meta.env.VITE_BACKEND_API || '';

// Enable demo/mock mode (no backend needed)
// Local: create `frontend/.env.local` with `VITE_USE_MOCK=true`
// Vercel: set env var `VITE_USE_MOCK=true`
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK || '').toLowerCase() === 'true';

// Normalize API_BASE to avoid double /api
const normalizeBaseURL = (url) => {
  if (!url) return '/api';
  const normalized = url.replace(/\/+$/, '').replace(/\/api$/, '');
  return `${normalized}/api`;
};

const client = axios.create({
  baseURL: normalizeBaseURL(RAW_BASE),
});

export const setAuthToken = (token) => {
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }
};

const mockUsers = {
  'admin@maatram.org': { id: 'mock-admin', name: 'Akila Admin', role: 'admin', email: 'admin@maatram.org' },
  'lead@maatram.org': { id: 'mock-lead', name: 'Latha Lead', role: 'tutorLead', email: 'lead@maatram.org' },
  'tutor@maatram.org': { id: 'mock-tutor', name: 'Siva Tutor', role: 'tutor', email: 'tutor@maatram.org' },
  'coord@maatram.org': { id: 'mock-coord', name: 'Priya Coordinator', role: 'coordinator', email: 'coord@maatram.org' },
};

const mockPasswords = {
  'admin@maatram.org': 'admin@123',
  'lead@maatram.org': 'lead@123',
  'tutor@maatram.org': 'tutor@123',
  'coord@maatram.org': 'coord@123',
};

const tryMockLogin = (credentials) => {
  const email = String(credentials?.email || '').toLowerCase().trim();
  const password = String(credentials?.password || '');
  const user = mockUsers[email];
  if (!user) return null;
  if (mockPasswords[email] !== password) return null;
  return { token: 'mock-token', user };
};

// ---- Auth ----
export const login = async (credentials) => {
  // Demo/mock mode: allow login without any backend.
  if (USE_MOCK) {
    const session = tryMockLogin(credentials);
    if (!session) {
      const err = new Error('Invalid email or password (demo)');
      err.response = { status: 401, data: { message: 'Invalid email or password (demo)' } };
      throw err;
    }
    setAuthToken(session.token);
    return session;
  }

  const { data } = await client.post('/auth/login', credentials);
  setAuthToken(data.token);
  return data; // { token, user }
};

export const signup = async (payload) => {
  const { data } = await client.post('/auth/signup', payload);
  if (data?.token) setAuthToken(data.token);
  return data;
};

export const forgotPassword = async (payload) => {
  const { data } = await client.post('/auth/forgot-password', payload);
  return data;
};

// ---- Dashboard ----
export const fetchDashboard = async () => {
  const { data } = await client.get('/dashboard');
  return data;
};

// ---- Scheduling ----
export const fetchClasses = async () => {
  const { data } = await client.get('/schedule');
  return data.classes || [];
};

export const requestSwap = async (payload) => {
  const { data } = await client.post('/schedule/swap', payload);
  return data;
};

// ---- Attendance ----
export const recordAttendance = async (payload) => {
  const { data } = await client.post('/attendance', payload);
  return data;
};

// ---- Onboarding ----
export const createOnboarding = async (payload) => {
  const { data } = await client.post('/onboarding', payload);
  return data;
};

export const fetchOnboarding = async () => {
  const { data } = await client.get('/onboarding');
  return data.requests || [];
};

export const updateOnboardingStatus = async (id, status) => {
  const { data } = await client.patch(`/onboarding/${id}`, { status });
  return data;
};

// ---- Admin ----
export const fetchAuditLogs = async () => {
  const { data } = await client.get('/admin/logs');
  return data.logs || [];
};

export const fetchRoles = async () => {
  const { data } = await client.get('/admin/roles');
  return data.roles || [];
};

export const updateRolePermissions = async (roleName, permissions) => {
  const { data } = await client.put('/admin/roles/permissions', { roleName, permissions });
  return data;
};

export const fetchUsers = async () => {
  const { data } = await client.get('/admin/users');
  return data.users || [];
};

export const assignRole = async (userId, newRole) => {
  const { data } = await client.post('/admin/users/role', { userId, newRole });
  return data;
};

export const deleteUser = async (userId) => {
  const { data } = await client.delete(`/admin/users/${userId}`);
  return data;
};


