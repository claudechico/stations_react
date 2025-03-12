import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, selectUser } from './store/slices/authSlice';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import DashboardLayout from './components/layout/DashboardLayout';
import { RootState } from './store/slices/store';  // Ensure you're importing RootState from the store file
import CompaniesPage from './pages/companies/CompaniesPage';
import StationsPage from './pages/stations';
import UsersPage from './pages/users';
import LocationPage from './pages/Locations/LocationPage';
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useSelector((state: RootState) => selectUser(state));
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => selectUser(state));

  useEffect(() => {
    // Check if a user is already logged in (e.g., if token is in localStorage)
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      dispatch(login({ username: JSON.parse(savedUser), password: savedToken }));
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard routes will be added here */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="locations" element={<LocationPage/>} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="stations" element={<StationsPage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
