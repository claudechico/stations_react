import React, { useState, useEffect } from 'react';
import { Plus, Search, Building2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectUser, hasPermission } from '../../store/slices/authSlice';
import stationApi, { Station } from '../../api/stationApi';
import companyApi from '../../api/companyApi';
import userApi from '../../api/userApi';
import { toast } from 'react-hot-toast';
import StationCard from './components/StationCard';
import AddStationModal from './components/AddStationModal';

const StationsPage = () => {
  const user = useSelector(selectUser);
  const [stations, setStations] = useState<Station[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Permission checks
  const canCreate = hasPermission('stations:create', user);
  const canUpdate = hasPermission('stations:update', user);
  const canDelete = hasPermission('stations:delete', user);
  const isAdmin = user?.role?.name === 'admin';
  const isDirector = user?.role?.name === 'director';
  const isManager = user?.role?.name === 'manager';

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      let stationsData: Station[] = [];
      let companiesData: any[] = [];
      let managersData: any[] = [];

      // Load managers with 'manager' role who aren't assigned to any station
      managersData = await userApi.getManagers();

      if (isAdmin) {
        companiesData = await companyApi.getAll();
        if (selectedCompany) {
          stationsData = await stationApi.getByCompany(selectedCompany);
        } else {
          stationsData = await stationApi.getAll();
        }
      } else if (isDirector) {
        const userCompanies = user?.directedCompanies || [];
        companiesData = userCompanies;
        if (userCompanies.length > 0) {
          stationsData = await stationApi.getByCompany(userCompanies[0].id);
        }
      } else if (isManager) {
        stationsData = await stationApi.getAll();
        stationsData = stationsData.filter(station => station.managerId === user?.id);
      }

      setStations(stationsData);
      setCompanies(companiesData);
      setManagers(managersData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = async (companyId: number) => {
    setSelectedCompany(companyId);
    try {
      const stationsData = await stationApi.getByCompany(companyId);
      setStations(stationsData);
    } catch (error) {
      console.error('Error fetching company stations:', error);
      toast.error('Failed to fetch stations');
    }
  };

  const handleCreateStation = async (data: any) => {
    try {
      await stationApi.create(data);
      toast.success('Station created successfully');
      await loadData();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating station:', error);
      toast.error('Failed to create station');
    }
  };

  const handleUpdateStation = async (id: number, data: Partial<Station>) => {
    try {
      await stationApi.update(id, data);
      toast.success('Station updated successfully');
      await loadData();
    } catch (error) {
      console.error('Error updating station:', error);
      toast.error('Failed to update station');
    }
  };

  const handleDeleteStation = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this station?')) return;
    try {
      await stationApi.delete(id);
      toast.success('Station deleted successfully');
      await loadData();
    } catch (error) {
      console.error('Error deleting station:', error);
      toast.error('Failed to delete station');
    }
  };

  const filteredStations = stations.filter(station => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (station.name?.toLowerCase() || '').includes(searchLower) ||
      (station.tin?.toLowerCase() || '').includes(searchLower) ||
      (station.company?.name?.toLowerCase() || '').includes(searchLower) ||
      (station.manager?.username?.toLowerCase() || '').includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredStations.length / itemsPerPage);
  const paginatedStations = filteredStations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Station Management</h1>
          {canCreate && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700"
            >
              <Plus size={20} />
              Add Station
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {isAdmin && (
            <div className="w-full md:w-64">
              <select
                value={selectedCompany || ''}
                onChange={(e) => handleCompanyChange(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Companies</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex-1 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search stations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
          </div>
        </div>

        {paginatedStations.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No stations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating a new station'}
            </p>
            {canCreate && !searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  New Station
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedStations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                canUpdate={canUpdate}
                canDelete={canDelete}
                onUpdate={handleUpdateStation}
                onDelete={handleDeleteStation}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddStationModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateStation}
          companies={companies}
          managers={managers}
          selectedCompanyId={selectedCompany}
        />
      )}
    </div>
  );
};

export default StationsPage;