import { apiClient } from "./api";

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