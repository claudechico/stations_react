// Header.tsx
import React from 'react';
import { Bell, User as UserIcon } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../store/slices/authSlice';

const Header = () => {
  const user = useSelector(selectUser);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-4 fixed top-0 right-0 left-0 lg:left-64 z-30">
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg relative">
          <Bell size={24} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <UserIcon size={20} />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{user?.username}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role?.name}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
