import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/pelanggan/Dashboard';
import BarbershopDetail from './pages/pelanggan/BarbershopDetail';
import BookingForm from './pages/pelanggan/BookingForm';
import History from './pages/pelanggan/History';
import ProfileSettings from './pages/pelanggan/ProfileSettings';
import AdminDashboard from './pages/admin/AdminDashboard';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';

// ProtectedRoute checks if user is logged in
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-100">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  // Role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role if unauthorized for this route
    if (user.role === 'admin_barbershop') return <Navigate to="/admin/dashboard" />;
    if (user.role === 'super_admin') return <Navigate to="/superadmin/dashboard" />;
    return <Navigate to="/" />; // Default for pelanggan
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Pelanggan Routes */}
          <Route path="/" element={
            <ProtectedRoute allowedRoles={['pelanggan']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/barbershop/:id" element={
            <ProtectedRoute allowedRoles={['pelanggan']}>
              <BarbershopDetail />
            </ProtectedRoute>
          } />
          <Route path="/barbershop/:id/book" element={
            <ProtectedRoute allowedRoles={['pelanggan']}>
              <BookingForm />
            </ProtectedRoute>
          } />
          <Route path="/reservasi/riwayat" element={
            <ProtectedRoute allowedRoles={['pelanggan']}>
              <History />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['pelanggan']}>
              <ProfileSettings />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin_barbershop']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Super Admin Routes */}
          <Route path="/superadmin/dashboard" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
