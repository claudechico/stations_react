import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { Building2, MapPin, Users, UserCheck, Building, MapPinned } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, ResponsiveContainer 
} from 'recharts';
// Import your API modules (adjust the import paths as needed)
import companyApi from '../../api/companyApi';
import stationApi from '../../api/stationApi';
import userApi from '../../api/userApi';

const DashboardCard = ({ title, value, Icon, color, subtitle }) => (
  <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800 mt-1">{value}</h3>
      <p className="text-gray-500 text-sm font-medium">{subtitle}</p>
    </div>
    <div className={`p-3 rounded-full ${color}`}>
      <Icon size={28} className="text-white" />
    </div>
  </div>
);

const STATION_COLORS = [
  '#DC2626', // red
  '#171717', // black
  '#991B1B', // darker red
  '#404040', // gray-black
  '#B91C1C', // another red shade
  '#262626', // another black shade
  '#EF4444', // lighter red
  '#525252', // medium gray
  '#F87171', // light red
];

const Dashboard = () => {
  const user = useSelector(selectUser);
  const [companies, setCompanies] = useState([]);
  const [stations, setStations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log('the users are',user?.role.name);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role.name === 'admin') {
          // Admin gets all data
          const [stationsData, companiesData, usersData] = await Promise.all([
            stationApi.getAll(),
            companyApi.getAll(),
            userApi.getAllUsers(),
          ]);
          setStations(stationsData);
          setCompanies(companiesData);
          setUsers(usersData);
        } else if (user?.role.name === 'director') {
          // Director: Filter stations by their companies
          const companiesData = await companyApi.getAll();
          const directorCompanies = companiesData.filter(company => company.directorId === user.id);

          const stationsData = await stationApi.getAll();
          const filteredStations = stationsData.filter(station =>
            directorCompanies.some(company => company.id === station.companyId)
          );
          setStations(filteredStations);
        } else if (user.role.name === 'manager') {
          // Manager: Only sees their own station
          const stationsData = await stationApi.getAll();
          const filteredStations = stationsData.filter(station => station.managerId === user.id);
          setStations(filteredStations);
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const prepareCompanyStationData = () => {
    return companies.map(company => ({
      name: company.name,
      stations: stations.filter(station => station.companyId === company.id).length
    }));
  };

  const prepareUserRoleData = () => {
    const roleCount = users.reduce((acc, user) => {
      // console.log('the user in role is',user);
      const roleName = user?.Role?.name || 'Unknown';
      console.log('the role name is',roleName)
      acc[roleName] = (acc[roleName] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(roleCount).map(([name, value]) => ({
      name,
      value
    }));
  };

  const prepareStationStatusData = (stationData) => {
    return stationData.map(station => ({
      name: station.name,
      value: 1, // Each station counts as 1 for the bar height
      status: station.managerId ? 'Managed' : 'Unmanaged'
    }));
  };

  const renderAdminDashboard = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <DashboardCard 
          title="Total Companies" 
          value={companies.length} 
          Icon={Building2} 
          color="bg-black"
          subtitle="Active businesses"
        />
        <DashboardCard 
          title="Total Stations" 
          value={stations.length} 
          Icon={MapPin} 
          color="bg-red-600"
          subtitle="Operating stations"
        />
        <DashboardCard 
          title="Total Users" 
          value={users.length} 
          Icon={Users} 
          color="bg-neutral-900"
          subtitle="Registered users"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#FFFAF0] p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-neutral-900">Stations per Company</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareCompanyStationData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="stations">
                {
                  prepareCompanyStationData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATION_COLORS[index % STATION_COLORS.length]} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#FFFAF0] p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-neutral-900">User Role Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={prepareUserRoleData()}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {prepareUserRoleData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#DC2626', '#171717', '#404040'][index % 3]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Active Directors" 
          value={users.filter(u => u?.role?.name === 'director').length} 
          Icon={UserCheck} 
          color="bg-black"
          subtitle="Managing companies"
        />
        <DashboardCard 
          title="Active Managers" 
          value={users.filter(u => u?.role?.name === 'manager').length} 
          Icon={Building} 
          color="bg-red-600"
          subtitle="Managing stations"
        />
        <DashboardCard 
          title="Avg Stations/Company" 
          value={(stations.length / companies.length).toFixed(1)} 
          Icon={MapPinned} 
          color="bg-neutral-900"
          subtitle="Distribution ratio"
        />
        <DashboardCard 
          title="Coverage" 
          value={`${((stations.length / companies.length) * 100).toFixed(0)}%`} 
          Icon={Building2} 
          color="bg-black"
          subtitle="Station coverage"
        />
      </div>
    </>
  );

  const renderDirectorDashboard = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <DashboardCard 
        title="Your Stations" 
        value={stations.length} 
        Icon={MapPin} 
        color="bg-red-600"
        subtitle="Under management"
      />
      <DashboardCard 
        title="Station Managers" 
        value={stations.filter(station => station.managerId).length} 
        Icon={Users} 
        color="bg-black"
        subtitle="Active managers"
      />
      <DashboardCard 
        title="Coverage" 
        value={`${((stations.filter(station => station.managerId).length / stations.length) * 100).toFixed(0)}%`} 
        Icon={Building2} 
        color="bg-neutral-900"
        subtitle="Managed stations"
      />
    </div>
  );

  const renderManagerDashboard = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <DashboardCard 
        title="Your Station" 
        value={stations.length} 
        Icon={MapPin} 
        color="bg-red-600"
        subtitle="Under your management"
      />
    </div>
  );

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6">Error: {error}</div>;

  return (
    <div className="p-6 bg-[#FAFAFA]">
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">
        Welcome back, {user?.username || 'User'}!
      </h1>

      {user?.role?.name === 'admin' && renderAdminDashboard()}
      {user?.role?.name === 'director' && renderDirectorDashboard()}
      {user?.role?.name === 'manager' && renderManagerDashboard()}
    </div>
  );
};

export default Dashboard;
