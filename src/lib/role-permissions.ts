// Role-based access control definitions

export type UserRole = "Administrator" | "Manager" | "Server" | "Kitchen Staff";

export interface Permission {
  page: string;
  actions?: string[];
}

// Define what each role can access
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  Administrator: [
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
    { page: "audit-log", actions: ["view"] },
  ],
  Manager: [
    { page: "dashboard" },
    { page: "orders", actions: ["create", "view", "edit", "payment"] },
    { page: "menu", actions: ["create", "view", "edit", "delete"] },
    { page: "tables", actions: ["view", "edit", "reserve"] },
    { page: "inventory", actions: ["view", "edit", "restock"] },
    { page: "users", actions: ["view"] },
    { page: "reports", actions: ["view", "export"] },
  ],
  Server: [
    { page: "dashboard" },
    { page: "orders", actions: ["create", "view", "edit"] },
    { page: "menu", actions: ["view"] },
    { page: "tables", actions: ["view", "edit", "reserve"] },
    { page: "inventory", actions: ["view"] },
  ],
  "Kitchen Staff": [
    { page: "dashboard" },
    { page: "orders", actions: ["view", "edit"] }, // Can update order status
    { page: "menu", actions: ["view"] },
    { page: "inventory", actions: ["view"] },
  ],
};

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
    name: "Audit Log",
    href: "/audit-log",
    icon: "ListChecks",
    requiredPage: "audit-log",
  },
];

// Helper functions
export function hasPageAccess(userRole: UserRole, page: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions.some((permission) => permission.page === page);
}

export function hasActionAccess(
  userRole: UserRole,
  page: string,
  action: string,
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  const pagePermission = permissions.find(
    (permission) => permission.page === page,
  );

  if (!pagePermission) return false;
  if (!pagePermission.actions) return true; // If no specific actions defined, allow all

  return pagePermission.actions.includes(action);
}

export function getAccessiblePages(userRole: UserRole): string[] {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions.map((permission) => permission.page);
}

export function getNavigationItems(userRole: UserRole) {
  return NAVIGATION_ITEMS.filter((item) =>
    hasPageAccess(userRole, item.requiredPage),
  );
}
