export const LANGS = ["en", "ro"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";
/** The language lives in a cookie so the server can render the first page in it, with no flash of English. */
export const LANG_COOKIE = "lang";

const ONE_YEAR = 60 * 60 * 24 * 365;

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

/**
 * The `document.cookie` string that stores the language for a year. `path=/` makes every page
 * send it, so the server reads the same language that the client wrote.
 */
export function languageCookie(lang: Lang): string {
  return `${LANG_COOKIE}=${lang}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}
