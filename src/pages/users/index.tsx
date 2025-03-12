import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/layout/ui/tabs';
import UsersList from './components/UsersList';
import RolePermissions from './components/RolePermissions';
import UserPermissions from './components/UserPermissions';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import api from '../../api/Api';

const UsersPage = () => {
  const currentUser = useSelector(selectUser);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data...');

      // Fetch roles first to ensure they're available
      const rolesResponse = await api.get('/roles');
      console.log('Roles response:', rolesResponse.data);
      setRoles(rolesResponse.data || []);

      // Then fetch users and permissions
      const [usersResponse, permissionsResponse] = await Promise.all([
        api.get('/users'),
        api.get('/permissions')
      ]);

      console.log('Users response:', usersResponse.data);
      console.log('Permissions response:', permissionsResponse.data);

      setUsers(usersResponse.data || []);
      setPermissions(permissionsResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Check if user has the required permissions
  const hasAccess = currentUser?.permissions?.some(permission => 
    (permission.resource === 'users' && 
    (permission.action === 'manage' || permission.action === 'read')) ||
    (permission.resource === 'admin' && permission.action === 'manage')
  );

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">
          Manage users, roles, and permissions in your system
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Role Permissions</TabsTrigger>
          <TabsTrigger value="permissions">User Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersList 
            users={users}
            roles={roles}
            onUserUpdated={loadData}
          />
        </TabsContent>

        <TabsContent value="roles">
          <RolePermissions
            roles={roles}
            permissions={permissions}
            onRoleUpdated={loadData}
          />
        </TabsContent>

        <TabsContent value="permissions">
          <UserPermissions
            users={users}
            permissions={permissions}
            onPermissionUpdated={loadData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsersPage;