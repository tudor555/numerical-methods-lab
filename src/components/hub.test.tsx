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

  it("links Lab 4 to /labs/third-order", () => {
    const fourth = cards("en")[3];
    expect(fourth).toContain('href="/labs/third-order"');
    expect(fourth).toContain('aria-label="Lab 4: Third-order iterative methods. Open lab"');
    expect(textOf(fourth)).toContain("Combined tangent method and third-order square roots");
    expect(fourth).not.toContain("Coming soon");
  });

  it("links Lab 5 to /labs/newton-systems", () => {
    const fifth = cards("en")[4];
    expect(fifth).toContain('href="/labs/newton-systems"');
    expect(fifth).toContain('aria-label="Lab 5: Newton&#x27;s method for 2×2 systems. Open lab"');
    expect(textOf(fifth)).toContain("Newton and modified Newton for nonlinear systems");
    expect(fifth).not.toContain("Coming soon");
  });

  it("links Lab 6 to /labs/nonlinear-systems", () => {
    const sixth = cards("en")[5];
    expect(sixth).toContain('href="/labs/nonlinear-systems"');
    expect(sixth).toContain(
      'aria-label="Lab 6: Successive approximations and Gauss–Seidel. Open lab"',
    );
    expect(textOf(sixth)).toContain("Fixed-point iteration for 2-D and 3-D nonlinear systems");
    expect(sixth).not.toContain("Coming soon");
  });

  it("links Lab 7 to /labs/euler", () => {
    const seventh = cards("en")[6];
    expect(seventh).toContain('href="/labs/euler"');
    expect(seventh).toContain('aria-label="Lab 7: Euler-type methods. Open lab"');
    expect(textOf(seventh)).toContain("Euler, modified Euler and Euler–Heun for y′ = f(x, y)");
    expect(seventh).not.toContain("Coming soon");
  });

  it("shows labs 8–13 as coming soon, without a link", () => {
    const rest = cards("en").slice(7);
    expect(rest).toHaveLength(6);
    rest.forEach((card, i) => {
      expect(textOf(card)).toContain(`Lab ${i + 8}`);
      expect(card).toContain("Coming soon");
      expect(card).toContain('aria-disabled="true"');
      expect(card).not.toContain("<a ");
    });
    expect(count(render(<Hub />), "href=")).toBe(7);
  });

  it("renders in Romanian", () => {
    const html = render(<Hub />, "ro");
    expect(html).toContain("Laborator de metode numerice");
    expect(textOf(html)).toContain("Laboratorul 1");
    expect(textOf(html)).toContain("Metoda tangentei și rădăcinile de ordinul k");
    expect(textOf(html)).toContain("Metoda secantei și metoda lui Steffensen");
    expect(textOf(html)).toContain("Metoda lui Halley și metode de tip Cebîșev");
    expect(textOf(html)).toContain("Generalizări ale metodei tangentei");
    expect(textOf(html)).toContain("Metode iterative de ordinul trei");
    expect(textOf(html)).toContain(
      "Metoda combinată a tangentei și calculul radicalilor cu metoda de ordinul 3",
    );
    expect(textOf(html)).toContain("Aproximații succesive și metoda Gauss–Seidel");
    expect(textOf(html)).toContain("Metode de tip Euler");
    expect(count(html, "În curând")).toBe(6);
    expect(html).not.toContain("Coming soon");
  });
});
