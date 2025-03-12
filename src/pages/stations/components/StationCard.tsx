import React, { useState } from 'react';
import { Edit2, Trash2, ExternalLink, Check, X, Building2 } from 'lucide-react';
import { Station } from '../../../api/stationApi';
import { cn } from '../../../lib/utils';

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
    street: station.street
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await onUpdate(station.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating station:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: station.name,
      tin: station.tin,
      domainUrl: station.domainUrl,
      street: station.street
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <div className="h-48 bg-gray-200 relative">
        {station.imageUrl ? (
          <img
            src={station.imageUrl}
            alt={station.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Building2 className="h-20 w-20 text-gray-400" />
          </div>
        )}
        <div className="absolute top-4 left-4 bg-red-600 text-white px-2 py-1 rounded text-sm">
          {station.company?.name}
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-red-500 text-lg font-semibold"
                placeholder="Station Name"
              />
            ) : (
              <h3 className="text-lg font-semibold text-gray-900">{station.name}</h3>
            )}
            <div className="mt-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.tin}
                  onChange={(e) => setEditData({ ...editData, tin: e.target.value })}
                  className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-red-500 text-sm"
                  placeholder="TIN Number"
                />
              ) : (
                <p className="text-sm text-gray-500">TIN: {station.tin}</p>
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
                    "text-green-600 hover:text-green-800 transition-colors",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <>
                {canUpdate && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => onDelete(station.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div>
            <span className="font-medium">Location:</span>
            {isEditing ? (
              <input
                type="text"
                value={editData.street}
                onChange={(e) => setEditData({ ...editData, street: e.target.value })}
                className="w-full mt-1 px-2 py-1 border rounded focus:ring-2 focus:ring-red-500"
                placeholder="Street Address"
              />
            ) : (
              <p>
                {station.street}
                {station.city && station.city.region && station.city.region.country && (
                  <>
                    <br />
                    {station.city.name}, {station.city.region.name}, {station.city.region.country.name}
                  </>
                )}
              </p>
            )}
          </div>
          <div>
            <span className="font-medium">Manager:</span>
            <p>{station.manager ? station.manager.name : 'No manager assigned'}</p>
          </div>
          <div>
            <span className="font-medium">Domain:</span>
            {isEditing ? (
              <input
                type="url"
                value={editData.domainUrl}
                onChange={(e) => setEditData({ ...editData, domainUrl: e.target.value })}
                className="w-full mt-1 px-2 py-1 border rounded focus:ring-2 focus:ring-red-500"
                placeholder="Domain URL"
              />
            ) : (
              <a
                href={station.domainUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
              >
                Visit Site <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationCard;
