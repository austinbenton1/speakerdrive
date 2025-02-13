import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ErrorBoundary } from './components/ErrorBoundary';
import UploadStatusIndicator from './components/UploadStatusIndicator';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FindLeads from './pages/FindLeads';
import UserManagement from './pages/UserManagement';
import UsersManagement from './pages/UsersManagement';
import Leads from './pages/Leads';
import LeadDetails from './pages/LeadDetails';
import Layout from './components/Layout';
import EmailFinder from './pages/ContactFinder';
import CompanyFinder from './pages/CompanyFinder';
import MobileFinder from './pages/MobileFinder';
import Onboarding from './pages/Onboarding';
import EmailConnection from './pages/EmailConnection';
import ProfileTest from './pages/ProfileTest';
import InstantIntel from './pages/InstantIntel';
import ChatConversation from './pages/ChatConversation';
import SalesCoach from './pages/SalesCoach';
import StoreImagePage from './pages/StoreImagePage';
import Settings from './pages/Settings';
import DeduplicateLeads from './pages/DeduplicateLeads';
import SecurityTab from './components/settings/SecurityTab';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import { supabase } from './lib/supabase';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const { loading, isAuthenticated, initialized } = useAuth();

  // Don't render anything until we've initialized auth
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <UploadStatusIndicator />
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/signup" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/find-leads"
          element={
            <PrivateRoute>
              <FindLeads />
            </PrivateRoute>
          }
        />
        <Route
          path="/leads"
          element={
            <PrivateRoute>
              <Leads />
            </PrivateRoute>
          }
        />
        <Route
          path="/leads/:id"
          element={
            <PrivateRoute>
              <LeadDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/contact-finder"
          element={
            <PrivateRoute>
              <EmailFinder />
            </PrivateRoute>
          }
        />
        <Route
          path="/company-finder"
          element={
            <PrivateRoute>
              <CompanyFinder />
            </PrivateRoute>
          }
        />
        <Route
          path="/mobile-finder"
          element={
            <PrivateRoute>
              <MobileFinder />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/profile"
          element={
            <PrivateRoute>
              <UserManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/security"
          element={
            <PrivateRoute>
              <SecurityTab />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <InstantIntel />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat/sales-coach"
          element={
            <PrivateRoute>
              <SalesCoach />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat/conversation"
          element={
            <PrivateRoute>
              <ChatConversation />
            </PrivateRoute>
          }
        />

        {/* Default Route */}
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
