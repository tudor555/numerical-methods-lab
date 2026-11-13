import { describe, expect, it } from "vitest";
import { lab1 } from "@/labs/lab-1";
import type { FieldErrors, FieldValues, MethodDefinition } from "@/labs/types";
import { count, elements, render, textOf } from "@/test/render";
import { MethodForm } from "./method-form";

const noop = () => {};

function form(
  method: MethodDefinition,
  {
    values = method.defaults,
    errors = {},
    activePreset = null,
    lang = "en",
  }: {
    values?: FieldValues;
    errors?: FieldErrors;
    activePreset?: string | null;
    lang?: "en" | "ro";
  } = {},
): string {
  return render(
    <MethodForm
      method={method}
      presets={lab1.presets.filter((p) => p.methodId === method.id)}
      activePreset={activePreset}
      values={values}
      errors={errors}
      onChange={noop}
      onPreset={noop}
      onRun={noop}
    />,
    lang,
  );
}

const [newton, kthRoot, fixedPoint] = lab1.methods;
const buttons = (html: string) => elements(html, "button");
const submit = (html: string) => buttons(html).find((b) => b.includes('type="submit"')) ?? "";
/** The block of one text field: from its label to the next field. */
const field = (html: string, id: string) => {
  const start = html.indexOf(`<label for="field-${id}"`);
  if (start < 0) return "";
  const next = html.indexOf("<label ", start + 1);
  return html.slice(start, next < 0 ? undefined : next);
};

describe("MethodForm presets", () => {
  it("shows the method's presets and presses only the active one", () => {
    const html = form(newton, { activePreset: "ex2-manual-start" });
    const presets = buttons(html).filter((b) => b.includes("min-h-8"));
    expect(presets.map(textOf)).toEqual([
      "Ex. 1: x³ − x − 1 = 0 on [1, 2]",
      "Ex. 2: x⁵ − 5x + 1 = 0, R0 on [−1, 1]",
      "Ex. 2: x⁵ − 5x + 1 = 0, x₀ = 0",
      "Ex. 3: Kepler, x = sin x + 0.25",
    ]);
    expect(presets.map((b) => b.includes('aria-pressed="true"'))).toEqual([
      false,
      false,
      true,
      false,
    ]);
  });

  it("presses no preset after an edit", () => {
    const html = form(kthRoot);
    expect(count(html, 'aria-pressed="true"')).toBe(0);
  });
});

describe("MethodForm fields", () => {
  it("shows a hint under each valid field", () => {
    const html = form(newton);
    const f = field(html, "f");
    expect(f).toContain('aria-describedby="field-f-hint"');
    expect(f).not.toContain("aria-invalid=");
    expect(textOf(f)).toContain("Variables: x. Functions such as sin");
    expect(textOf(field(html, "a"))).toContain("A number or a constant expression");
  });

  it("replaces the hint with the field error and its icon", () => {
    const errors: FieldErrors = {
      f: { key: "field.error.unknown-symbol", params: { name: "y", allowed: "x, pi, e" } },
    };
    const f = field(form(newton, { errors }), "f");
    expect(f).toContain('aria-invalid="true"');
    expect(f).toContain('aria-describedby="field-f-message"');
    expect(f).toContain('<p id="field-f-message" class="text-error');
    expect(f).toContain("lucide-circle-alert");
    expect(textOf(f)).toContain("Unknown symbol “y”. Allowed: x, pi, e.");
    expect(textOf(f)).not.toContain("Variables:");
  });

  it("shows the field error in Romanian", () => {
    const errors: FieldErrors = { eps: { key: "field.error.positive" } };
    expect(textOf(field(form(newton, { errors, lang: "ro" }), "eps"))).toContain(
      "Valoarea trebuie să fie strict pozitivă.",
    );
  });

  it("offers Derive from f only on fields that can be derived", () => {
    const r0 = form(newton);
    expect(field(r0, "df")).toContain('aria-label="Derive from f"');
    expect(field(r0, "dda")).toContain('aria-label="Derive from f"');
    for (const id of ["f", "a", "b", "eps", "maxIter"]) {
      expect(field(r0, id)).not.toContain("Derive from f");
    }
    expect(form(kthRoot)).not.toContain("Derive from f");
    expect(form(fixedPoint)).not.toContain("Derive from f");
  });

  it("with rule R0, shows dda and hides x₀", () => {
    const html = form(newton, { values: { ...newton.defaults, x0Mode: "r0" } });
    expect(html).toContain('id="field-dda"');
    expect(html).not.toContain('id="field-x0"');
    const choice = buttons(html).filter((b) => b.includes("px-4 py-1"));
    expect(choice.map(textOf)).toEqual(["Rule R0", "Enter x₀"]);
    expect(choice.map((b) => b.includes('aria-pressed="true"'))).toEqual([true, false]);
  });

  it("with a manual x₀, shows x₀ and hides dda (and its derive button)", () => {
    const html = form(newton, { values: { ...newton.defaults, x0Mode: "manual", x0: "0" } });
    expect(html).toContain('id="field-x0"');
    expect(html).not.toContain('id="field-dda"');
    expect(count(html, 'aria-label="Derive from f"')).toBe(1);
  });
});

describe("MethodForm run button", () => {
  it("is enabled without errors, with no blocked message", () => {
    const html = form(newton);
    expect(submit(html)).not.toContain("disabled=");
    expect(textOf(submit(html))).toBe("Run");
    expect(html).not.toContain("Fix the highlighted fields");
  });

  it("is disabled with the blocked message while a field has an error", () => {
    const html = form(newton, { errors: { eps: { key: "field.error.positive" } } });
    expect(submit(html)).toContain('disabled=""');
    expect(textOf(html)).toContain("Fix the highlighted fields to run.");
  });

  it("uses the Romanian wording", () => {
    const html = form(newton, { errors: { eps: { key: "field.error.positive" } }, lang: "ro" });
    expect(textOf(submit(html))).toBe("Calculează");
    expect(textOf(html)).toContain("Corectează câmpurile marcate ca să poți calcula.");
    expect(textOf(html)).toContain("Exemple numerice");
  });
});
