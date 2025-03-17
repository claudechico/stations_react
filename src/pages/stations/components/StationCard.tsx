import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, ExternalLink, Check, X, Building2 } from 'lucide-react';
import { Station } from '../../../api/stationApi';
import userApi from '../../../api/userApi';
import companyApi from '../../../api/companyApi';
import { cn } from '../../../lib/utils';
import { toast } from 'react-hot-toast';
import stationApi from '../../../api/stationApi';

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
    managerId: station.managerId || null
  });
  const Region_loaded=station.City?.Region.name;
  console.log('the region loaded is',Region_loaded)
  const [loading, setLoading] = useState(false);
  const [availableManagers, setAvailableManagers] = useState<any[]>([]);
  const [managerSearch, setManagerSearch] = useState('');
  const [assignedManagers, setAssignedManagers] = useState<number[]>([]);

  // Enhanced filtering with debouncing and multiple search criteria
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [stationsData, setStationsData] = useState(null);
console.log('the stations is',station);
  // Add this new state near the other state declarations
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
      managerId: station.managerId || null
    });
    setIsEditing(false);
  };

  useEffect(() => {
    // Declare an async function inside useEffect to handle promises
    const fetchData = async () => {
      try {
        setLoading(true); // Start loading

        // Fetch the station data
        const fetchedStationsData = await stationApi.getAll();
        // Set the fetched station data to state
        setStationsData(fetchedStationsData as any);

        // Filter stations where managerId is present and map them to get an array of managerIds
        const managersAssigned = fetchedStationsData
          .filter((station: any) => station.manager?.id) // Keep stations with managerId
          .map((station: any) => station.manager?.id);  // Extract managerId

        // Set the filtered managerIds to state
        setAssignedManagers(managersAssigned as number[]);

      } catch (err) {
        // Handle errors if any
        console.error("Error fetching station data:", err);
      } finally {
        setLoading(false); // Set loading to false after the data has been fetched or if there's an error
      }
    };

    fetchData(); // Call the async function
  }, []); // Empty dependency array means this effect runs once on mount

  // Update the filtered managers computation to exclude already assigned managers
  const filteredManagers = availableManagers.filter(manager => {
    // First check if manager matches search criteria
    if (!managerSearch) {
      // If no search, only show unassigned managers and current station's manager
      return !assignedManagers.includes(manager.id) || manager.id === station.managerId;
    }
    
    const searchTerms = managerSearch.toLowerCase().split(' ');
    const searchableFields = [
      manager.username,
      manager.email,
      manager.firstName,
      manager.lastName,
      manager.role,
      manager.department
    ].filter(Boolean).map(field => field.toLowerCase());

    // Only include manager if they match search AND are either unassigned or current station's manager
    return searchTerms.every(term =>
      searchableFields.some(field => field.includes(term))
    ) && (!assignedManagers.includes(manager.id) || manager.id === station.managerId);
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManagerSearch(value);

    // Debounce the search to prevent too many re-renders
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    setSearchTimeout(setTimeout(() => {
      // Could add additional async search functionality here
    }, 300));
  };

  // Add this useEffect to handle clicking outside to close the search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isSearchOpen && !target.closest('form')) {
        setIsSearchOpen(false);
        setManagerSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  const handleManagerSelect = (manager: any) => {
    setEditData(prev => ({
      ...prev,
      managerId: manager.id
    }));
    setManagerSearch(`${manager.firstName} ${manager.lastName}`);
    setIsSearchOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 p-1">
      {/* Image section remains on top */}
      <div className="h-24 bg-gray-200 relative">
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
                  class="h-16 w-16 text-gray-400"
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
            <Building2 className="h-16 w-16 text-gray-400" />
          </div>
        )}

        {/* Company name badge if present */}
        {station.Company?.name && (
          <div className="absolute top-2 left-2 bg-red-600 text-white px-1 py-0.5 rounded text-xs">
            {station.Company.name}
          </div>
        )}
      </div>

      {/* Text content in a two-column grid */}
      <div className="p-1 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
        {/* Left Column */}
        <div>
          {isEditing ? (
            <div>
              <label className="font-medium">Branch:</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-1 py-0.5 border rounded focus:ring-2 focus:ring-red-500 text-xs"
                placeholder="Station Name"
              />
            </div>
          ) : (
            <div>
              <span className="font-medium">Branch:</span>
              <span className="ml-1">{station.name}</span>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div>
          {isEditing ? (
            <div>
              <label className="font-medium">Location:</label>
              <input
                type="text"
                value={editData.street}
                onChange={(e) => setEditData({ ...editData, street: e.target.value })}
                className="w-full px-1 py-0.5 border rounded focus:ring-2 focus:ring-red-500 text-xs"
                placeholder="Street Address"
              />
            </div>
          ) : (
            <div>
              <span className="font-medium">Location:</span>
              <span className="ml-1">{`${Region_loaded}`}</span>

            </div>
          )}
        </div>

        {/* Left Column */}
        <div>
          <span className="font-medium">TIN:</span>
          <span className="ml-1">{station.tin}</span>
        </div>

        {/* Right Column - View Stations Button */}
        <div className="col-span-2">
          <button
            onClick={() => window.open(station.domainUrl, '_blank')}
            className="mt-1 text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
          >
            View Stations
          </button>
        </div>

        {/* Manager Selection - Only visible in edit mode */}
        {isEditing && (
          <div className="col-span-2 mt-1">
            <label className="font-medium block mb-1">Manager:</label>
            <div className="relative">
              <input
                type="text"
                value={managerSearch}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full px-1 py-0.5 border rounded focus:ring-2 focus:ring-red-500 text-xs"
                placeholder="Search for manager..."
              />
              {isSearchOpen && filteredManagers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {filteredManagers.map((manager) => (
                    <div
                      key={manager.id}
                      className={cn(
                        'px-2 py-1 cursor-pointer hover:bg-gray-100 text-xs',
                        editData.managerId === manager.id && 'bg-gray-100'
                      )}
                      onClick={() => handleManagerSelect(manager)}
                    >
                      {`${manager.username}(${manager.email})`}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Show selected manager */}
            {editData.managerId && !isSearchOpen && (
              <div className="mt-1 text-xs text-gray-600">
                Selected: {availableManagers.find(m => m.id === editData.managerId)?.firstName} {availableManagers.find(m => m.id === editData.managerId)?.lastName}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="col-span-2 flex justify-end gap-1 mt-1">
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
                <Check size={14} />
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              {canUpdate && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Edit2 size={14} />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => onDelete(station.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationCard;
