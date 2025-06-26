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
    mockedUseUser.mockReturnValue({
      currentUser: { role: "Administrator" },
      setCurrentUser: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    } as any);
    const { container } = render(
      <MemoryRouter>
        <Schedule />
      </MemoryRouter>,
    );
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
});
