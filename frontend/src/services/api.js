import axios from "axios";
const getBaseUrl = () => {
  let url = import.meta.env.VITE_BACKEND_API ;
  //  let url = 'http://localhost:4000';
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

export const forgotPassword = async (payload) => {
  const { data } = await apiClient.post('/auth/forgot-password', payload);
  return data;
};

export const fetchClasses = async () => {
  const { data } = await apiClient.get('/schedule');
  return data.classes || [];
};

export const createSchedule = async (payload) => {
  const { data } = await apiClient.post('/schedule', payload);
  return data;
};

export const requestSwap = async (payload) => {
  const { data } = await apiClient.post('/schedule/swap', payload);
  return data;
};

export const recordAttendance = async (payload) => {
  const { data } = await apiClient.post('/attendance', payload);
  return data;
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
