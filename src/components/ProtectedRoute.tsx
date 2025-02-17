import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute checks 3 things:
 * 1) loading => show spinner
 * 2) isAuthenticated => if false, go /login
 * 3) does user have "website"? => if not, go /onboarding
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, loading, user } = useAuth(); // or however your useAuth returns things
  const [profileLoading, setProfileLoading] = React.useState(true);
  const [hasWebsite, setHasWebsite] = React.useState<boolean>(false);

  React.useEffect(() => {
    async function fetchProfile() {
      // If there's no user, skip
      if (!user) {
        setProfileLoading(false);
        return;
      }
      // Query the "profiles" table for the user's website
      const { data, error } = await supabase
        .from('profiles')
        .select('website')
        .eq('id', user.id)
        .single();

      if (!error && data?.website && data.website.trim().length > 0) {
        setHasWebsite(true);
      }
      setProfileLoading(false);
    }

    // Once we know user is done "loading" from useAuth, fetch their profile
    if (!loading && user) {
      fetchProfile();
    } else if (!loading && !user) {
      setProfileLoading(false);
    }
  }, [loading, user]);

  // 1) If still loading the session or profile, show a spinner
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // 2) If not logged in, bounce to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3) If user has no website, force them to /onboarding
  if (!hasWebsite) {
    return <Navigate to="/onboarding" replace />;
  }

  // If we pass all checks, render the protected content
  return <>{children}</>;
}
