import axios from 'axios';
import store from '../store/slices/store';

const API_URL = 'http://localhost:5000/location/location/';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Types
export interface Country {
  id: number;
  name: string;
  code: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Region {
  id: number;
  name: string;
  countryId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface City {
  id: number;
  name: string;
  regionId: number;
  createdAt?: string;
  updatedAt?: string;
}

// API Functions
const api = {
  // Countries
  getAllCountries: async (): Promise<Country[]> => {
    try {
      const response = await axiosInstance.get('/countries');
      console.log("the response is",response);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching countries:', error.response?.data || error.message);
      throw error;
    }
  },

  createCountry: async (data: Omit<Country, 'id' | 'createdAt' | 'updatedAt'>): Promise<Country> => {
    try {
      const response = await axiosInstance.post('/countries', data);

      return response.data;
    } catch (error: any) {
      console.error('Error creating country:', error.response?.data || error.message);
      throw error;
    }
  },

  updateCountry: async (id: number, data: Partial<Omit<Country, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Country> => {
    try {
      const response = await axiosInstance.put(`/countries/${id}`, data);
      // console.log('the response is',response);
      return response.data;
      
    } catch (error: any) {
      console.error('Error updating country:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteCountry: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/countries/${id}`);
    } catch (error: any) {
      console.error('Error deleting country:', error.response?.data || error.message);
      throw error;
    }
  },

  // Regions
  getAllRegions: async (): Promise<Region[]> => {
    try {
      const response = await axiosInstance.get('/regions');
      console.log('the region is',response)
      return response.data;
    } catch (error: any) {
      console.error('Error fetching regions:', error.response?.data || error.message);
      throw error;
    }
  },

  createRegion: async (data: Omit<Region, 'id' | 'createdAt' | 'updatedAt'>): Promise<Region> => {
    try {
      const response = await axiosInstance.post('/regions', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating region:', error.response?.data || error.message);
      throw error;
    }
  },

  updateRegion: async (id: number, data: Partial<Omit<Region, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Region> => {
    try {
      const response = await axiosInstance.put(`/regions/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating region:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteRegion: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/regions/${id}`);
    } catch (error: any) {
      console.error('Error deleting region:', error.response?.data || error.message);
      throw error;
    }
  },

  // Cities
  getAllCities: async (): Promise<City[]> => {
    try {
      const response = await axiosInstance.get('/cities');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching cities:', error.response?.data || error.message);
      throw error;
    }
  },

  createCity: async (data: Omit<City, 'id' | 'createdAt' | 'updatedAt'>): Promise<City> => {
    try {
      const response = await axiosInstance.post('/cities', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating city:', error.response?.data || error.message);
      throw error;
    }
  },

  updateCity: async (id: number, data: Partial<Omit<City, 'id' | 'createdAt' | 'updatedAt'>>): Promise<City> => {
    try {
      const response = await axiosInstance.put(`/cities/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating city:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteCity: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/cities/${id}`);
    } catch (error: any) {
      console.error('Error deleting city:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default api;