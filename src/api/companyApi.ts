import api from './Api';
import FormData from 'form-data';

export interface Company {
  id: number;
  name: string;
  email: string;
  logo?: string | null;
  countryId: number;
  directorId?: number;
  Country?: {
    id: number;
    name: string;
    code: string;
  };
  director?: {
    id: number;
    username: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyDto {
  name: string;
  email: string;
  logo?: File;
  countryId: number;
  directorId?: number;
}

export interface UpdateCompanyDto {
  name?: string;
  email?: string;
  logo?: File;
  countryId?: number;
  directorId?: number;
}

const companyApi = {
  getAll: async (): Promise<Company[]> => {
    try {
      const response = await api.get('/companies');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch companies');
    }
  },

  getById: async (id: number): Promise<Company> => {
    try {
      const response = await api.get(`/companies/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch company');
    }
  },

  getLogoUrl: (id: number): string => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    // Return the URL with the token as a query parameter
    return `${api.defaults.baseURL}/companies/${id}/logo?token=${token}`;
  },

  create: async (data: CreateCompanyDto): Promise<Company> => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('countryId', data.countryId.toString());
      if (data.directorId) {
        formData.append('directorId', data.directorId.toString());
      }
      if (data.logo) {
        formData.append('logo', data.logo);
      }

      const response = await api.post('/companies', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create company');
    }
  },

  update: async (id: number, data: UpdateCompanyDto): Promise<Company> => {
    try {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.email) formData.append('email', data.email);
      if (data.countryId) formData.append('countryId', data.countryId.toString());
      if (data.directorId) formData.append('directorId', data.directorId.toString());
      if (data.logo) formData.append('logo', data.logo);

      const response = await api.put(`/companies/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update company');
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/companies/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete company');
    }
  }
};

export default companyApi;