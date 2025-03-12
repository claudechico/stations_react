import React, { useState, useEffect } from 'react';
import { X, AlertCircle, ChevronDown, Search } from 'lucide-react';
import { CreateStationDto } from '../../../api/stationApi';
import { Country, Region, City } from '../../../api/locationApi';
import locationApi from '../../../api/locationApi';
import { cn } from '../../../lib/utils';

interface AddStationModalProps {
  onClose: () => void;
  onSubmit: (data: CreateStationDto) => Promise<void>;
  companies: any[];
  managers: any[];
  selectedCompanyId?: number;
}

const AddStationModal: React.FC<AddStationModalProps> = ({
  onClose,
  onSubmit,
  companies,
  managers,
  selectedCompanyId
}) => {
  const [formData, setFormData] = useState<CreateStationDto>({
    name: '',
    tin: '',
    domainUrl: '',
    companyId: selectedCompanyId || 0,
    managerId: undefined,
    cityId: 0,
    street: ''
  });

  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);

  useEffect(() => {
    loadLocationData();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      const company = companies.find(c => c.id === selectedCompanyId);
      if (company?.countryId) {
        setSelectedCountry(company.countryId);
        loadRegions(company.countryId);
      }
    }
  }, [selectedCompanyId, companies]);

  const loadLocationData = async () => {
    try {
      const countriesData = await locationApi.getAllCountries();
      setCountries(countriesData);
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  const loadRegions = async (countryId: number) => {
    try {
      const regionsData = await locationApi.getAllRegions();
      const filteredRegions = regionsData.filter(region => region.countryId === countryId);
      setRegions(filteredRegions);
      setCities([]);
      setSelectedRegion(null);
    } catch (error) {
      console.error('Error loading regions:', error);
    }
  };

  const loadCities = async (regionId: number) => {
    try {
      const citiesData = await locationApi.getAllCities();
      const filteredCities = citiesData.filter(city => city.regionId === regionId);
      setCities(filteredCities);
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const handleCompanyChange = (companyId: number) => {
    const company = companies.find(c => c.id === companyId);
    setFormData({ ...formData, companyId });
    if (company?.countryId) {
      setSelectedCountry(company.countryId);
      loadRegions(company.countryId);
    }
  };

  const handleRegionChange = (regionId: number) => {
    setSelectedRegion(regionId);
    loadCities(regionId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cityId) {
      alert('Please select a city');
      return;
    }
    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add New Station</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full px-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">TIN</label>
              <input
                type="text"
                value={formData.tin}
                onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                className="mt-1 w-full px-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <select
                value={formData.companyId}
                onChange={(e) => handleCompanyChange(Number(e.target.value))}
                className="mt-1 w-full px-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-red-500"
                required
              >
                <option value="">Select Company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Manager</label>
              <select
                value={formData.managerId || ''}
                onChange={(e) => setFormData({ ...formData, managerId: Number(e.target.value) || undefined })}
                className="mt-1 w-full px-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-red-500"
              >
                <option value="">No Manager</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.username}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Region</label>
              <select
                value={selectedRegion || ''}
                onChange={(e) => handleRegionChange(Number(e.target.value))}
                className="mt-1 w-full px-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-red-500"
                required
                disabled={!selectedCountry}
              >
                <option value="">Select Region</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <select
                value={formData.cityId}
                onChange={(e) => setFormData({ ...formData, cityId: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-red-500"
                required
                disabled={!selectedRegion}
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Domain URL</label>
              <input
                type="url"
                value={formData.domainUrl}
                onChange={(e) => setFormData({ ...formData, domainUrl: e.target.value })}
                className="mt-1 w-full px-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-red-500"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Street Address</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="mt-1 w-full px-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-red-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={cn(
                "px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700",
                loading && "opacity-50 cursor-not-allowed"
              )}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Station'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStationModal;