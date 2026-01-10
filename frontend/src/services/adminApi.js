import { apiClient } from "./api";

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