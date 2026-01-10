import { apiClient } from "./api";

export const fetchProfile = async () => {
  const { data } = await apiClient.get('/user/profile');
  return data.user;
};

export const updateProfile = async (payload) => {
  const { data } = await apiClient.put('/user/profile', payload);
  return data;
};