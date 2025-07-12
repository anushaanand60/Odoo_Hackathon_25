import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,  // Relative to proxy (will hit backend)
});

// Auth Functions
export const register = async (data) => api.post('/auth/register', data);
export const login = async (data) => api.post('/auth/login', data);

// Profile Functions
export const getProfile = async (token) => api.get('/profile', { headers: { Authorization: `Bearer ${token}` } });
export const updateProfile = async (data, token) => api.put('/profile/update', data, { headers: { Authorization: `Bearer ${token}` } });

// Skills Functions
export const addSkill = async (data, token) => api.post('/skills/add', data, { headers: { Authorization: `Bearer ${token}` } });
export const removeSkill = async (skillId, token) => api.delete(`/skills/${skillId}`, { headers: { Authorization: `Bearer ${token}` } });
export const getSkills = async (token) => api.get('/skills', { headers: { Authorization: `Bearer ${token}` } });

// Search Functions
export const searchUsers = async (params, token) => api.get('/search/users', {
    params,
    headers: { Authorization: `Bearer ${token}` }
});
export const getUserById = async (userId, token) => api.get(`/search/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
});
export const getAllSkills = async (token) => api.get('/search/skills', {
    headers: { Authorization: `Bearer ${token}` }
});
export const getTrendingSkills = async (token) => api.get('/search/trending-skills', {
    headers: { Authorization: `Bearer ${token}` }
});

export const getTopPoints = async (token) => api.get('/search/top-points', { headers: { Authorization: `Bearer ${token}` } });

export const getTopRatings = async (token) => api.get('/search/top-ratings', { headers: { Authorization: `Bearer ${token}` } });

// Swap Request Functions
export const createSwapRequest = async (data, token) => api.post('/requests/create', data, {
    headers: { Authorization: `Bearer ${token}` }
});
export const getMyRequests = async (params, token) => api.get('/requests/my-requests', {
    params,
    headers: { Authorization: `Bearer ${token}` }
});
export const getRequestById = async (requestId, token) => api.get(`/requests/${requestId}`, {
    headers: { Authorization: `Bearer ${token}` }
});
export const respondToRequest = async (requestId, status, token) => api.put(`/requests/${requestId}/respond`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
);
export const cancelRequest = async (requestId, token) => api.put(`/requests/${requestId}/cancel`, {}, {
    headers: { Authorization: `Bearer ${token}` }
});
export const deleteRequest = async (requestId, token) => api.delete(`/requests/${requestId}`, {
    headers: { Authorization: `Bearer ${token}` }
});
export const getRequestStats = async (token) => api.get('/requests/stats/summary', {
    headers: { Authorization: `Bearer ${token}` }
});

// Rating Functions
export const submitRating = async (data, token) => api.post('/ratings/submit', data, {
    headers: { Authorization: `Bearer ${token}` }
});
export const getUserRatings = async (userId, params, token) => api.get(`/ratings/user/${userId}`, {
    params,
    headers: { Authorization: `Bearer ${token}` }
});
export const getSwapRatings = async (swapRequestId, token) => api.get(`/ratings/swap/${swapRequestId}`, {
    headers: { Authorization: `Bearer ${token}` }
});
export const updateRating = async (ratingId, data, token) => api.put(`/ratings/${ratingId}`, data, {
    headers: { Authorization: `Bearer ${token}` }
});
export const deleteRating = async (ratingId, token) => api.delete(`/ratings/${ratingId}`, {
    headers: { Authorization: `Bearer ${token}` }
});
export const getRatingStats = async (userId, token) => api.get(`/ratings/stats/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
});

export const addProject = async (data, token) => api.post('/projects/add', data, { headers: { Authorization: `Bearer ${token}` } });
export const removeProject = async (projectId, token) => api.delete(`/projects/${projectId}`, { headers: { Authorization: `Bearer ${token}` } });
export const getProjects = async (token) => api.get('/projects', { headers: { Authorization: `Bearer ${token}` } });

export default api;