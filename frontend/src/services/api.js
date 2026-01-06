import axios from "axios";
const getBaseUrl = () => {
  // let url = import.meta.env.VITE_BACKEND_API ;
  let url = 'http://localhost:4000';
  if (!url.endsWith('/api')) url += '/api';
  return url;
};

const BASE_URL = getBaseUrl();

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  }
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export const login = async (credentials) => {
  const { data } = await apiClient.post('/auth/login', credentials);
  setAuthToken(data.token);
  return data;
};

// export const signup = async (payload) => {
//   const { data } = await apiClient.post('/auth/signup', payload);
//   if (data?.token) setAuthToken(data.token);
//   return data;
// };

export const forgotPassword = async (payload) => {
  const { data } = await apiClient.post('/auth/forgot-password', payload);
  return data;
};

export const fetchDashboard = async () => {
  const { data } = await apiClient.get('/dashboard');
  return data;
};

export const fetchClasses = async () => {
  const { data } = await apiClient.get('/schedule');
  return data.classes || [];
};

export const requestSwap = async (payload) => {
  const { data } = await apiClient.post('/schedule/swap', payload);
  return data;
};

export const recordAttendance = async (payload) => {
  const { data } = await apiClient.post('/attendance', payload);
  return data;
};

export const createOnboarding = async (payload) => {
  const { data } = await apiClient.post('/onboarding', payload);
  return data;
};

export const fetchOnboarding = async () => {
  const { data } = await apiClient.get('/onboarding');
  return data.requests || [];
};

export const updateOnboardingStatus = async (id, status) => {
  const { data } = await apiClient.patch(`/onboarding/${id}`, { status });
  return data;
};

export const fetchAuditLogs = async () => {
  const { data } = await apiClient.get('/admin/logs');
  return data.logs || [];
};

export const fetchRoles = async () => {
  const { data } = await apiClient.get('/admin/roles');
  return data.roles || [];
};

export const updateRolePermissions = async (roleName, permissions) => {
  const { data } = await apiClient.put('/admin/roles/permissions', { roleName, permissions });
  return data;
};

export const fetchUsers = async () => {
  const { data } = await apiClient.get('/admin/users');
  return data.users || [];
};

export const assignRole = async (userId, newRole) => {
  const { data } = await apiClient.post('/admin/users/role', { userId, newRole });
  return data;
};

export const deleteUser = async (userId) => {
  const { data } = await apiClient.delete(`/admin/users/${userId}`);
  return data;
};

export const createApplication = async (payload) => {
  const { data } = await apiClient.post('/selection', payload);
  return data;
};

export const fetchApplications = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.phase) params.append('phase', filters.phase);
  if (filters.medium) params.append('medium', filters.medium);
  if (filters.district) params.append('district', filters.district);

  const { data } = await apiClient.get(`/selection?${params.toString()}`);
  return data.applications || [];
};

export const fetchApplication = async (id) => {
  const { data } = await apiClient.get(`/selection/${id}`);
  return data.application;
};

export const updateApplicationPhase = async (id, phase, notes) => {
  const { data } = await apiClient.patch(`/selection/${id}/phase`, { phase, notes });
  return data;
};

export const fetchPhase1 = async () => {
  const { data } = await apiClient.get('/selection/phase1');
  return data.applications || [];
};

export const fetchPhase2 = async () => {
  const { data } = await apiClient.get('/selection/phase2');
  return data.applications || [];
};

export const fetchPhase3 = async () => {
  const { data } = await apiClient.get('/selection/phase3');
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
  const { data } = await apiClient.get(`/selection/${endpoint}`);
  return data.applications || [];
};

export const fetchTutors = async () => {
  const { data } = await apiClient.get('/tutors');
  return data.tutors || [];
};

export const fetchTutorStudents = async (tutorId) => {
  const { data } = await apiClient.get(`/tutors/${tutorId}/students`);
  return data.students || [];
};

export const fetchTutorAttendanceHistory = async (tutorId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const { data } = await apiClient.get(`/tutors/${tutorId}/attendance-history?${query}`);
  return data;
};

export const fetchMyStudents = async () => {
  const { data } = await apiClient.get('/tutor/my-students');
  return data.students || [];
};

export const recordStudentAttendance = async (payload) => {
  const { data } = await apiClient.post('/tutor/attendance', payload);
  return data;
};

export const fetchProfile = async () => {
  const { data } = await apiClient.get('/user/profile');
  return data.user;
};

export const updateProfile = async (payload) => {
  const { data } = await apiClient.put('/user/profile', payload);
  return data;
};
