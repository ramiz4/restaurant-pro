import { useUser } from "@/contexts/UserContext";
import {
  hasPageAccess,
  hasActionAccess,
  getNavigationItems,
  UserRole,
} from "@/lib/role-permissions";

export function usePermissions() {
  const { currentUser } = useUser();

  const userRole = currentUser?.role as UserRole;

  return {
    hasPageAccess: (page: string) => {
      if (!userRole) return false;
      return hasPageAccess(userRole, page);
    },

    hasActionAccess: (page: string, action: string) => {
      if (!userRole) return false;
      return hasActionAccess(userRole, page, action);
    },

    getNavigationItems: () => {
      if (!userRole) return [];
      return getNavigationItems(userRole);
    },

    userRole,
    currentUser,
  };
}
