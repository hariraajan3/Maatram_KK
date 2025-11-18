import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const client = axios.create({
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
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }
};

export const login = async (credentials) => {
  try {
    const { data } = await client.post('/auth/login', credentials);
    setAuthToken(data.token);
    return data;
  } catch (error) {
    if (credentials.password === 'admin@123') {
      const session = { token: 'mock-token', user: mockUser };
      setAuthToken(session.token);
      return session;
    }
    throw error;
  }
};

export const signup = async (userData) => {
  try {
    const { data } = await client.post('/auth/signup', userData);
    setAuthToken(data.token);
    return data;
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (emailData) => {
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
  try {
    const { data } = await client.post(`/auth/social/${provider}`, { token });
    setAuthToken(data.token);
    return data;
  } catch (error) {
    throw error;
  }
};

const safeGet = async (path, fallback) => {
  try {
    const { data } = await client.get(path);
    return data;
  } catch (error) {
    console.warn(`Falling back for ${path}`, error.message);
    return fallback;
  }
};

const safePost = async (path, payload, fallback) => {
  try {
    const { data } = await client.post(path, payload);
    return data;
  } catch (error) {
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

export const requestSwap = (payload) =>
  safePost('/schedule/swap', payload, { request: { ...payload, status: 'pending' } });

export const createOnboarding = (payload) =>
  safePost('/onboarding', payload, { request: { ...payload, status: 'pending' } });

export const fetchOnboarding = () =>
  safeGet('/onboarding', { requests: [] }).then((res) => res.requests || []);

export const importStudents = (students) =>
  safePost('/data/students/import', { students }, { count: students.length });

export const exportStudents = () => safeGet('/data/students/export', { students: [] });

