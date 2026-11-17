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

  it("links Lab 2 to /labs/secant-steffensen", () => {
    const second = cards("en")[1];
    expect(second).toContain('href="/labs/secant-steffensen"');
    expect(second).toContain('aria-label="Lab 2: Secant and Steffensen methods. Open lab"');
    expect(second).not.toContain("Coming soon");
  });

  it("links Lab 3 to /labs/halley-chebyshev", () => {
    const third = cards("en")[2];
    expect(third).toContain('href="/labs/halley-chebyshev"');
    expect(third).toContain(
      'aria-label="Lab 3: Halley&#x27;s method and Chebyshev-type methods. Open lab"',
    );
    expect(textOf(third)).toContain("Generalizations of the tangent method");
    expect(third).not.toContain("Coming soon");
  });

  it("shows labs 4–13 as coming soon, without a link", () => {
    const rest = cards("en").slice(3);
    expect(rest).toHaveLength(10);
    rest.forEach((card, i) => {
      expect(textOf(card)).toContain(`Lab ${i + 4}`);
      expect(card).toContain("Coming soon");
      expect(card).toContain('aria-disabled="true"');
      expect(card).not.toContain("<a ");
    });
    expect(count(render(<Hub />), "href=")).toBe(3);
  });

  it("renders in Romanian", () => {
    const html = render(<Hub />, "ro");
    expect(html).toContain("Laborator de metode numerice");
    expect(textOf(html)).toContain("Laboratorul 1");
    expect(textOf(html)).toContain("Metoda tangentei și rădăcinile de ordinul k");
    expect(textOf(html)).toContain("Metoda secantei și metoda lui Steffensen");
    expect(textOf(html)).toContain("Metoda lui Halley și metode de tip Cebîșev");
    expect(textOf(html)).toContain("Generalizări ale metodei tangentei");
    expect(count(html, "În curând")).toBe(10);
    expect(html).not.toContain("Coming soon");
  });
});
