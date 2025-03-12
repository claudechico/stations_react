import api from './Api';

export interface Station {
  id: number;
  name: string;
  tin: string;
  domainUrl: string;
  imageUrl?: string;
  companyId: number;
  managerId?: number;
  cityId: number;
  street: string;
  company?: {
    id: number;
    name: string;
    logo?: string;
  };
  manager?: {
    id: number;
    username: string;
    email: string;
  };
  city?: {
    id: number;
    name: string;
    region: {
      id: number;
      name: string;
      country: {
        id: number;
        name: string;
        code: string;
      };
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateStationDto {
  name: string;
  tin: string;
  domainUrl: string;
  companyId: number;
  managerId?: number;
  cityId: number;
  street: string;
}

export interface UpdateStationDto {
  name?: string;
  tin?: string;
  domainUrl?: string;
  companyId?: number;
  managerId?: number;
  cityId?: number;
  street?: string;
}

const stationApi = {
  getAll: async (): Promise<Station[]> => {
    try {
      const response = await api.get('/stations');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch stations');
    }
  },

  getByCompany: async (companyId: number): Promise<Station[]> => {
    try {
      const response = await api.get(`/stations/company/${companyId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch company stations');
    }
  },

  getById: async (id: number): Promise<Station> => {
    try {
      const response = await api.get(`/stations/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch station');
    }
  },

  create: async (data: CreateStationDto): Promise<Station> => {
    try {
      const response = await api.post('/stations', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create station');
    }
  },

  update: async (id: number, data: UpdateStationDto): Promise<Station> => {
    try {
      const response = await api.put(`/stations/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update station');
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/stations/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete station');
    }
  }
};

export default stationApi;