import { describe, expect, it } from "vitest";

import { clamp, cn, pointsWithinDistance, rectanglesOverlap } from "./utils";

describe("cn function", () => {
  it("should merge classes correctly", () => {
    expect(cn("text-red-500", "bg-blue-500")).toBe("text-red-500 bg-blue-500");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    expect(cn("base-class", isActive && "active-class")).toBe(
      "base-class active-class",
    );
  });

  it("should handle false and null conditions", () => {
    const isActive = false;
    expect(cn("base-class", isActive && "active-class", null)).toBe(
      "base-class",
    );
  });

  it("should merge tailwind classes properly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("should work with object notation", () => {
    expect(cn("base", { conditional: true, "not-included": false })).toBe(
      "base conditional",
    );
  });

  it("should detect rectangle overlap", () => {
    const a = { x: 0, y: 0, width: 50, height: 50 };
    const b = { x: 25, y: 25, width: 50, height: 50 };
    expect(rectanglesOverlap(a, b)).toBe(true);
  });

  it("should detect rectangle no overlap", () => {
    const a = { x: 0, y: 0, width: 50, height: 50 };
    const b = { x: 60, y: 60, width: 50, height: 50 };
    expect(rectanglesOverlap(a, b)).toBe(false);
  });

  it("should detect points within distance", () => {
    const a = { x: 0, y: 0 };
    const b = { x: 30, y: 40 };
    expect(pointsWithinDistance(a, b, 60)).toBe(true);
  });

  it("should detect points outside distance", () => {
    const a = { x: 0, y: 0 };
    const b = { x: 100, y: 100 };
    expect(pointsWithinDistance(a, b, 60)).toBe(false);
  });

  it("should clamp values within range", () => {
    expect(clamp(10, 0, 5)).toBe(5);
    expect(clamp(-2, 0, 5)).toBe(0);
    expect(clamp(3, 0, 5)).toBe(3);
  });
});
