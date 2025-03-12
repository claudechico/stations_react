// DashboardLayout.tsx
import { Outlet } from 'react-router-dom';
import Sidebar from './ui/Sidebar';
import Header from './ui/Header';

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="p-4 lg:p-6 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
