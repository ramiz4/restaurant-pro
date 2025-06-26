import { MemoryRouter } from "react-router-dom";

import { afterEach, describe, expect, it, vi } from "vitest";

import { useUser } from "@/contexts/UserContext";
import { cleanup, render, screen } from "@/test-utils/react-testing-library";

import CreateOrder from "./CreateOrder";

vi.mock("@/contexts/UserContext", () => ({
  useUser: vi.fn(),
}));
const mockedUseUser = vi.mocked(useUser);

vi.mock("@/components/restaurant/RestaurantLayout", () => ({
  RestaurantLayout: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("CreateOrder page", () => {
  it("renders heading", () => {
    const serverUser = {
      name: "Alice",
      email: "alice@test.com",
      role: "server" as const,
      initials: "AL",
      roleColor: "text-green-500",
    };
    const mockContext: ReturnType<typeof useUser> = {
      currentUser: serverUser,
      setCurrentUser: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    };
    mockedUseUser.mockReturnValue(mockContext);
    render(
      <MemoryRouter>
        <CreateOrder />
      </MemoryRouter>,
    );
    expect(screen.getByText("Create Order")).toBeInTheDocument();
  });
});
