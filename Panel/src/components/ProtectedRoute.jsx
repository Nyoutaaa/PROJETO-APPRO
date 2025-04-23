import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  console.log("[ProtectedRoute] Checking auth. Loading:", loading, "Authenticated:", isAuthenticated);

  if (loading) {
    // Show a loading indicator while auth state is being determined
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    console.log("[ProtectedRoute] Not authenticated, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  // Render the child route element if authenticated
  console.log("[ProtectedRoute] Authenticated, rendering Outlet");
  return <Outlet />;
} 