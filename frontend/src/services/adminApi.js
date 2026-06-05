import { apiClient ,api } from "./api";

export const auditLogs = async () => {
  const { data } = await apiClient.get('/admin/logs');
  return data;
};

export const getUsers = async () => {
  const { data } = await apiClient.get('/admin/users');
  return data;
};

export const deleteUser = async (userId) => {
  const { data } = await apiClient.delete(`/admin/users/${userId}`);
  return data;
};
