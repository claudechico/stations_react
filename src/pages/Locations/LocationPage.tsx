import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Check } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import api, { Country, Region, City } from '../../api/locationApi';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';

interface LocationData {
  id: number;
  name: string;
  code?: string;
  countryId?: number;
  regionId?: number;
}

const LocationPage = () => {
  const user = useSelector(selectUser);
  const [searchTerm, setSearchTerm] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [editingItem, setEditingItem] = useState<{
    type: 'country' | 'region' | 'city';
    id: number;
    data: LocationData;
  } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingType, setAddingType] = useState<'country' | 'region' | 'city' | null>(null);
  const [addForm, setAddForm] = useState<LocationData>({
    id: 0,
    name: '',
    code: '',
    countryId: undefined,
    regionId: undefined,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [countriesData, regionsData, citiesData] = await Promise.all([
        api.getAllCountries(),
        api.getAllRegions(),
        api.getAllCities(),
      ]);
      setCountries(countriesData);
      setRegions(regionsData);
      setCities(citiesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
  };

  const handleAdd = async () => {
    try {
      if (!addForm.name.trim()) {
        toast.error('Name is required');
        return;
      }

      switch (addingType) {
        case 'country':
          if (!addForm.code?.trim()) {
            toast.error('Country code is required');
            return;
          }
          await api.createCountry({ name: addForm.name, code: addForm.code });
          break;
        case 'region':
          if (!addForm.countryId) {
            toast.error('Please select a country');
            return;
          }
          await api.createRegion({ name: addForm.name, countryId: addForm.countryId });
          break;
        case 'city':
          if (!addForm.regionId) {
            toast.error('Please select a region');
            return;
          }
          await api.createCity({ name: addForm.name, regionId: addForm.regionId });
          break;
      }

      toast.success('Added successfully');
      setShowAddModal(false);
      setAddingType(null);
      setAddForm({ id: 0, name: '', code: '', countryId: undefined, regionId: undefined });
      await loadData();
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    }
  };

  const handleEdit = (type: 'country' | 'region' | 'city', item: LocationData) => {
    setEditingItem({ type, id: item.id, data: { ...item } });
  };

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      const { type, id, data } = editingItem;

      if (!data.name.trim()) {
        toast.error('Name is required');
        return;
      }

      switch (type) {
        case 'country':
          if (!data.code?.trim()) {
            toast.error('Country code is required');
            return;
          }
          await api.updateCountry(id, { name: data.name, code: data.code });
          break;
        case 'region':
          if (!data.countryId) {
            toast.error('Country is required');
            return;
          }
          await api.updateRegion(id, { name: data.name, countryId: data.countryId });
          break;
        case 'city':
          if (!data.regionId) {
            toast.error('Region is required');
            return;
          }
          await api.updateCity(id, { name: data.name, regionId: data.regionId });
          break;
      }

      toast.success('Updated successfully');
      setEditingItem(null);
      await loadData();
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  const handleDelete = async (type: 'country' | 'region' | 'city', id: number) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to delete this item?');
      if (!confirmDelete) return;

      switch (type) {
        case 'country':
          await api.deleteCountry(id);
          break;
        case 'region':
          await api.deleteRegion(id);
          break;
        case 'city':
          await api.deleteCity(id);
          break;
      }

      toast.success('Deleted successfully');
      await loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const getCountryName = (id: number) => {
    const country = countries.find(c => c.id === id);
    return country ? country.name : 'Unknown';
  };

  const getRegionName = (id: number) => {
    const region = regions.find(r => r.id === id);
    return region ? region.name : 'Unknown';
  };

  const renderTable = (type: 'country' | 'region' | 'city', data: LocationData[]) => {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-black text-white">
          <h2 className="text-xl font-semibold capitalize">{type}s</h2>
          <button
            onClick={() => {
              setAddingType(type);
              setShowAddModal(true);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add {type}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                {type === 'country' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                )}
                {type === 'region' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                )}
                {type === 'city' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Region
                  </th>
                )}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingItem?.id === item.id ? (
                      <input
                        type="text"
                        value={editingItem.data.name}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, name: e.target.value },
                          })
                        }
                        className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{item.name}</div>
                    )}
                  </td>
                  {type === 'country' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingItem?.id === item.id ? (
                        <input
                          type="text"
                          value={editingItem.data.code}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, code: e.target.value },
                            })
                          }
                          className="border rounded-lg px-3 py-2 w-24 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          maxLength={2}
                        />
                      ) : (
                        <div className="text-sm text-gray-500">{item.code}</div>
                      )}
                    </td>
                  )}
                  {type === 'region' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingItem?.id === item.id ? (
                        <select
                          value={editingItem.data.countryId}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, countryId: Number(e.target.value) },
                            })
                          }
                          className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="">Select Country</option>
                          {countries.map((country) => (
                            <option key={country.id} value={country.id}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {item.countryId ? getCountryName(item.countryId) : 'N/A'}
                        </div>
                      )}
                    </td>
                  )}
                  {type === 'city' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingItem?.id === item.id ? (
                        <select
                          value={editingItem.data.regionId}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, regionId: Number(e.target.value) },
                            })
                          }
                          className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="">Select Region</option>
                          {regions.map((region) => (
                            <option key={region.id} value={region.id}>
                              {region.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {item.regionId ? getRegionName(item.regionId) : 'N/A'}
                        </div>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2 justify-end">
                      {editingItem?.id === item.id ? (
                        <>
                          <button
                            onClick={handleSave}
                            className="text-green-600 hover:text-green-900 transition-colors"
                          >
                            <Check size={20} />
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(type, item)}
                            className="text-black hover:text-gray-700 transition-colors"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(type, item.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-black">Location Management</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
              className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>

        <div className="space-y-6">
          {renderTable('country', countries.filter(c => 
            c.name.toLowerCase().includes(searchTerm) || 
            c.code?.toLowerCase().includes(searchTerm)
          ))}
          {renderTable('region', regions.filter(r => 
            r.name.toLowerCase().includes(searchTerm) || 
            getCountryName(r.countryId).toLowerCase().includes(searchTerm)
          ))}
          {renderTable('city', cities.filter(c => 
            c.name.toLowerCase().includes(searchTerm) || 
            getRegionName(c.regionId).toLowerCase().includes(searchTerm)
          ))}
        </div>




{/* Add Modal */}
{showAddModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-black">
          {addingType === 'city' ? 'Add New Street' : `Add New ${addingType?.charAt(0).toUpperCase() + addingType?.slice(1)}`}
        </h2>
        <button
          onClick={() => {
            setShowAddModal(false);
            setAddingType(null);
            setAddForm({ id: 0, name: '', code: '', countryId: undefined, regionId: undefined });
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {addingType === 'city' ? 'Street Name' : 'Name'}
          </label>
          <input
            type="text"
            value={addForm.name}
            onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder={addingType === 'city' ? 'Enter Street Name' : `Enter ${addingType} name`}
          />
        </div>

        {addingType === 'country' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country Code</label>
            <input
              type="text"
              value={addForm.code}
              onChange={(e) => setAddForm({ ...addForm, code: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Enter country code"
              maxLength={2}
            />
          </div>
        )}

        {addingType === 'region' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <select
              value={addForm.countryId}
              onChange={(e) => setAddForm({ ...addForm, countryId: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {addingType === 'city' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Region</label>
            <select
              value={addForm.regionId}
              onChange={(e) => setAddForm({ ...addForm, regionId: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select Region</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name} ({getCountryName(region.countryId)})
                </option>
              ))}
            </select>
          </div>
        )}

<button
  onClick={handleAdd}
  className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
>
  Add Street
</button>

      </div>
    </div>
  </div>
)}

      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default LocationPage;