import axios from 'axios';
const RAW_BASE = import.meta.env.VITE_BACKEND_API || '';

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK || '').toLowerCase() === 'true';

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

export const login = async (credentials) => {
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

  try {
    const { data } = await client.post('/auth/login', credentials);
    setAuthToken(data.token);
    return data; 
  } catch (error) {
     const status = error?.response?.status;
     const backendMissingOrDown = !status || status === 404 || status === 502 || status === 503 || status === 504;
     if (backendMissingOrDown) {
      const session = tryMockLogin(credentials);
      if (session) {
        setAuthToken(session.token);
        return session;
      }
    }
    throw error;
  }
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

export const fetchDashboard = async () => {
  const { data } = await client.get('/dashboard');
  return data;
};

export const fetchClasses = async () => {
  const { data } = await client.get('/schedule');
  return data.classes || [];
};

export const requestSwap = async (payload) => {
  const { data } = await client.post('/schedule/swap', payload);
  return data;
};

export const recordAttendance = async (payload) => {
  const { data } = await client.post('/attendance', payload);
  return data;
};

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

export const createApplication = async (payload) => {
  const { data } = await client.post('/selection', payload);
  return data;
};

export const fetchApplications = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.phase) params.append('phase', filters.phase);
  if (filters.medium) params.append('medium', filters.medium);
  if (filters.district) params.append('district', filters.district);

  const { data } = await client.get(`/selection?${params.toString()}`);
  return data.applications || [];
};

export const fetchApplication = async (id) => {
  const { data } = await client.get(`/selection/${id}`);
  return data.application;
};

export const updateApplicationPhase = async (id, phase, notes) => {
  const { data } = await client.patch(`/selection/${id}/phase`, { phase, notes });
  return data;
};

export const fetchPhase1 = async () => {
  const { data } = await client.get('/selection/phase1');
  return data.applications || [];
};

export const fetchPhase2 = async () => {
  const { data } = await client.get('/selection/phase2');
  return data.applications || [];
};

export const fetchPhase3 = async () => {
  const { data } = await client.get('/selection/phase3');
  return data.applications || [];
};

export const fetchApplicationsByPhase = async (phase) => {
  const phaseMap = {
    'Phase1_Selection': 'phase1',
    'Phase2_Televerification': 'phase2',
    'Phase3_PanelInterview': 'phase3',
    'phase1': 'phase1',
    'phase2': 'phase2',
    'phase3': 'phase3',
  };
  const endpoint = phaseMap[phase] || `phase/${phase}`;
  const { data } = await client.get(`/selection/${endpoint}`);
  return data.applications || [];
};

// ---- Tutor Management ----
export const fetchTutors = async () => {
  const { data } = await client.get('/tutors');
  return data.tutors || [];
};

export const fetchTutorStudents = async (tutorId) => {
  const { data } = await client.get(`/tutors/${tutorId}/students`);
  return data.students || [];
};

export const fetchTutorAttendanceHistory = async (tutorId) => {
  const { data } = await client.get(`/tutors/${tutorId}/attendance`);
  return data.history || [];
};

// ---- Tutor's Own Students (for tutor role) ----
export const fetchMyStudents = async () => {
  const { data } = await client.get('/tutor/my-students');
  return data.students || [];
};

export const recordStudentAttendance = async (payload) => {
  const { data } = await client.post('/tutor/attendance', payload);
  return data;
};

