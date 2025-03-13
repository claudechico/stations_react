import React, { useState, useEffect } from 'react';
import { Check, X, ChevronLeft, ChevronRight, Search, Plus, Minus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../api/Api';

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  Permissions: Permission[];
  createdAt?: string;
  updatedAt?: string;
}

interface RolePermissionsProps {
  roles: Role[];
  permissions: Permission[];
  onRoleUpdated: () => void;
}

const ITEMS_PER_PAGE = 8;

const RolePermissions: React.FC<RolePermissionsProps> = ({ roles, permissions, onRoleUpdated }) => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    if (selectedRole) {
      const rolePermissionIds = selectedRole.Permissions.map(p => p.id);
      setSelectedPermissions(rolePermissionIds);
    }
  }, [selectedRole]);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleAddAllFiltered = () => {
    const filteredIds = filteredPermissions.map(p => p.id);
    setSelectedPermissions(prev => {
      const newPermissions = new Set([...prev, ...filteredIds]);
      return Array.from(newPermissions);
    });
    toast.success('Added all filtered permissions');
  };

  const handleRemoveAllFiltered = () => {
    const filteredIds = new Set(filteredPermissions.map(p => p.id));
    setSelectedPermissions(prev => prev.filter(id => !filteredIds.has(id)));
    toast.success('Removed all filtered permissions');
  };

  const handleSave = async () => {
    if (!selectedRole) return;

    try {
      await api.put(`/roles/${selectedRole.id}/permissions`, {
        permissions: selectedPermissions
      });
      toast.success(`Permissions updated for ${selectedRole.name} role`);
      onRoleUpdated();
    } catch (error) {
      console.error('Error updating role permissions:', error);
      toast.error('Failed to update permissions');
    }
  };

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const resource = permission.resource;
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Filter permissions based on search term
  const filteredPermissions = permissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.resource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredPermissions.length / ITEMS_PER_PAGE);
  const paginatedPermissions = filteredPermissions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
        {/* Roles Sidebar */}
        <div className="bg-gray-50 p-6 border-r border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Roles</h3>
          <div className="space-y-2">
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedRole?.id === role.id
                    ? 'bg-red-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="font-medium capitalize">{role.name}</div>
                <div className="text-sm opacity-75">
                  {role.description}
                </div>
                <div className="text-sm mt-1">
                  {role.Permissions?.length || 0} permissions
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Permissions Content */}
        <div className="col-span-3 p-6">
          {selectedRole ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {selectedRole.name} Role Permissions
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedRole.description}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Selected permissions: {selectedPermissions.length} of {permissions.length}
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>

              {/* Search and Bulk Actions */}
              <div className="mb-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search 
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                        searchFocused ? 'text-red-500' : 'text-gray-400'
                      }`} 
                      size={20} 
                    />
                    <input
                      type="text"
                      placeholder="Search permissions..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  {searchTerm && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddAllFiltered}
                        className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <Plus size={16} />
                        Add All
                      </button>
                      <button
                        onClick={handleRemoveAllFiltered}
                        className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Minus size={16} />
                        Remove All
                      </button>
                    </div>
                  )}
                </div>
                {searchTerm && (
                  <div className="text-sm text-gray-500">
                    Found {filteredPermissions.length} matching permissions
                  </div>
                )}
              </div>

              {/* Display Current Role Permissions */}
     

              {/* Available Permissions */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Available Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginatedPermissions.map(permission => {
                    const isSelected = selectedPermissions.includes(permission.id);
                    const isCurrentPermission = selectedRole.Permissions.some(p => p.id === permission.id);

                    return (
                      <div
                        key={permission.id}
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-green-50 border border-green-100'
                            : isCurrentPermission
                            ? 'bg-yellow-50 border border-yellow-100'
                            : 'bg-gray-50 border border-gray-100'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {permission.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {permission.description}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {permission.action} {permission.resource}
                          </div>
                        </div>
                        <button
                          onClick={() => handlePermissionToggle(permission.id)}
                          className={`p-2 rounded-full transition-colors ${
                            isSelected
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : isCurrentPermission
                              ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {isSelected ? (
                            <Check size={20} />
                          ) : (
                            <X size={20} />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px] text-gray-500">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Role Selected</h3>
                <p>Select a role from the sidebar to manage its permissions</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RolePermissions;