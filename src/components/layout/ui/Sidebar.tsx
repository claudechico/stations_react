import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Users,
  Settings,
  LogOut,
  Menu as MenuIcon,
  X,
  GaugeCircle
} from 'lucide-react';
import { logout, selectUser } from '../../../store/slices/authSlice';
import { cn } from '../../../lib/utils';

interface MenuItem {
  title: string;
  icon: React.ElementType;
  path: string;
  permission: string[];
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  console.log('the user permissions is',user?.permissions);

  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      permission: ['dashboard:view']
    },
    {
      title: 'Stations',
      icon: GaugeCircle,
      path: '/stations',
      permission: ['stations:manage', 'stations:read_stations']
    },
    {
      title: 'Companies',
      icon: Building2,
      path: '/companies',
      permission: ['companies:manage']
    },
    {
      title: 'Locations',
      icon: MapPin,
      path: '/locations',
      permission: ['locations:manage']
    },
    {
      title: 'Users',
      icon: Users,
      path: '/users',
      permission: ['users:manage']
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/settings',
      permission: ['settings:view']
    }
  ];

  const hasPermission = (permissions: string[]): boolean => {
    if (!user?.permissions) return false;
    return permissions.some(permission => {
      const [resource, action] = permission.split(':');
      return user.permissions.some(p => 
        (p.resource === resource && (p.action === action || p.action === 'manage')) ||
        (p.resource === 'admin' && p.action === 'manage')
      );
    });
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-red-800">
        <h1 className="text-2xl font-bold text-red-600">Station Admin</h1>
        <div className="mt-2">
          <p className="text-sm text-gray-300">{user?.username || 'Guest'}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role?.name || 'No Role'}</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => 
          hasPermission(item.permission) && (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                "hover:bg-red-900/50",
                location.pathname === item.path
                  ? "bg-red-700 text-white"
                  : "text-gray-300 hover:text-white"
              )}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.title}</span>
            </Link>
          )
        )}
         <div className="p-4 border-t border-red-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-red-900/50 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
      </nav>
      
     
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
      </button>

      {/* Mobile Overlay */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleMobileMenu}
      />

      {/* Sidebar Container */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 w-64 bg-black text-white flex flex-col z-50",
          "transform transition-transform duration-300 ease-in-out lg:transform-none",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
