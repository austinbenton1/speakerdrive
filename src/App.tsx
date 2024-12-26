import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ErrorBoundary } from './components/ErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import FindLeads from './pages/FindLeads';
import UserManagement from './pages/UserManagement';
import UsersManagement from './pages/UsersManagement';
import Leads from './pages/Leads';
import LeadDetails from './pages/LeadDetails';
import Layout from './components/Layout';
import ContactFinder from './pages/ContactFinder';
import CompanyFinder from './pages/CompanyFinder';
import RoleFinder from './pages/RoleFinder';
import ProfileFinder from './pages/ProfileFinder';
import Onboarding from './pages/Onboarding';
import EmailConnection from './pages/EmailConnection';
import ProfileTest from './pages/ProfileTest';
import InstantIntel from './pages/InstantIntel';
import ChatConversation from './pages/ChatConversation';
import SalesCoach from './pages/SalesCoach';
import StoreImagePage from './pages/StoreImagePage';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Onboarding Routes */}
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } />
        <Route path="/email-setup" element={
          <ProtectedRoute>
            <EmailConnection />
          </ProtectedRoute>
        } />

        {/* Protected App Routes */}
        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/find-leads" element={<FindLeads />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/leads/:id" element={<LeadDetails />} />
          <Route path="/contact-finder" element={<ContactFinder />} />
          <Route path="/company-finder" element={<CompanyFinder />} />
          <Route path="/role-finder" element={<RoleFinder />} />
          <Route path="/profile-finder" element={<ProfileFinder />} />
          <Route path="/settings" element={<UserManagement />} />
          <Route path="/users" element={
            <ProtectedRoute>
              <AdminRoute>
                <UsersManagement />
              </AdminRoute>
            </ProtectedRoute>
          } />
          <Route path="/profile-test" element={<ProfileTest />} />
          <Route path="/chat" element={<InstantIntel />} />
          <Route path="/chat/sales-coach" element={<SalesCoach />} />
          <Route path="/chat/conversation" element={<ChatConversation />} />
          <Route path="/store-image" element={
            <ProtectedRoute>
              <AdminRoute>
                <StoreImagePage />
              </AdminRoute>
            </ProtectedRoute>
          } />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;