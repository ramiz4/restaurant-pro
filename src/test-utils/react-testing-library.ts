import { ReactElement } from "react";

import { renderToStaticMarkup } from "react-dom/server";
import { expect } from "vitest";

let html = "";

export function render(ui: ReactElement) {
  html = renderToStaticMarkup(ui);
  return {
    container: {
      innerHTML: html,
      querySelectorAll(selector: string) {
        if (selector.startsWith(".")) {
          const className = selector
            .slice(1)
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const regex = new RegExp(
            `class=["'][^"']*\\b${className}\\b[^"']*["']`,
            "g",
          );
          const count = (html.match(regex) || []).length;
          return new Array(count).fill({});
        }
        return [];
      },
    },
  };
}

export function cleanup() {
  html = "";
}

export const screen = {
  getByText(text: string) {
    if (!html.includes(text)) {
      throw new Error(`Unable to find element with text: ${text}`);
    }
    return text;
  },
  queryByText(text: string) {
    return html.includes(text) ? text : null;
  },
};

expect.extend({
  toBeInTheDocument(received: string) {
    const pass = html.includes(received);
    return {
      pass,
      message: () =>
        pass
          ? `expected "${received}" not to be in the document`
          : `expected "${received}" to be in the document`,
    };
  },
});
