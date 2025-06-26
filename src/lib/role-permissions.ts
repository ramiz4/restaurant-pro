// Role-based access control definitions

export type DefaultUserRole =
  | "Administrator"
  | "Manager"
  | "Server"
  | "Kitchen Staff";

export type UserRole = DefaultUserRole | (string & {});

export interface RoleDefinition {
  permissions: Permission[];
  inherits?: UserRole[];
}

export interface Permission {
  page: string;
  actions?: string[];
}

// Define what each role can access
export const DEFAULT_ROLE_DEFINITIONS: Record<DefaultUserRole, RoleDefinition> =
  {
    Administrator: {
      permissions: [
        { page: "dashboard" },
        {
          page: "orders",
          actions: ["create", "view", "edit", "delete", "payment"],
        },
        { page: "menu", actions: ["create", "view", "edit", "delete"] },
        {
          page: "tables",
          actions: ["create", "view", "edit", "delete", "reserve"],
        },
        {
          page: "inventory",
          actions: ["create", "view", "edit", "delete", "restock"],
        },
        { page: "users", actions: ["create", "view", "edit", "delete"] },
        { page: "reports", actions: ["view", "export"] },
        { page: "schedule", actions: ["create", "view", "edit", "delete"] },
        { page: "audit-log", actions: ["view"] },
      ],
    },
    Manager: {
      permissions: [
        { page: "dashboard" },
        { page: "orders", actions: ["create", "view", "edit", "payment"] },
        { page: "menu", actions: ["create", "view", "edit", "delete"] },
        { page: "tables", actions: ["view", "edit", "reserve"] },
        { page: "inventory", actions: ["view", "edit", "restock"] },
        { page: "users", actions: ["view"] },
        { page: "reports", actions: ["view", "export"] },
        { page: "schedule", actions: ["create", "view", "edit", "delete"] },
      ],
    },
    Server: {
      permissions: [
        { page: "dashboard" },
        { page: "orders", actions: ["create", "view", "edit"] },
        { page: "menu", actions: ["view"] },
        { page: "tables", actions: ["view", "edit", "reserve"] },
        { page: "inventory", actions: ["view"] },
        { page: "schedule", actions: ["view"] },
      ],
    },
    "Kitchen Staff": {
      permissions: [
        { page: "dashboard" },
        { page: "orders", actions: ["view", "edit"] }, // Can update order status
        { page: "menu", actions: ["view"] },
        { page: "inventory", actions: ["view"] },
        { page: "schedule", actions: ["view"] },
      ],
    },
  };

const customRoleDefinitions: Record<string, RoleDefinition> = {};

export function defineRole(role: string, definition: RoleDefinition) {
  customRoleDefinitions[role] = definition;
}

export function resetCustomRoles() {
  for (const key of Object.keys(customRoleDefinitions)) {
    delete customRoleDefinitions[key];
  }
}

function getRoleDefinition(role: UserRole): RoleDefinition | undefined {
  return (
    customRoleDefinitions[role] ||
    DEFAULT_ROLE_DEFINITIONS[role as DefaultUserRole]
  );
}

function mergePermissions(perms: Permission[]): Permission[] {
  const pageMap = new Map<string, Set<string> | undefined>();
  for (const perm of perms) {
    const existing = pageMap.get(perm.page);
    if (!existing) {
      pageMap.set(perm.page, perm.actions ? new Set(perm.actions) : undefined);
    } else if (existing) {
      if (!perm.actions || !existing) {
        pageMap.set(perm.page, undefined);
      } else {
        perm.actions.forEach((a) => existing.add(a));
      }
    }
  }
  return Array.from(pageMap.entries()).map(([page, actions]) => ({
    page,
    actions: actions ? Array.from(actions) : undefined,
  }));
}

function resolvePermissions(
  role: UserRole,
  visited: Set<UserRole>,
): Permission[] {
  if (visited.has(role)) return [];
  visited.add(role);
  const def = getRoleDefinition(role);
  if (!def) return [];
  let perms = [...def.permissions];
  if (def.inherits) {
    for (const parent of def.inherits) {
      perms = perms.concat(resolvePermissions(parent, visited));
    }
  }
  return mergePermissions(perms);
}

function getRolePermissions(role: UserRole): Permission[] {
  return resolvePermissions(role, new Set());
}

// Navigation items with required permissions
export const NAVIGATION_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    requiredPage: "dashboard",
  },
  {
    name: "Orders",
    href: "/orders",
    icon: "ShoppingCart",
    requiredPage: "orders",
  },
  { name: "Menu", href: "/menu", icon: "MenuIcon", requiredPage: "menu" },
  { name: "Tables", href: "/tables", icon: "ChefHat", requiredPage: "tables" },
  {
    name: "Inventory",
    href: "/inventory",
    icon: "Package",
    requiredPage: "inventory",
  },
  { name: "Users", href: "/users", icon: "Users", requiredPage: "users" },
  {
    name: "Reports",
    href: "/reports",
    icon: "BarChart3",
    requiredPage: "reports",
  },
  {
    name: "Schedule",
    href: "/schedule",
    icon: "CalendarCheck2",
    requiredPage: "schedule",
  },
  {
    name: "Audit Log",
    href: "/audit-log",
    icon: "ListChecks",
    requiredPage: "audit-log",
  },
];

// Helper functions
export function hasPageAccess(userRole: UserRole, page: string): boolean {
  const permissions = getRolePermissions(userRole);
  return permissions.some((permission) => permission.page === page);
}

export function hasActionAccess(
  userRole: UserRole,
  page: string,
  action: string,
): boolean {
  const permissions = getRolePermissions(userRole);
  const pagePermission = permissions.find(
    (permission) => permission.page === page,
  );

  if (!pagePermission) return false;
  if (!pagePermission.actions) return true; // If no specific actions defined, allow all

  return pagePermission.actions.includes(action);
}

export function getAccessiblePages(userRole: UserRole): string[] {
  const permissions = getRolePermissions(userRole);
  return permissions.map((permission) => permission.page);
}

export function getNavigationItems(userRole: UserRole) {
  return NAVIGATION_ITEMS.filter((item) =>
    hasPageAccess(userRole, item.requiredPage),
  );
}
