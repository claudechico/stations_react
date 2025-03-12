// src/api/axiosInstance.ts
import axios from 'axios';
import store from '../store/slices/store';  // Make sure this path is correct

const API_URL = 'http://localhost:5000/api/auth';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to include token from Redux state or localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token || localStorage.getItem('token'); // Get token from Redux state or localStorage

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
