import React, { useState } from 'react';
import { Check, X, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../api/Api';

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description: string;
  UserPermission?: {
    override: boolean;
  };
}

interface User {
  id: string;
  username: string;
  email: string;
  permissions: Permission[];
}

interface UserPermissionsProps {
  users: User[];
  permissions: Permission[];
  onPermissionUpdated: () => void;
}

const UserPermissions: React.FC<UserPermissionsProps> = ({ users, permissions, onPermissionUpdated }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSelectedPermissions(
      user.permissions
        .filter(p => p.UserPermission?.override)
        .map(p => p.id)
    );
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    try {
      await api.put(`/users/${selectedUser.id}/permissions`, {
        permissions: selectedPermissions
      });
      toast.success(`Permissions updated for ${selectedUser.username}`);
      onPermissionUpdated();
    } catch (error) {
      console.error('Error updating user permissions:', error);
      toast.error('Failed to update permissions');
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const resource = permission.resource;
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
        {/* Users Sidebar */}
        <div className="bg-gray-50 p-6 border-r border-gray-200">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedUser?.id === user.id
                      ? 'bg-red-600 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{user.username}</div>
                  <div className="text-sm opacity-75">{user.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions Content */}
        <div className="col-span-3 p-6">
          {selectedUser ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Permissions for {selectedUser.username}
                </h3>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([resource, perms]) => (
                  <div key={resource} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 capitalize">
                      {resource}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {perms.map(permission => (
                        <div
                          key={permission.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-gray-900">{permission.name}</div>
                            <div className="text-sm text-gray-500">
                              {permission.description}
                            </div>
                          </div>
                          <button
                            onClick={() => handlePermissionToggle(permission.id)}
                            className={`p-2 rounded-full transition-colors ${
                              selectedPermissions.includes(permission.id)
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {selectedPermissions.includes(permission.id) ? (
                              <Check size={20} />
                            ) : (
                              <X size={20} />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a user to manage their permissions
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPermissions;