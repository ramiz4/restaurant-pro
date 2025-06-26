import { afterEach, describe, expect, it } from "vitest";

import { cleanup, render, screen } from "@/test-utils/react-testing-library";

import OnlineOrder from "./OnlineOrder";

afterEach(() => {
  cleanup();
});

describe("OnlineOrder page", () => {
  it("renders heading", () => {
    render(<OnlineOrder />);
    expect(screen.getByText("Online Ordering")).toBeInTheDocument();
  });
});
