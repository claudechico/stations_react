import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  clearAuth: () => set({ user: null, token: null }),
  hasPermission: (permission) => {
    const { user } = get();
    if (!user) return false;
    
    if (user.role === 'admin') return true;
    
    const rolePermissions = {
      director: [
        'view:dashboard',
        'manage:stations',
        'manage:company',
        'view:company-stations',
      ],
      manager: [
        'view:dashboard',
        'view:station',
      ],
    };
    
    return rolePermissions[user.role]?.includes(permission) || false;
  },
}));