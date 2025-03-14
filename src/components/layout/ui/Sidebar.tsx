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
  permission: string[]; // Array of permission strings in the form "resource:action"
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  console.log('the user permissions is', user?.permissions);

  // Define your menu items and the permissions they require.
  // For "Stations", we only check "stations:read" and "stations:manage"
  // because your user object has resource="stations" and action="read".
  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      permission: ['dashboard:view']
    },
    {
      title: 'Users',
      icon: Users,
      path: '/users',
      permission: ['users:manage']
    },
    {
      title: 'Locations',
      icon: MapPin,
      path: '/locations',
      permission: ['locations:manage']
    },
    {
      title: 'Companies',
      icon: Building2,
      path: '/companies',
      permission: ['companies:manage']
    },
    {
      title: 'Stations',
      icon: GaugeCircle,
      path: '/stations',
      permission: ['stations:manage', 'stations:read']
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/settings',
      permission: ['settings:view']
    }
  ];

  /**
   * Checks if the current user has at least one of the required permissions.
   * Each permission string is "resource:action", e.g. "stations:read".
   * Your user's permission object is { resource: string, action: string }.
   */
  const hasPermission = (permissions: string[]): boolean => {
    if (!user?.permissions) return false;

    return permissions.some((required) => {
      const [requiredResource, requiredAction] = required.split(':');

      // Check if user.permissions has at least one entry
      // with the same resource and either the same action or 'manage'.
      return user.permissions.some((p: any) => {
        // p is { id, name, resource, action }
        return (
          p.resource === requiredResource &&
          (p.action === requiredAction || p.action === 'manage')
        );
      });
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
      {/* Header / User Info */}
      <div className="p-6 border-b border-red-800">
        <h1 className="text-2xl font-bold text-red-600">Station Admin</h1>
        <div className="mt-2">
          <p className="text-sm text-gray-300">{user?.username || 'Guest'}</p>
          <p className="text-xs text-gray-400 capitalize">
            {user?.role?.name || 'No Role'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) =>
          hasPermission(item.permission) && (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                'hover:bg-red-900/50',
                location.pathname === item.path
                  ? 'bg-red-700 text-white'
                  : 'text-gray-300 hover:text-white'
              )}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.title}</span>
            </Link>
          )
        )}

        {/* Logout Button */}
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
          'lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300',
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={toggleMobileMenu}
      />

      {/* Sidebar Container */}
      <div
        className={cn(
          'fixed lg:sticky lg:top-0 inset-y-0 left-0 w-64 bg-black text-white flex flex-col z-50',
          'transform transition-transform duration-300 ease-in-out lg:transform-none h-screen overflow-y-auto',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
