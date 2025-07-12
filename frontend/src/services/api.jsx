import axios from 'axios';

const api = axios.create({
    baseURL: '/api',  // Relative to proxy (will hit backend)
});

// Auth Functions
export const register = async (data) => api.post('/auth/register', data);
export const login = async (data) => api.post('/auth/login', data);

// Profile Functions
export const getProfile = async (token) => api.get('/profile', { headers: { Authorization: `Bearer ${token}` } });
export const updateProfile = async (data, token) => api.put('/profile/update', data, { headers: { Authorization: `Bearer ${token}` } });

// Skills Functions (expand as needed)
export const addSkill = async (data, token) => api.post('/skills/add', data, { headers: { Authorization: `Bearer ${token}` } });
// ... add more for remove, get, etc.

export default api;