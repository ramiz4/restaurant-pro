import { ReactElement } from "react";

import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { expect } from "vitest";

let root: ReturnType<typeof createRoot> | null = null;
let container: HTMLElement | null = null;

export function render(ui: ReactElement) {
  cleanup();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root!.render(ui);
  });
  return { container };
}

export function cleanup() {
  if (root) {
    act(() => {
      root!.unmount();
    });
    root = null;
  }
  if (container) {
    document.body.removeChild(container);
    container = null;
  }
}

export const screen = {
  getByText(text: string) {
    const el = Array.from((container ?? document).querySelectorAll("*")).find(
      (node) => (node as HTMLElement).textContent === text,
    ) as HTMLElement | undefined;
    if (!el) {
      throw new Error(`Unable to find element with text: ${text}`);
    }
    return el;
  },
  queryByText(text: string) {
    return Array.from((container ?? document).querySelectorAll("*")).find(
      (node) => (node as HTMLElement).textContent === text,
    ) as HTMLElement | null;
  },
};

expect.extend({
  toBeInTheDocument(received: HTMLElement) {
    const pass = document.body.contains(received);
    return {
      pass,
      message: () =>
        pass
          ? "expected element not to be in the document"
          : "expected element to be in the document",
    };
  },
});
