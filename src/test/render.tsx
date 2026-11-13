import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Lang } from "@/i18n/config";
import { I18nProvider } from "@/i18n/provider";

/** Renders a component to static HTML inside the i18n provider. For tests: needs no DOM. */
export function render(element: ReactElement, lang: Lang = "en"): string {
  return renderToStaticMarkup(<I18nProvider initialLang={lang}>{element}</I18nProvider>);
}

/** The visible text of an HTML fragment: tags removed, the entities React writes decoded. */
export function textOf(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Number of occurrences of `needle` in `html`. */
export function count(html: string, needle: string): number {
  return html.split(needle).length - 1;
}

/** The HTML of every `<tag …>…</tag>` element, for tags that are not nested in themselves. */
export function elements(html: string, tag: string): string[] {
  return [...html.matchAll(new RegExp(`<${tag}[\\s>][\\s\\S]*?</${tag}>`, "g"))].map((m) => m[0]);
}

/** The TeX source of every KaTeX formula in an HTML fragment, in order. */
export function texOf(html: string): string[] {
  return [
    ...html.matchAll(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/g),
  ].map((m) => textOf(m[1]));
}
