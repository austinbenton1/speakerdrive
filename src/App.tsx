import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import UploadStatusIndicator from './components/UploadStatusIndicator';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FindLeads from './pages/FindLeads';
import UserManagement from './pages/UserManagement';
import Leads from './pages/Leads';
import LeadDetails from './pages/LeadDetails';
import EmailFinder from './pages/EmailFinder';
import CompanyFinder from './pages/CompanyFinder';
import MobileFinder from './pages/MobileFinder';
import InstantIntel from './pages/InstantIntel';
import SalesCoach from './pages/SalesCoach';
import ChatConversation from './pages/ChatConversation';
import Settings from './pages/Settings';
import SecurityTab from './components/settings/SecurityTab';

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

        {/* Protected Routes - All wrapped in Layout */}
        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/find-leads" element={<FindLeads />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/leads/:id" element={<LeadDetails />} />
          <Route path="/contact-finder" element={<EmailFinder />} />
          <Route path="/company-finder" element={<CompanyFinder />} />
          <Route path="/mobile-finder" element={<MobileFinder />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/profile" element={<UserManagement />} />
          <Route path="/settings/security" element={<SecurityTab />} />
          <Route path="/chat" element={<InstantIntel />} />
          <Route path="/chat/sales-coach" element={<SalesCoach />} />
          <Route path="/chat/conversation" element={<ChatConversation />} />
        </Route>

        {/* Default Route */}
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
