import api from './axios';

// AI calls can be slower than normal API calls
export const generateSummary = (payload) => api.post('/ai/summary', payload, { timeout: 30000 });
