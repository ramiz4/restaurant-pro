import { afterEach, describe, expect, it, vi } from "vitest";

import { cleanup, render, screen } from "@/test-utils/react-testing-library";

import { TableLayoutView } from "./TableLayoutView";

vi.mock("@/hooks/use-permissions", () => ({
  usePermissions: () => ({
    hasPageAccess: () => true,
    hasActionAccess: () => true,
    getNavigationItems: () => [],
    userRole: "Administrator",
    currentUser: { role: "Administrator" },
  }),
}));

afterEach(() => {
  cleanup();
});

describe("TableLayoutView", () => {
  it("renders add table button", () => {
    render(<TableLayoutView />);
    expect(screen.getByText("Add Table")).toBeInTheDocument();
  });
});
