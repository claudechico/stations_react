import React, { useState, useEffect } from 'react';
import { X, AlertCircle, ChevronDown, Search } from 'lucide-react';
import stationApi, { CreateStationDto } from '../../../api/stationApi';
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
  const [managerSearch, setManagerSearch] = useState('');
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [availableManagers, setAvailableManagers] = useState(managers);
  const [stations, setStations] = useState<Station[]>([]);
  const [stationsData, setStationsData] = useState(null);
  const [assignedManagers, setAssignedManagers] = useState([]);
  const [companySearch, setCompanySearch] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [regionSearch, setRegionSearch] = useState('');
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [streetSearch, setStreetSearch] = useState('');
  const [showStreetDropdown, setShowStreetDropdown] = useState(false);

  console.log('the all stations data is',stationsData);

  console.log('available manager is', assignedManagers)

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
          .filter(station => station.manager?.id) // Keep stations with managerId
          .map(station => station.manager?.id);  // Extract managerId

        // Set the filtered managerIds to state
        setAssignedManagers(managersAssigned as any);

      } catch (err) {
        // Handle errors if any
        setError(err);
        console.error("Error fetching station data:", err);
      } finally {
        setLoading(false); // Set loading to false after the data has been fetched or if there's an error
      }
    };

    fetchData(); // Call the async function
  }, []); // Empty dependency array ensures this effect runs only once on mount

  //getting all station data 
  
  // const assignedManagerID = managers
  // .filter(company => company.managerId)
  // .map(company => company.managerId);
 

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

  const handleManagerSelect = (manager: any) => {
    setFormData({ ...formData, managerId: manager.id });
    setManagerSearch('');
    setShowManagerDropdown(false);
  };

  const clearSelectedManager = () => {
    setFormData({ ...formData, managerId: undefined });
    setManagerSearch('');
  };

  const filteredManagers = availableManagers.filter(manager => 
    manager.username.toLowerCase().includes(managerSearch.toLowerCase()) &&
    manager.id !== formData.managerId
  );
  const notAssignedManagers = managers.filter(
    (manager) => !assignedManagers.includes(manager?.id)
  );
  

  const handleCompanySelect = (company: any) => {
    handleCompanyChange(company.id);
    setCompanySearch('');
    setShowCompanyDropdown(false);
  };

  const handleRegionSelect = (region: any) => {
    handleRegionChange(region.id);
    setRegionSearch('');
    setShowRegionDropdown(false);
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  const filteredRegions = regions.filter(region =>
    region.name.toLowerCase().includes(regionSearch.toLowerCase())
  );

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(streetSearch.toLowerCase())
  );

  const handleStreetSelect = (city: any) => {
    setFormData({ ...formData, cityId: city.id });
    setStreetSearch('');
    setShowStreetDropdown(false);
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
              <div className="relative">
                {formData.companyId ? (
                  <div className="mt-1 flex items-center justify-between w-full px-3 py-1.5 text-sm border rounded-md">
                    <span>{companies.find(c => c.id === formData.companyId)?.name}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, companyId: 0 })}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <input
                        type="text"
                        value={companySearch}
                        onChange={(e) => {
                          setCompanySearch(e.target.value);
                          setShowCompanyDropdown(true);
                        }}
                        onFocus={() => setShowCompanyDropdown(true)}
                        placeholder="Search company..."
                        className="mt-1 w-full px-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-red-500 pr-8"
                      />
                      <Search className="absolute right-2 top-[50%] transform -translate-y-1/2 text-gray-400" size={16} />
                    </div>

                    {showCompanyDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filteredCompanies.map((company) => (
                          <button
                            key={company.id}
                            type="button"
                            onClick={() => handleCompanySelect(company)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                          >
                            {company.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Manager</label>
              <div className="relative">
                {formData.managerId ? (
                  <div className="mt-1 flex items-center justify-between w-full px-3 py-1.5 text-sm border rounded-md">
                    <span>{managers.find(m => m.id === formData.managerId)?.username}</span>
                    <button
                      type="button"
                      onClick={clearSelectedManager}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <input
                        type="text"
                        value={managerSearch}
                        onChange={(e) => {
                          setManagerSearch(e.target.value);
                          setShowManagerDropdown(true);
                        }}
                        onFocus={() => setShowManagerDropdown(true)}
                        placeholder="Search manager..."
                        className="mt-1 w-full px-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-red-500 pr-8"
                      />
                      <Search className="absolute right-2 top-[50%] transform -translate-y-1/2 text-gray-400" size={16} />
                    </div>

                    {showManagerDropdown && (
  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
    { notAssignedManagers.length > 0 ? (
       notAssignedManagers.map((manager) => (
        <button
          key={manager.id}
          type="button"
          onClick={() => handleManagerSelect(manager)}
          className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
        >
          {manager.username}
        </button>
      ))
    ) : (
      <div className="px-3 py-2 text-sm text-gray-500">
        No managers available
      </div>
    )}
  </div>
)}


                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Region</label>
              <div className="relative">
                {selectedRegion ? (
                  <div className="mt-1 flex items-center justify-between w-full px-3 py-1.5 text-sm border rounded-md">
                    <span>{regions.find(r => r.id === selectedRegion)?.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRegion(null);
                        setCities([]);
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <input
                        type="text"
                        value={regionSearch}
                        onChange={(e) => {
                          setRegionSearch(e.target.value);
                          setShowRegionDropdown(true);
                        }}
                        onFocus={() => setShowRegionDropdown(true)}
                        placeholder="Search region..."
                        className="mt-1 w-full px-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-red-500 pr-8"
                        disabled={!selectedCountry}
                      />
                      <Search className="absolute right-2 top-[50%] transform -translate-y-1/2 text-gray-400" size={16} />
                    </div>

                    {showRegionDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filteredRegions.map((region) => (
                          <button
                            key={region.id}
                            type="button"
                            onClick={() => handleRegionSelect(region)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                          >
                            {region.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Street</label>
              <div className="relative">
                {formData.cityId ? (
                  <div className="mt-1 flex items-center justify-between w-full px-3 py-1.5 text-sm border rounded-md">
                    <span>{cities.find(c => c.id === formData.cityId)?.name}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, cityId: 0 })}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <input
                        type="text"
                        value={streetSearch}
                        onChange={(e) => {
                          setStreetSearch(e.target.value);
                          setShowStreetDropdown(true);
                        }}
                        onFocus={() => setShowStreetDropdown(true)}
                        placeholder="Search street..."
                        className="mt-1 w-full px-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-red-500 pr-8"
                        disabled={!selectedRegion}
                      />
                      <Search className="absolute right-2 top-[50%] transform -translate-y-1/2 text-gray-400" size={16} />
                    </div>

                    {showStreetDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filteredCities.length > 0 ? (
                          filteredCities.map((city) => (
                            <button
                              key={city.id}
                              type="button"
                              onClick={() => handleStreetSelect(city)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                            >
                              {city.name}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            No streets found
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
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

            {/* <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Street Address</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="mt-1 w-full px-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-red-500"
                required
              />
            </div> */}
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