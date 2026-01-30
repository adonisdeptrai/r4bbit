import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Landing from './pages/LandingPage';
import Shop from './pages/Shop';
import Checkout from './pages/Checkout';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/Admin/AddProduct';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import OrderSuccess from './pages/OrderSuccess';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ViewState } from './types';
import SmoothScroll from './components/layout/SmoothScroll';

// Wrapper for SmoothScroll to use as a Layout
const SmoothScrollLayout = () => (
  <SmoothScroll>
    <Outlet />
  </SmoothScroll>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/auth" replace state={{ from: location }} />;
  return children;
};

// Admin Route Wrapper
const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (user?.role !== 'admin') return <Navigate to="/shop" replace />;

  return children;
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Adapter for existing components expecting onNavigate
  const handleNavigate = (view: ViewState) => {
    const path = view === 'landing' ? '/' : `/${view}`;
    navigate(path);
  };

  // Redirect from auth/landing to shop if logged in (Mirroring original logic)
  React.useEffect(() => {
    if (isAuthenticated) {
      if (location.pathname === '/auth') {
        const from = location.state?.from?.pathname || '/shop';
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Landing onNavigate={handleNavigate} />} />

      <Route element={<SmoothScrollLayout />}>
        <Route path="/auth" element={
          isAuthenticated ? <Navigate to="/shop" /> : <Auth onNavigate={handleNavigate} />
        } />

        <Route path="/shop" element={
          <ProtectedRoute>
            <Shop onNavigate={handleNavigate} />
          </ProtectedRoute>
        } />

        <Route path="/checkout" element={
          <ProtectedRoute>
            <Checkout onNavigate={handleNavigate} />
          </ProtectedRoute>
        } />

        <Route path="/order-success" element={
          <ProtectedRoute>
            <OrderSuccess onNavigate={handleNavigate} />
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard onNavigate={handleNavigate} initialTab="overview" />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Dashboard onNavigate={handleNavigate} initialTab="profile" />
          </ProtectedRoute>
        } />

        <Route path="/orders" element={
          <ProtectedRoute>
            <Dashboard onNavigate={handleNavigate} initialTab="orders" />
          </ProtectedRoute>
        } />

        <Route path="/library" element={
          <ProtectedRoute>
            <Dashboard onNavigate={handleNavigate} initialTab="orders" />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <Dashboard onNavigate={handleNavigate} initialTab="settings" />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <AdminRoute>
            <Dashboard onNavigate={handleNavigate} />
          </AdminRoute>
        } />

        <Route path="/add-product" element={
          <AdminRoute>
            <AddProduct />
          </AdminRoute>
        } />

        <Route path="/verify-email" element={<VerifyEmail onNavigate={handleNavigate} />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback onNavigate={handleNavigate} />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import ErrorBoundary from './components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <AppContent />
            <Analytics />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}