import { afterEach, describe, expect, it } from "vitest";

import {
  UserRole,
  defineRole,
  getNavigationItems,
  hasActionAccess,
  hasPageAccess,
  resetCustomRoles,
} from "./role-permissions";

// Test suites for role-based permissions

describe("hasPageAccess", () => {
  it("Administrator should access all pages", () => {
    const pages = [
      "dashboard",
      "orders",
      "menu",
      "tables",
      "inventory",
      "users",
      "reports",
      "audit-log",
    ];
    pages.forEach((page) => {
      expect(hasPageAccess("Administrator", page)).toBe(true);
    });
  });

  it("Server should not access users or reports pages", () => {
    expect(hasPageAccess("Server", "users")).toBe(false);
    expect(hasPageAccess("Server", "reports")).toBe(false);
  });

  it("Kitchen Staff should not access tables page", () => {
    expect(hasPageAccess("Kitchen Staff", "tables")).toBe(false);
  });
});

describe("hasActionAccess", () => {
  it("Administrator can delete orders", () => {
    expect(hasActionAccess("Administrator", "orders", "delete")).toBe(true);
  });

  it("Manager cannot delete orders", () => {
    expect(hasActionAccess("Manager", "orders", "delete")).toBe(false);
  });

  it("Server cannot process payments", () => {
    expect(hasActionAccess("Server", "orders", "payment")).toBe(false);
  });

  it("Kitchen Staff can edit orders but not create", () => {
    expect(hasActionAccess("Kitchen Staff", "orders", "edit")).toBe(true);
    expect(hasActionAccess("Kitchen Staff", "orders", "create")).toBe(false);
  });
});

describe("getNavigationItems", () => {
  const getPages = (role: UserRole) =>
    getNavigationItems(role).map((item) => item.requiredPage);

  it("returns all pages for Administrator", () => {
    expect(getPages("Administrator")).toEqual([
      "dashboard",
      "orders",
      "menu",
      "tables",
      "table-layout",
      "inventory",
      "users",
      "reports",
      "schedule",
      "audit-log",
    ]);
  });

  it("returns limited pages for Server", () => {
    expect(getPages("Server")).toEqual([
      "dashboard",
      "orders",
      "menu",
      "tables",
      "table-layout",
      "inventory",
      "schedule",
    ]);
  });

  it("returns limited pages for Kitchen Staff", () => {
    expect(getPages("Kitchen Staff")).toEqual([
      "dashboard",
      "orders",
      "menu",
      "inventory",
      "schedule",
    ]);
  });
});

describe("custom roles", () => {
  afterEach(() => {
    resetCustomRoles();
  });

  it("allows creating a role with no inheritance", () => {
    defineRole("Guest", { permissions: [{ page: "dashboard" }] });
    expect(hasPageAccess("Guest", "dashboard")).toBe(true);
    expect(hasPageAccess("Guest", "orders")).toBe(false);
  });

  it("supports permission inheritance", () => {
    defineRole("Supervisor", {
      inherits: ["Server"],
      permissions: [{ page: "reports", actions: ["view"] }],
    });
    expect(hasPageAccess("Supervisor", "orders")).toBe(true); // from Server
    expect(hasActionAccess("Supervisor", "reports", "view")).toBe(true);
    expect(hasActionAccess("Supervisor", "reports", "export")).toBe(false);
  });
});
