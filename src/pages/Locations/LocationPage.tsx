import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, X, Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
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

interface SearchableSelectProps {
  options: { id: number; name: string; subtitle?: string }[];
  value: number | undefined;
  onChange: (value: number) => void;
  placeholder: string;
  className?: string;
}

const SearchableSelect = ({ options, value, onChange, placeholder, className }: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div
        className="border rounded-lg px-3 py-2 flex justify-between items-center cursor-pointer bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`${!selectedOption ? 'text-gray-400' : ''}`}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown size={20} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="p-2 sticky top-0 bg-white border-b">
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="py-1">
            {filteredOptions.map((option) => (
              <div
                key={option.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
              >
                <div className="font-medium">{option.name}</div>
                {option.subtitle && (
                  <div className="text-sm text-gray-500">{option.subtitle}</div>
                )}
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-gray-500">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

interface PaginatedData<T> {
  items: T[];
  currentPage: number;
  totalItems: number;
  pageSize: number;
}

const Pagination = ({ currentPage, totalItems, pageSize, onPageChange, onPageSizeChange }: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const pageSizeOptions = [10, 20, 50, 100];

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push(-1); // Separator
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push(-1); // Separator
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1); // Separator
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push(-1); // Separator
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="flex items-center">
        <span className="text-sm text-gray-700 mr-2">Show</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-700 ml-2">entries</span>
      </div>

      <div className="flex items-center space-x-2">
        <p className="text-sm text-gray-700">
          Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to{' '}
          {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
        </p>

        <nav className="flex items-center space-x-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-md ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ChevronLeft size={20} />
          </button>

          {getPageNumbers().map((pageNum, idx) => (
            pageNum === -1 ? (
              <span key={`separator-${idx}`} className="px-3 py-2">...</span>
            ) : (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-2 rounded-md ${
                  currentPage === pageNum
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            )
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-md ${
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </nav>
      </div>
    </div>
  );
};

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
  const [pagination, setPagination] = useState({
    country: { currentPage: 1, pageSize: 10 },
    region: { currentPage: 1, pageSize: 10 },
    city: { currentPage: 1, pageSize: 10 }
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

  const paginateData = <T extends any>(
    data: T[],
    currentPage: number,
    pageSize: number
  ): PaginatedData<T> => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return {
      items: data.slice(startIndex, endIndex),
      currentPage,
      totalItems: data.length,
      pageSize
    };
  };

  const renderTable = (type: 'country' | 'region' | 'city', data: LocationData[]) => {
    const paginationState = pagination[type];
    const paginatedData = paginateData(data, paginationState.currentPage, paginationState.pageSize);

    const getDisplayName = (t: string) => {
      if (t === 'city') return 'Street';
      return t.charAt(0).toUpperCase() + t.slice(1);
    };

    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-black text-white">
          <h2 className="text-xl font-semibold capitalize">{getDisplayName(type)}s</h2>
          <button
            onClick={() => {
              setAddingType(type);
              setShowAddModal(true);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add {getDisplayName(type)}
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
              {paginatedData.items.map((item) => (
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
                        <SearchableSelect
                          options={countries.map(country => ({
                            id: country.id,
                            name: country.name,
                            subtitle: country.code
                          }))}
                          value={editingItem.data.countryId}
                          onChange={(value) =>
                            setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, countryId: value },
                            })
                          }
                          placeholder="Select Country"
                          className="w-full"
                        />
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
                        <SearchableSelect
                          options={regions.map(region => ({
                            id: region.id,
                            name: region.name,
                            subtitle: getCountryName(region.countryId)
                          }))}
                          value={editingItem.data.regionId}
                          onChange={(value) =>
                            setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, regionId: value },
                            })
                          }
                          placeholder="Select Region"
                          className="w-full"
                        />
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
        <Pagination
          currentPage={paginationState.currentPage}
          totalItems={paginatedData.totalItems}
          pageSize={paginationState.pageSize}
          onPageChange={(page) => setPagination(prev => ({
            ...prev,
            [type]: { ...prev[type], currentPage: page }
          }))}
          onPageSizeChange={(size) => setPagination(prev => ({
            ...prev,
            [type]: { currentPage: 1, pageSize: size }
          }))}
        />
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
          Add New {addingType === 'city' ? 'Street' : addingType?.charAt(0).toUpperCase() + addingType?.slice(1)}
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
            <SearchableSelect
              options={countries.map(country => ({
                id: country.id,
                name: country.name,
                subtitle: country.code
              }))}
              value={addForm.countryId}
              onChange={(value) => setAddForm({ ...addForm, countryId: value })}
              placeholder="Select Country"
              className="w-full"
            />
          </div>
        )}

        {addingType === 'city' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Region</label>
            <SearchableSelect
              options={regions.map(region => ({
                id: region.id,
                name: region.name,
                subtitle: getCountryName(region.countryId)
              }))}
              value={addForm.regionId}
              onChange={(value) => setAddForm({ ...addForm, regionId: value })}
              placeholder="Select Region"
              className="w-full"
            />
          </div>
        )}

<button
  onClick={handleAdd}
  className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
>
  Add {addingType === 'city' ? 'Street' : addingType?.charAt(0).toUpperCase() + addingType?.slice(1)}
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