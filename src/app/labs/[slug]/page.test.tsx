import { beforeEach, describe, expect, it, vi } from "vitest";
import { LANG_COOKIE } from "@/i18n/config";
import { render, textOf } from "@/test/render";
import LabRoute, { generateMetadata } from "./page";

const cookieJar = vi.hoisted(() => new Map<string, string>());

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieJar.get(name);
      return value === undefined ? undefined : { name, value };
    },
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/components/lab/plotly-chart", () => ({
  PlotlyChart: ({ title }: { title: string }) => <figure>{title}</figure>,
}));

const props = (slug: string) => ({ params: Promise.resolve({ slug }) });

beforeEach(() => {
  cookieJar.clear();
});

describe("/labs/[slug]", () => {
  it.each([
    ["newton", "Newton's method and k-th roots"],
    ["secant-steffensen", "Secant and Steffensen methods"],
    ["halley-chebyshev", "Halley's method and Chebyshev-type methods"],
    ["third-order", "Third-order iterative methods"],
  ])("renders the lab page for the ready lab /labs/%s", async (slug, title) => {
    const element = await LabRoute(props(slug));
    const html = render(element);
    expect(textOf(html)).toContain(title);
    expect(html).toContain('id="field-f"');
  });

  it.each([
    ["an unknown slug", "nope"],
    ["a lab that is not built yet", "newton-systems"],
  ])("calls notFound() for %s", async (_, slug) => {
    const { notFound } = await import("next/navigation");
    vi.mocked(notFound).mockClear();
    await expect(LabRoute(props(slug))).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalledTimes(1);
  });
});

describe("/labs/[slug] metadata", () => {
  it("is in English by default", async () => {
    await expect(generateMetadata(props("newton"))).resolves.toEqual({
      title: "Lab 1: Newton's method and k-th roots",
      description: "Tangent method, k-th root of c, successive approximations",
    });
  });

  it("names Lab 2 in its metadata", async () => {
    await expect(generateMetadata(props("secant-steffensen"))).resolves.toEqual({
      title: "Lab 2: Secant and Steffensen methods",
      description: "Derivative-free methods for f(x) = 0",
    });
  });

  it("names Lab 3 in its metadata, in both languages", async () => {
    await expect(generateMetadata(props("halley-chebyshev"))).resolves.toEqual({
      title: "Lab 3: Halley's method and Chebyshev-type methods",
      description: "Generalizations of the tangent method",
    });
    cookieJar.set(LANG_COOKIE, "ro");
    await expect(generateMetadata(props("halley-chebyshev"))).resolves.toEqual({
      title: "Laboratorul 3: Metoda lui Halley și metode de tip Cebîșev",
      description: "Generalizări ale metodei tangentei",
    });
  });

  it("names Lab 4 in its metadata, in both languages", async () => {
    await expect(generateMetadata(props("third-order"))).resolves.toEqual({
      title: "Lab 4: Third-order iterative methods",
      description: "Combined tangent method and third-order square roots",
    });
    cookieJar.set(LANG_COOKIE, "ro");
    await expect(generateMetadata(props("third-order"))).resolves.toEqual({
      title: "Laboratorul 4: Metode iterative de ordinul trei",
      description: "Metoda combinată a tangentei și calculul radicalilor cu metoda de ordinul 3",
    });
  });

  it("is in Romanian when the language cookie is ro", async () => {
    cookieJar.set(LANG_COOKIE, "ro");
    await expect(generateMetadata(props("newton"))).resolves.toEqual({
      title: "Laboratorul 1: Metoda tangentei și rădăcinile de ordinul k",
      description: "Metoda lui Newton, rădăcini de ordinul k, aproximații succesive",
    });
  });

  it("is empty for a slug that is not a ready lab", async () => {
    await expect(generateMetadata(props("newton-systems"))).resolves.toEqual({});
  });
});
