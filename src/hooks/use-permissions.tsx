import { useUser } from "@/contexts/UserContext";
import {
  getNavigationItems,
  hasActionAccess,
  hasPageAccess,
} from "@/lib/role-permissions";

export function usePermissions() {
  const { currentUser } = useUser();

  const userRole = currentUser?.role;

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
