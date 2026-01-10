import { apiClient } from './api';

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
    return data;
};

export const fetchPhase2 = async () => {
    const { data } = await apiClient.get('/selection/phase2');
    return data;
};

export const fetchPhase3 = async () => {
    const { data } = await apiClient.get('/selection/phase3');
    return data;
};

export const fetchApplicationsByPhase = async (phase) => {
    const phaseMap = {
        'Phase1_Televerification': 'phase1',
        'Phase2_PanelInterview': 'phase2',
        'Phase3_FinalSelection': 'phase3',
    };
    const endpoint = phaseMap[phase] || `phase/${phase}`;
    const { data } = await apiClient.get(`/selection/${endpoint}`);
    return data;
};

export const updateStudent = async (studentId, payload) => {
    const { data } = await apiClient.put(`/selection/${studentId}/student`, payload);
    return data;
};