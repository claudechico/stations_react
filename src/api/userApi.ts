import api from './Api';

export interface User {
  companies: never[];
  id: number;
  username: string;
  email: string;
  Role?: {
    id: number;
    name: string;
    description?: string;
  };
  permissions?: Array<{
    id: number;
    name: string;
    resource: string;
    action: string;
    description?: string;
  }>;
}

const userApi = {
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  getDirectors: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users');
      console.log('Fetched users:', response.data); // Log all users (includes company data)
  
      // Filter users with the director role while ensuring they have companies
      const directors = response.data
        .filter((user: User) => user.Role?.name.toLowerCase() === 'director')
        .map((director: User) => ({
          ...director,
          directedCompanies: director.companies || [], // Ensure company array exists
        }));
  
      console.log('Filtered directors with companies:', directors); // Log directors with company info
  
      return directors;
    } catch (error: any) {
      console.error('Error fetching directors:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch directors');
    }
  },
  
  
  getManagers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users');
      console.log('Fetched users:', response.data); // Log all users
  
      // Filter users with director role
      const managers = response.data.filter((user: User) => 
        user.Role?.name.toLowerCase() === 'manager'
      );
  
      console.log('Filtered directors:', managers); // Log the filtered directors
  
      return managers;
    } catch (error: any) {
      console.error('Error fetching directors:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch directors');
    }
  },
  

  getUserById: async (id: number): Promise<User> => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  },

  createUser: async (data: {
    username: string;
    email: string;
    password: string;
    roleId: number;
    phoneNumber?: string;
  }): Promise<User> => {
    try {
      const response = await api.post('/users', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  },

  updateUser: async (
    id: number,
    data: {
      username?: string;
      email?: string;
      password?: string;
      roleId?: number;
      phoneNumber?: string;
    }
  ): Promise<User> => {
    try {
      const response = await api.put(`/users/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  },

  deleteUser: async (id: number): Promise<void> => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  },

  getUserPermissions: async (id: number): Promise<User['permissions']> => {
    try {
      const response = await api.get(`/users/${id}/permissions`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user permissions');
    }
  },
  getLoggedInDirector: async (): Promise<User | null> => {
    try {
      const response = await api.get('/users/me'); // Assuming "/users/me" fetches the logged-in user
      const user: User = response.data;
  
      if (user.Role?.name.toLowerCase() !== 'director') {
        console.warn('User is not a director');
        return null;
      }
  
      return {
        ...user,
        directedCompanies: user.companies || [], // Ensure companies array exists
      };
    } catch (error: any) {
      console.error('Error fetching logged-in director:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch director details');
    }
  },
  

  updateUserPermissions: async (
    id: number,
    permissions: number[]
  ): Promise<User['permissions']> => {
    try {
      const response = await api.put(`/users/${id}/permissions`, { permissions });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user permissions');
    }
  }
};

export default userApi;