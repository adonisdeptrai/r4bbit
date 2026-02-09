import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';

// Lazy Load Pages
const Landing = lazy(() => import('./pages/LandingPage'));
const Shop = lazy(() => import('./pages/Shop'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Auth = lazy(() => import('./pages/Auth'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AddProduct = lazy(() => import('./pages/admin_lower/AddProduct'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));

import { CartProvider } from './contexts/CartContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { AffiliateProvider } from './contexts/AffiliateContext';
import { ViewState } from './types';
import SmoothScroll from './components/layout/SmoothScroll';

// Loading Component
const PageLoader = () => (
  <div className="min-h-screen bg-[#020617] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-brand-cyan/30 border-t-brand-cyan rounded-full animate-spin"></div>
  </div>
);

// Wrapper for SmoothScroll to use as a Layout
const SmoothScrollLayout = () => (
  <SmoothScroll>
    <Outlet />
  </SmoothScroll>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-cyan/30 border-t-brand-cyan rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/auth" replace state={{ from: location }} />;
  return children;
};

// Admin Route Wrapper
const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-cyan/30 border-t-brand-cyan rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/auth" replace state={{ from: location }} />;
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
    <Suspense fallback={<PageLoader />}>
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

          <Route path="/affiliate" element={
            <ProtectedRoute>
              <Dashboard onNavigate={handleNavigate} initialTab="affiliate" />
            </ProtectedRoute>
          } />

          <Route path="/add-product" element={
            <AdminRoute>
              <AddProduct />
            </AdminRoute>
          } />

          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback onNavigate={handleNavigate} />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

import ErrorBoundary from './components/common/ErrorBoundary';
import { WishlistProvider } from './contexts/WishlistContext';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AffiliateProvider>
                <AppContent />
                <Analytics />
              </AffiliateProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}