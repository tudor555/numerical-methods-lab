import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_LANG, isLang, LANG_COOKIE, languageCookie, LANGS } from "./config";
import { en, type MessageKey } from "./en";
import { translate } from "./translate";
import { ro } from "./ro";

describe("i18n", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("ro has exactly the keys of en", () => {
    expect(Object.keys(ro).sort()).toEqual(Object.keys(en).sort());
  });

  it("interpolates parameters", () => {
    expect(translate("en", "hub.lab", { n: 3 })).toBe("Lab 3");
    expect(translate("ro", "hub.lab", { n: 3 })).toBe("Laboratorul 3");
  });

  it("leaves a placeholder without a matching parameter as it is", () => {
    expect(translate("en", "hub.lab", { other: 1 })).toBe("Lab {n}");
  });

  it("marks a missing key outside production", () => {
    expect(translate("en", "does.not.exist" as MessageKey)).toBe("⟦does.not.exist⟧");
  });

  it("renders a missing key as the bare key in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(translate("en", "does.not.exist" as MessageKey)).toBe("does.not.exist");
    expect(translate("ro", "app.name")).toBe(ro["app.name"]);
  });
});

describe("isLang", () => {
  it.each(LANGS)("accepts %s", (lang) => {
    expect(isLang(lang)).toBe(true);
  });

  it.each([["EN"], ["de"], [""], [undefined], [null], [1], [["en"]]])("rejects %j", (value) => {
    expect(isLang(value)).toBe(false);
  });

  it("the default language is one of the languages", () => {
    expect(isLang(DEFAULT_LANG)).toBe(true);
  });
});

describe("languageCookie", () => {
  const attributes = (cookie: string) => cookie.split(";").map((part) => part.trim());

  it.each(LANGS)("stores %s for every path, for one year", (lang) => {
    const parts = attributes(languageCookie(lang));
    expect(parts).toContain("path=/");
    expect(parts).toContain(`max-age=${60 * 60 * 24 * 365}`);
    expect(parts).toContain("samesite=lax");
  });

  it.each(LANGS)("round-trips %s: the server's isLang accepts the value it writes", (lang) => {
    const [pair] = attributes(languageCookie(lang));
    const [name, value] = pair.split("=");
    expect(name).toBe(LANG_COOKIE);
    expect(isLang(value)).toBe(true);
    expect(value).toBe(lang);
  });
});
