import { ReactNode } from "react";

import { usePermissions } from "@/hooks/use-permissions";

interface PermissionGuardProps {
  children: ReactNode;
  page: string;
  action?: string;
  fallback?: ReactNode;
}

export function PermissionGuard({
  children,
  page,
  action,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPageAccess, hasActionAccess } = usePermissions();

  // Check page access first
  if (!hasPageAccess(page)) {
    return <>{fallback}</>;
  }

  // If action is specified, check action access
  if (action && !hasActionAccess(page, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
