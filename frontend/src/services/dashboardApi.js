import {apiClient} from "./api";

export const fetchDashboard = async () => {
  const { data } = await apiClient.get('/dashboard');
  return data;
};

export const fetchDashboardStudents = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const { data } = await apiClient.get(`/dashboard/students?${query}`);
  return data;
};