import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../screens/LoadingScreen';

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Route protection wrapper for all authenticated mobile routes.
 * Ensures the user session is verified before mounting any protected screen or data-fetching logic.
 * Eliminates redundant per-screen / per-hook authentication checks.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isCheckingAuth, authLoadingMessage } = useAuth();

  // If credentials are being verified or session is being hydrated, show loader
  if (isCheckingAuth) {
    return <LoadingScreen message={authLoadingMessage || 'Restoring boutique session...'} />;
  }

  // If unauthenticated, redirect to the login page immediately
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  // Render protected child routes when authenticated
  return <>{children}</>;
}

export default ProtectedRoute;

