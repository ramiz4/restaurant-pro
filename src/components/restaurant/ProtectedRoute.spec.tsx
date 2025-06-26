import type { ReactElement } from "react";

import { MemoryRouter, Route, Routes } from "react-router-dom";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useUser } from "@/contexts/UserContext";
import { usePermissions } from "@/hooks/use-permissions";

import { ProtectedRoute } from "./ProtectedRoute";

vi.mock("@/contexts/UserContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/hooks/use-permissions", () => ({
  usePermissions: vi.fn(),
}));

const mockedUseUser = vi.mocked(useUser);
const mockedUsePermissions = vi.mocked(usePermissions);

afterEach(() => {
  cleanup();
});

function renderWithRouter(ui: ReactElement) {
  return render(
    <MemoryRouter initialEntries={["/orders"]}>
      <Routes>
        <Route path="/orders" element={ui} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  it("shows skeleton while loading user context", () => {
    mockedUseUser().mockReturnValue({ isLoading: true });
    mockedUsePermissions().mockReturnValue({
      currentUser: null,
      hasPageAccess: vi.fn(),
    });

    const { container } = renderWithRouter(
      <ProtectedRoute requiredPage="orders">
        <div>Orders Page</div>
      </ProtectedRoute>,
    );

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0,
    );
    expect(screen.queryByText("Orders Page")).toBeNull();
  });

  it("redirects to login when no user is present", () => {
    mockedUseUser().mockReturnValue({ isLoading: false });
    mockedUsePermissions().mockReturnValue({
      currentUser: null,
      hasPageAccess: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute requiredPage="orders">
        <div>Orders Page</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Orders Page")).toBeNull();
  });

  it("redirects to dashboard when user lacks page access", () => {
    mockedUseUser().mockReturnValue({ isLoading: false });
    mockedUsePermissions().mockReturnValue({
      currentUser: { role: "Server" },
      hasPageAccess: () => false,
    });

    renderWithRouter(
      <ProtectedRoute requiredPage="users">
        <div>Users Page</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
    expect(screen.queryByText("Users Page")).toBeNull();
  });
});
