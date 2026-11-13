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
  it("renders the lab page for a ready lab", async () => {
    const element = await LabRoute(props("newton"));
    const html = render(element);
    expect(textOf(html)).toContain("Newton's method and k-th roots");
    expect(html).toContain('id="field-f"');
  });

  it.each([
    ["an unknown slug", "nope"],
    ["a lab that is not built yet", "secant-steffensen"],
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

  it("is in Romanian when the language cookie is ro", async () => {
    cookieJar.set(LANG_COOKIE, "ro");
    await expect(generateMetadata(props("newton"))).resolves.toEqual({
      title: "Laboratorul 1: Metoda tangentei și rădăcinile de ordinul k",
      description: "Metoda lui Newton, rădăcini de ordinul k, aproximații succesive",
    });
  });

  it("is empty for a slug that is not a ready lab", async () => {
    await expect(generateMetadata(props("secant-steffensen"))).resolves.toEqual({});
  });
});
