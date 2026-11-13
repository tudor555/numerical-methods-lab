import { beforeEach, describe, expect, it, vi } from "vitest";
import { LANG_COOKIE } from "@/i18n/config";
import { elements, render, textOf } from "@/test/render";
import NotFound, { generateMetadata } from "./not-found";
import HomePage from "./page";

const cookieJar = vi.hoisted(() => new Map<string, string>());

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieJar.get(name);
      return value === undefined ? undefined : { name, value };
    },
  }),
}));

beforeEach(() => {
  cookieJar.clear();
});

describe("/", () => {
  it("renders the hub", () => {
    const html = render(<HomePage />);
    expect(textOf(elements(html, "h1")[0])).toBe("Numerical Methods Lab");
    expect(elements(html, "li")).toHaveLength(13);
  });
});

describe("not found", () => {
  it("renders the not-found view", () => {
    expect(textOf(render(<NotFound />, "ro"))).toContain("Pagina nu a fost găsită");
  });

  it.each([
    [undefined, "Page not found"],
    ["ro", "Pagina nu a fost găsită"],
  ])("metadata follows the language cookie (%s)", async (lang, title) => {
    if (lang) cookieJar.set(LANG_COOKIE, lang);
    expect((await generateMetadata()).title).toBe(title);
  });
});
