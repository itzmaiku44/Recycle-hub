import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';
import WarningPage from './WarningPage';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user } = useAuth() || {};
  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'ADMIN';

  // If admin is required, check admin status
  if (requireAdmin) {
    if (!isLoggedIn || !isAdmin) {
      return <WarningPage />;
    }
    return children;
  }

  // For regular user routes, just check if logged in
  if (!isLoggedIn) {
    return <WarningPage />;
  }

  return children;
};

export default ProtectedRoute;
