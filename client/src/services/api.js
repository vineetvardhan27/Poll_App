import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed in the future
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// Poll API methods
export const pollAPI = {
  // Create a new poll
  createPoll: async (pollData) => {
    try {
      const response = await api.post('/polls', pollData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get a specific poll by ID
  getPoll: async (pollId) => {
    try {
      const response = await api.get(`/polls/${pollId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get all polls
  getAllPolls: async () => {
    try {
      const response = await api.get('/polls');
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
