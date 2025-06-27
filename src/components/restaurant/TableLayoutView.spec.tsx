import { afterEach, describe, expect, it } from "vitest";

import { cleanup, render, screen } from "@/test-utils/react-testing-library";

import { TableLayoutView } from "./TableLayoutView";

afterEach(() => {
  cleanup();
});

describe("TableLayoutView", () => {
  it("renders add table button", () => {
    render(<TableLayoutView />);
    expect(screen.getByText("Add Table")).toBeInTheDocument();
  });
});
