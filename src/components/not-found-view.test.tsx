import { describe, expect, it } from "vitest";
import { elements, render, textOf } from "@/test/render";
import { NotFoundView } from "./not-found-view";

describe("NotFoundView", () => {
  it.each([
    ["en", "Page not found", "Back to all labs"],
    ["ro", "Pagina nu a fost găsită", "Înapoi la laboratoare"],
  ] as const)("in %s, explains and links back to the hub", (lang, title, back) => {
    const html = render(<NotFoundView />, lang);
    expect(html).toContain("404");
    expect(textOf(elements(html, "h1")[0])).toBe(title);
    const [link] = elements(html, "a");
    expect(link).toContain('href="/"');
    expect(textOf(link)).toBe(back);
  });
});
