import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, Upload, Building2, ChevronDown, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectUser, hasPermission } from '../../store/slices/authSlice';
import companyApi, { Company, CreateCompanyDto } from '../../api/companyApi';
import locationApi, { Country } from '../../api/locationApi';
import userApi, { User } from '../../api/userApi';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

const CompaniesPage = () => {
  const user = useSelector(selectUser);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [directors, setDirectors] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [directorSearch, setDirectorSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showDirectorDropdown, setShowDirectorDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCompanyDto>({
    name: '',
    email: '',
    countryId: 0,
    directorId: undefined,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const directorDropdownRef = useRef<HTMLDivElement>(null);

  const canCreate = hasPermission('companies:create', user);
  const canUpdate = hasPermission('companies:update', user);
  const canDelete = hasPermission('companies:delete', user);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
      if (directorDropdownRef.current && !directorDropdownRef.current.contains(event.target as Node)) {
        setShowDirectorDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading data...');
      
      const [companiesData, countriesData, directorsData] = await Promise.all([
        companyApi.getAll(),
        locationApi.getAllCountries(),
        userApi.getDirectors()
      ]);

      console.log('Loaded companies:', companiesData);
      console.log('Loaded countries:', countriesData);
      console.log('Loaded directors:', directorsData);

      setCompanies(companiesData);
      setCountries(countriesData);

      const assignedDirectorIds = companiesData
        .filter(company => company.directorId)
        .map(company => company.directorId);

      const availableDirectors = editingId
        ? directorsData.filter(director => 
            !assignedDirectorIds.includes(director.id) || 
            director.id === companiesData.find(c => c.id === editingId)?.directorId
          )
        : directorsData.filter(director => !assignedDirectorIds.includes(director.id));

      setDirectors(availableDirectors);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (file: File) => {
    setSelectedLogo(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.onerror = () => {
      toast.error('Failed to read logo file');
      setSelectedLogo(null);
      setLogoPreview(null);
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = (company: Company) => {
    setEditingId(company.id);
    setFormData({
      name: company.name,
      email: company.email,
      countryId: company.countryId,
      directorId: company.directorId
    });
    
    if (company.id) {
      setLogoPreview(companyApi.getLogoUrl(company.id));
    }
    
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        logo: selectedLogo
      };

      if (submitData.directorId) {
        const assignedCompany = companies.find(
          company => 
            company.directorId === submitData.directorId && 
            company.id !== editingId
        );

        if (assignedCompany) {
          toast.error(`This director is already assigned to company: ${assignedCompany.name}`);
          return;
        }
      }

      if (editingId) {
        await companyApi.update(editingId, submitData);
        toast.success('Company updated successfully');
      } else {
        await companyApi.create(submitData);
        toast.success('Company created successfully');
      }
      
      setShowAddModal(false);
      setEditingId(null);
      setFormData({ name: '', email: '', countryId: 0 });
      setSelectedLogo(null);
      setLogoPreview(null);
      loadData();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    try {
      await companyApi.delete(id);
      toast.success('Company deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete company');
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.Country?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.director?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredDirectors = directors.filter(director =>
    director.username.toLowerCase().includes(directorSearch.toLowerCase()) ||
    director.email.toLowerCase().includes(directorSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Companies</h1>
        {canCreate && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700"
          >
            <Plus size={20} />
            Add Company
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Director
                </th>
                {(canUpdate || canDelete) && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompanies.map((company) => (
                <tr key={company.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {company.id ? (
                          <img
                            src={companyApi.getLogoUrl(company.id)}
                            alt={company.name}
                            className="h-10 w-10 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,...';
                              (e.target as HTMLImageElement).onerror = null;
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.Country?.name} ({company.Country?.code})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.director?.username || 'No Director'}
                  </td>
                  {(canUpdate || canDelete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {canUpdate && (
                        <button
                          onClick={() => handleEdit(company)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(company.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Edit Company' : 'Add New Company'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Logo</label>
                <div className="mt-1 flex items-center space-x-4">
                  <div className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                        onError={() => {
                          setLogoPreview(null);
                        }}
                      />
                    ) : (
                      <Upload className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Choose Logo
                    </button>
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLogo(null);
                          setLogoPreview(null);
                        }}
                        className="block px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error('Logo file size must be less than 5MB');
                          return;
                        }
                        handleLogoChange(file);
                      }
                    }}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Recommended: Square image, max 5MB
                </p>
              </div>

              <div ref={countryDropdownRef} className="relative">
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <div
                  className="mt-1 relative"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                >
                  <div className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white cursor-pointer flex justify-between items-center">
                    <span>
                      {formData.countryId
                        ? countries.find(c => c.id === formData.countryId)?.name
                        : 'Select Country'}
                    </span>
                    <ChevronDown size={20} />
                  </div>
                  {showCountryDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      <div className="sticky top-0 z-10 bg-white px-2 py-1.5">
                        <input
                          type="text"
                          className="w-full border rounded px-2 py-1"
                          placeholder="Search countries..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      {filteredCountries.map((country) => (
                        <div
                          key={country.id}
                          className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-red-50"
                          onClick={() => {
                            setFormData({ ...formData, countryId: country.id });
                            setShowCountryDropdown(false);
                          }}
                        >
                          <span className="block truncate">
                            {country.name} ({country.code})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div ref={directorDropdownRef} className="relative">
                <label className="block text-sm font-medium text-gray-700">Director</label>
                <div className="mt-1">
                  {directors.length === 0 ? (
                    <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                      <AlertCircle size={20} />
                      <span>No available directors found. All directors are currently assigned to companies.</span>
                    </div>
                  ) : (
                    <div
                      className="relative"
                      onClick={() => setShowDirectorDropdown(!showDirectorDropdown)}
                    >
                      <div className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white cursor-pointer flex justify-between items-center">
                        <span>
                          {formData.directorId
                            ? directors.find(d => d.id === formData.directorId)?.username
                            : 'Select Director'}
                        </span>
                        <ChevronDown size={20} />
                      </div>
                      {showDirectorDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                          <div className="sticky top-0 z-10 bg-white px-2 py-1.5">
                            <input
                              type="text"
                              className="w-full border rounded px-2 py-1"
                              placeholder="Search directors..."
                              value={directorSearch}
                              onChange={(e) => setDirectorSearch(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          {filteredDirectors.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              No available directors found
                            </div>
                          ) : (
                            filteredDirectors.map((director) => (
                              <div
                                key={director.id}
                                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-red-50"
                                onClick={() => {
                                  setFormData({ ...formData, directorId: director.id });
                                  setShowDirectorDropdown(false);
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="block truncate font-medium">
                                    {director.username}
                                  </span>
                                  <span className="block truncate text-sm text-gray-500">
                                    {director.email}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingId(null);
                    setFormData({ name: '', email: '', countryId: 0 });
                    setSelectedLogo(null);
                    setLogoPreview(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;