import { describe, expect, it } from "vitest";
import { count, elements, render, textOf } from "@/test/render";
import { Hub } from "./hub";

describe("Hub", () => {
  const cards = (lang: "en" | "ro") => elements(render(<Hub />, lang), "li");

  it("shows one card per lab, 13 in all", () => {
    expect(cards("en")).toHaveLength(13);
  });

  it("links Lab 1 to /labs/newton", () => {
    const [first] = cards("en");
    expect(first).toContain('href="/labs/newton"');
    expect(first).toContain('aria-label="Lab 1: Newton&#x27;s method and k-th roots. Open lab"');
    expect(first).not.toContain("Coming soon");
  });

  it("shows labs 2–13 as coming soon, without a link", () => {
    const rest = cards("en").slice(1);
    rest.forEach((card, i) => {
      expect(textOf(card)).toContain(`Lab ${i + 2}`);
      expect(card).toContain("Coming soon");
      expect(card).toContain('aria-disabled="true"');
      expect(card).not.toContain("<a ");
    });
    expect(count(render(<Hub />), "href=")).toBe(1);
  });

  it("renders in Romanian", () => {
    const html = render(<Hub />, "ro");
    expect(html).toContain("Laborator de metode numerice");
    expect(textOf(html)).toContain("Laboratorul 1");
    expect(textOf(html)).toContain("Metoda tangentei și rădăcinile de ordinul k");
    expect(count(html, "În curând")).toBe(12);
    expect(html).not.toContain("Coming soon");
  });
});
