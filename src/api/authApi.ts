// src/api/authApi.ts

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Function to handle login API request
export const loginUser = async (credentials: { username: string; password: string }) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};
