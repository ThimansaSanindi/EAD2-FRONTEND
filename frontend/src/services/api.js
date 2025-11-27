// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/users';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log('Making API request to:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.error || error.response.data.message || 'Request failed');
    } else if (error.request) {
      // Request made but no response received
      throw new Error('Network error: Unable to connect to server');
    } else {
      // Something else happened
      throw new Error('Request configuration error');
    }
  }
);

// API methods
export const userAPI = {
  login: (credentials) => apiClient.post('/login', credentials),
  register: (userData) => apiClient.post('/register', userData),
  getUserById: (userId) => apiClient.get(`/${userId}`),
  updateUser: (userId, userData) => apiClient.put(`/${userId}`, userData),
};

export const loginUser = userAPI.login;
export const registerUser = userAPI.register;