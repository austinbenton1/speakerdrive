import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ErrorBoundary } from './components/ErrorBoundary';
import SecurityTab from './components/settings/SecurityTab';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import UploadStatusIndicator from './components/UploadStatusIndicator';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LinkedInCallback from './pages/LinkedInCallback'; // <-- ADDED THIS IMPORT
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
      <UploadStatusIndicator />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* IMPORTANT: Public route for LinkedIn callback */}
        <Route path="/linkedin-callback" element={<LinkedInCallback />} />

        {/* Protected Onboarding Routes */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/email-setup"
          element={
            <ProtectedRoute>
              <EmailConnection />
            </ProtectedRoute>
          }
        />

        {/* Protected App Routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/find-leads" element={<FindLeads />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/leads/:id" element={<LeadDetails />} />
          <Route path="/contact-finder" element={<EmailFinder />} />
          <Route path="/company-finder" element={<CompanyFinder />} />
          <Route path="/mobile-finder" element={<MobileFinder />} />
          {/* Settings Routes */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/profile" element={<UserManagement />} />
          <Route path="/settings/security" element={<SecurityTab />} />
          <Route
            path="/settings/billing"
            element={
              <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-lg font-medium text-gray-900">
                    Billing Coming Soon
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Billing features will be available soon.
                  </p>
                </div>
              </div>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <UsersManagement />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route path="/profile-test" element={<ProfileTest />} />
          <Route path="/chat" element={<InstantIntel />} />
          <Route path="/chat/sales-coach" element={<SalesCoach />} />
          <Route path="/chat/conversation" element={<ChatConversation />} />
          <Route
            path="/store-image"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <StoreImagePage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/deduplicate-leads"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <DeduplicateLeads />
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          {/* Repeated settings routes if needed */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/profile" element={<UserManagement />} />
          <Route
            path="/settings/billing"
            element={
              <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-lg font-medium text-gray-900">
                    Billing Coming Soon
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Billing features will be available soon.
                  </p>
                </div>
              </div>
            }
          />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
