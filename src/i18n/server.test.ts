import { beforeEach, describe, expect, it, vi } from "vitest";
import { LANG_COOKIE } from "./config";
import { getRequestLang } from "./server";

const cookieJar = vi.hoisted(() => new Map<string, string>());

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieJar.get(name);
      return value === undefined ? undefined : { name, value };
    },
  }),
}));

describe("getRequestLang", () => {
  beforeEach(() => {
    cookieJar.clear();
  });

  it("returns the language stored in the cookie", async () => {
    cookieJar.set(LANG_COOKIE, "ro");
    await expect(getRequestLang()).resolves.toBe("ro");
  });

  it("falls back to en without a cookie", async () => {
    await expect(getRequestLang()).resolves.toBe("en");
  });

  it.each(["de", "RO", ""])("falls back to en for an invalid value %j", async (value) => {
    cookieJar.set(LANG_COOKIE, value);
    await expect(getRequestLang()).resolves.toBe("en");
  });
});
