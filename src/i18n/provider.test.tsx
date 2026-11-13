import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider, useI18n } from "./provider";

function Probe() {
  const { lang, t } = useI18n();
  return (
    <p lang={lang}>
      {t("app.name")} · {t("hub.lab", { n: 2 })}
    </p>
  );
}

describe("I18nProvider", () => {
  it.each([
    ["en", "Numerical Methods Lab · Lab 2"],
    ["ro", "Laborator de metode numerice · Laboratorul 2"],
  ] as const)("renders its children in the initial language (%s)", (lang, text) => {
    expect(
      renderToStaticMarkup(
        <I18nProvider initialLang={lang}>
          <Probe />
        </I18nProvider>,
      ),
    ).toBe(`<p lang="${lang}">${text}</p>`);
  });

  it("useI18n throws outside the provider", () => {
    expect(() => renderToStaticMarkup(<Probe />)).toThrow(
      "useI18n must be used inside <I18nProvider>",
    );
  });
});
