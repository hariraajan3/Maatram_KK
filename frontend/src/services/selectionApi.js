import { apiClient , api } from './api';

export const createApplication = async (payload) => {
    const { data } = await apiClient.post('/selection', payload);
    return data;
};

export const fetchApplicationsByPhase = async (phase) => {
    const endpoint = phase ;
    const { data } = await apiClient.get(`/selection/phases/${endpoint}`);
    return data;
};

export const fetchRejectedApplications = async () => {
    const { data } = await apiClient.get('/selection/rejected');
    return data;
};

export const studentRejected = async (applicationId, notes) => {
    const { data } = await apiClient.patch(`/selection/${applicationId}/reject`, { notes });
    return data;
};

export const phaseAdvanced = async (applicationId, phase, notes) => {
    const { data } = await apiClient.patch(`/selection/${applicationId}/advance`, { phase, notes });
    return data;
};

export const updateStudent = async (studentId, payload) => {
    const { data } = await apiClient.put(`/selection/${studentId}/student`, payload);
    return data;
};

export const selectionStats = async () => {
    const { data } = await apiClient.get('/selection/stats');
    return data;
};