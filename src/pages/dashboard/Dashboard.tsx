import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { Building2, MapPin, Users } from 'lucide-react';

const DashboardCard = ({ title, value, Icon, color }) => (
  <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800 mt-1">{value}</h3>
    </div>
    <div className={`p-3 rounded-full ${color}`}>
      <Icon size={28} className="text-white" />
    </div>
  </div>
);

const Dashboard = () => {
  const user = useSelector(selectUser);

  const stats = {
    companies: 12,
    stations: 45,
    users: 89,
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Welcome back, {user?.username}!
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard title="Total Companies" value={stats.companies} Icon={Building2} color="bg-red-600" />
        <DashboardCard title="Total Stations" value={stats.stations} Icon={MapPin} color="bg-red-700" />
        <DashboardCard title="Total Users" value={stats.users} Icon={Users} color="bg-red-800" />
      </div>
    </div>
  );
};

export default Dashboard;