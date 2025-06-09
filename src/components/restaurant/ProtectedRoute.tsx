import { ReactNode } from "react";

import { Navigate, useLocation } from "react-router-dom";

import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/contexts/UserContext";
import { usePermissions } from "@/hooks/use-permissions";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPage: string;
}

export function ProtectedRoute({
  children,
  requiredPage,
}: ProtectedRouteProps) {
  const { isLoading } = useUser();
  const { hasPageAccess, currentUser } = usePermissions();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

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
