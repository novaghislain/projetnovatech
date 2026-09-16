import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useLFDAuth } from "../../contexts/LFDAuthContext";

const LFDProtectedRoute = ({ children, requiredPermission, requiredRole }) => {
  const { isAuthenticated, hasPermission, hasRole, lfdUser } = useLFDAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/gestion/connexion" state={{ from: location.pathname }} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/gestion/acces-refuse" replace />;
  }

  if (requiredRole && !hasRole(...(Array.isArray(requiredRole) ? requiredRole : [requiredRole]))) {
    return <Navigate to="/gestion/acces-refuse" replace />;
  }

  return children;
};

export default LFDProtectedRoute;

