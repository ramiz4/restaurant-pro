import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { usePermissions } from "@/hooks/use-permissions";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPage: string;
}

export function ProtectedRoute({
  children,
  requiredPage,
}: ProtectedRouteProps) {
  const { hasPageAccess, currentUser } = usePermissions();
  const location = useLocation();

  // If user is not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user doesn't have access to this page, redirect to dashboard
  if (!hasPageAccess(requiredPage)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
