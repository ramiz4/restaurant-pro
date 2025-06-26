import { MemoryRouter } from "react-router-dom";

import { afterEach, describe, expect, it, vi } from "vitest";

import { useUser } from "@/contexts/UserContext";
import { cleanup, render } from "@/test-utils/react-testing-library";

import Schedule from "./Schedule";

vi.mock("@/contexts/UserContext", () => ({
  useUser: vi.fn(),
}));
const mockedUseUser = vi.mocked(useUser);

vi.mock("@/components/restaurant/RestaurantLayout", () => ({
  RestaurantLayout: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/contexts/AuditLogContext", () => ({
  useAuditLog: () => ({ recordAction: vi.fn() }),
}));

afterEach(() => {
  cleanup();
});

describe("Schedule page", () => {
  it("renders heading", () => {
    const adminUser = {
      name: "Admin",
      email: "admin@example.com",
      role: "Administrator" as const,
      initials: "AD",
      roleColor: "text-red-500",
    };
    const mockContext: ReturnType<typeof useUser> = {
      currentUser: adminUser,
      setCurrentUser: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    };
    mockedUseUser.mockReturnValue(mockContext);
    const { container } = render(
      <MemoryRouter>
        <Schedule />
      </MemoryRouter>,
    );
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
});
