import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, ExternalLink, Check, X, Building2 } from 'lucide-react';
import { Station } from '../../../api/stationApi';
import userApi from '../../../api/userApi';
import companyApi from '../../../api/companyApi';
import { cn } from '../../../lib/utils';
import { toast } from 'react-hot-toast';

interface StationCardProps {
  station: Station;
  canUpdate: boolean;
  canDelete: boolean;
  onUpdate: (id: number, data: Partial<Station>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const StationCard: React.FC<StationCardProps> = ({
  station,
  canUpdate,
  canDelete,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: station.name,
    tin: station.tin,
    domainUrl: station.domainUrl,
    street: station.street,
    managerId: station.managerId
  });
  const [loading, setLoading] = useState(false);
  const [availableManagers, setAvailableManagers] = useState<any[]>([]);
  console.log('the station is', station)

  // Safely get the company logo URL if the station has a Company with an ID
  const logoUrl = station.Company?.id ? companyApi.getLogoUrl(station.Company.id) : '';
  console.log('logo url',logoUrl);

  useEffect(() => {
    if (isEditing) {
      loadAvailableManagers();
    }
  }, [isEditing]);

  const loadAvailableManagers = async () => {
    try {
      const managers = await userApi.getManagers();
      // Include current manager in the list if not already present
      if (
        station.manager &&
        !managers.find((m: any) => m.id === station.manager?.id)
      ) {
        managers.push(station.manager);
      }
      setAvailableManagers(managers);
    } catch (error) {
      console.error('Error loading managers:', error);
      toast.error('Failed to load available managers');
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await onUpdate(station.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating station:', error);
      toast.error('Failed to update station');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: station.name,
      tin: station.tin,
      domainUrl: station.domainUrl,
      street: station.street,
      managerId: station.managerId
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      {/* Image section remains on top */}
      <div className="h-48 bg-gray-200 relative">
        {station.Company?.id ? (
          <img
            src={logoUrl}
            alt={station.Company?.name || 'Company Logo'}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if logo fails to load
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '';
              target.classList.add('bg-gray-100');
              const icon = document.createElement('div');
              icon.className = 'h-full w-full flex items-center justify-center';
              icon.innerHTML = `
                <svg
                  class="h-20 w-20 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                  <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                  <path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
                  <path d="M10 6h4" />
                  <path d="M10 10h4" />
                  <path d="M10 14h4" />
                  <path d="M10 18h4" />
                </svg>
              `;
              target.parentNode?.replaceChild(icon, target);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Building2 className="h-20 w-20 text-gray-400" />
          </div>
        )}

        {/* Company name badge if present */}
        {station.Company?.name && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-2 py-1 rounded text-sm">
            {station.Company.name}
          </div>
        )}
      </div>

      {/* Text content in a two-column grid */}
      <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
        {/* Row 1: Station name & TIN + edit/delete icons (spans both columns) */}
        <div className="col-span-2 flex justify-between items-start mb-2">
          <div>
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-red-500 text-sm font-semibold"
                placeholder="Station Name"
              />
            ) : (
              <h3 className="text-sm font-semibold text-gray-900">{station.name}</h3>
            )}
            <div className="mt-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.tin}
                  onChange={(e) => setEditData({ ...editData, tin: e.target.value })}
                  className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-red-500 text-xs"
                  placeholder="TIN Number"
                />
              ) : (
                <p className="text-xs text-gray-500">TIN: {station.tin}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={cn(
                    'text-green-600 hover:text-green-800 transition-colors',
                    loading && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                {canUpdate && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => onDelete(station.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Row 2: Location (left), Manager (right) */}
        <div>
          <span className="font-medium">Location:</span>
          {isEditing ? (
            <input
              type="text"
              value={editData.street}
              onChange={(e) => setEditData({ ...editData, street: e.target.value })}
              className="w-full mt-1 px-2 py-1 border rounded focus:ring-2 focus:ring-red-500 text-xs"
              placeholder="Street Address"
            />
          ) : (
            <p className="mt-1 text-xs">
              {station.street}
              {station.city?.name && (
                <>
                  <br />
                  {station.city.name}
                  {station.city.region?.name && `, ${station.city.region.name}`}
                  {station.city.region?.country?.name && `, ${station.city.region.country.name}`}
                </>
              )}
            </p>
          )}
        </div>

        <div>
          <span className="font-medium">Manager:</span>
          {isEditing ? (
            <select
              value={editData.managerId || ''}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  managerId: e.target.value ? Number(e.target.value) : undefined
                })
              }
              className="w-full mt-1 px-2 py-1 border rounded focus:ring-2 focus:ring-red-500 text-xs"
            >
              <option value="">No Manager</option>
              {availableManagers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.username} ({manager.email})
                </option>
              ))}
            </select>
          ) : station.manager ? (
            <div className="flex flex-col mt-1">
              <span className="text-gray-900 font-medium text-xs">{station.manager.username}</span>
              <span className="text-gray-500 text-xs">{station.manager.email}</span>
            </div>
          ) : (
            <span className="text-gray-500 italic text-xs">No manager assigned</span>
          )}
        </div>

        {/* Row 3: Domain (spans both columns) */}
        <div className="col-span-2">
          <span className="font-medium">Domain:</span>
          {isEditing ? (
            <input
              type="url"
              value={editData.domainUrl}
              onChange={(e) => setEditData({ ...editData, domainUrl: e.target.value })}
              className="w-full mt-1 px-2 py-1 border rounded focus:ring-2 focus:ring-red-500 text-xs"
              placeholder="Domain URL"
            />
          ) : station.domainUrl ? (
            <a
              href={station.domainUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1 text-xs"
            >
              Visit Site <ExternalLink size={12} />
            </a>
          ) : (
            <span className="text-gray-500 italic text-xs mt-1 block">
              No domain URL provided
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationCard;
