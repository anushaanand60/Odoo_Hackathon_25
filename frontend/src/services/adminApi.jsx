import axios from 'axios';

const adminApiClient = axios.create({
    baseURL: '/api/admin',
});

// Dashboard
export const getDashboard = async (token) => adminApiClient.get('/dashboard', {
    headers: { Authorization: `Bearer ${token}` }
});

// User Management
export const getUsers = async (params, token) => adminApiClient.get('/users', {
    params,
    headers: { Authorization: `Bearer ${token}` }
});

export const getUserDetails = async (userId, token) => adminApiClient.get(`/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
});

export const banUser = async (userId, data, token) => adminApiClient.put(`/users/${userId}/ban`, data, {
    headers: { Authorization: `Bearer ${token}` }
});

export const unbanUser = async (userId, token) => adminApiClient.put(`/users/${userId}/unban`, {}, {
    headers: { Authorization: `Bearer ${token}` }
});

export const updateUserRole = async (userId, role, token) => adminApiClient.put(`/users/${userId}/role`, { role }, {
    headers: { Authorization: `Bearer ${token}` }
});

// Content Moderation
export const getFlaggedContent = async (params, token) => adminApiClient.get('/content/flagged', {
    params,
    headers: { Authorization: `Bearer ${token}` }
});

export const flagSkill = async (skillId, reason, token) => adminApiClient.put(`/content/skills/${skillId}/flag`, { reason }, {
    headers: { Authorization: `Bearer ${token}` }
});

export const approveSkill = async (skillId, token) => adminApiClient.put(`/content/skills/${skillId}/approve`, {}, {
    headers: { Authorization: `Bearer ${token}` }
});

export const deleteSkill = async (skillId, token) => adminApiClient.delete(`/content/skills/${skillId}`, {
    headers: { Authorization: `Bearer ${token}` }
});

// Reports Management
export const getReports = async (params, token) => adminApiClient.get('/reports', {
    params,
    headers: { Authorization: `Bearer ${token}` }
});

export const updateReport = async (reportId, data, token) => adminApiClient.put(`/reports/${reportId}`, data, {
    headers: { Authorization: `Bearer ${token}` }
});

// Swap Requests Monitoring
export const getSwapRequests = async (params, token) => adminApiClient.get('/swap-requests', {
    params,
    headers: { Authorization: `Bearer ${token}` }
});

// Platform Messages
export const getPlatformMessages = async (params, token) => adminApiClient.get('/messages', {
    params,
    headers: { Authorization: `Bearer ${token}` }
});

export const createPlatformMessage = async (data, token) => adminApiClient.post('/messages', data, {
    headers: { Authorization: `Bearer ${token}` }
});

export const updatePlatformMessage = async (messageId, data, token) => adminApiClient.put(`/messages/${messageId}`, data, {
    headers: { Authorization: `Bearer ${token}` }
});

export const deletePlatformMessage = async (messageId, token) => adminApiClient.delete(`/messages/${messageId}`, {
    headers: { Authorization: `Bearer ${token}` }
});

// Analytics & Reporting
export const getAnalytics = async (params, token) => adminApiClient.get('/analytics', {
    params,
    headers: { Authorization: `Bearer ${token}` }
});

export const exportData = async (type, format, token) => adminApiClient.get(`/export/${type}`, {
    params: { format },
    headers: { Authorization: `Bearer ${token}` },
    responseType: format === 'csv' ? 'blob' : 'json'
});

// Admin Logs
export const getAdminLogs = async (params, token) => adminApiClient.get('/logs', {
    params,
    headers: { Authorization: `Bearer ${token}` }
});

export const adminApi = {
    getDashboard,
    getUsers,
    getUserDetails,
    banUser,
    unbanUser,
    updateUserRole,
    getFlaggedContent,
    flagSkill,
    approveSkill,
    deleteSkill,
    getReports,
    updateReport,
    getSwapRequests,
    getPlatformMessages,
    createPlatformMessage,
    updatePlatformMessage,
    deletePlatformMessage,
    getAnalytics,
    exportData,
    getAdminLogs
};

export default adminApi; 