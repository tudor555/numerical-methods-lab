import { describe, expect, it } from "vitest";
import { elements, render, textOf } from "@/test/render";
import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("shows the logo and the app name, linked to the hub", () => {
    const html = render(<SiteHeader />);
    const [home] = elements(html, "a");
    expect(home).toContain('href="/"');
    expect(home).toMatch(/<img[^>]*src="[^"]*logo\.png/);
    expect(textOf(home)).toBe("Numerical Methods Lab");
  });

  it.each([
    ["en", "true", "false", "Language"],
    ["ro", "false", "true", "Limba"],
  ] as const)(
    "in %s, presses the current language's button",
    (lang, enPressed, roPressed, label) => {
      const html = render(<SiteHeader />, lang);
      const buttons = elements(html, "button");
      expect(buttons).toHaveLength(2);
      expect(buttons[0]).toContain('lang="en"');
      expect(buttons[0]).toContain(`aria-pressed="${enPressed}"`);
      expect(textOf(buttons[0])).toBe("en");
      expect(buttons[1]).toContain('lang="ro"');
      expect(buttons[1]).toContain(`aria-pressed="${roPressed}"`);
      expect(textOf(buttons[1])).toBe("ro");
      expect(html).toContain(`role="group" aria-label="${label}"`);
    },
  );
});
