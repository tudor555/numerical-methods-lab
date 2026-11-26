import { describe, expect, it } from "vitest";
import { render, textOf } from "@/test/render";
import { cauchyErrorKey, runErrorKey, StatusBadge, systemErrorKey } from "./status";

describe("StatusBadge", () => {
  it.each([
    ["converged", "lucide-circle-check", "text-success", "Converged", "Converge"],
    [
      "max-iterations",
      "lucide-triangle-alert",
      "text-warning",
      "Max iterations reached",
      "Numărul maxim de iterații a fost atins",
    ],
    ["error", "lucide-octagon-x", "text-error", "Error", "Eroare"],
    ["completed", "lucide-circle-check", "text-success", "Completed", "Calcul încheiat"],
  ] as const)("%s has its own icon, color and text", (status, icon, color, en, ro) => {
    const html = render(<StatusBadge status={status} />);
    expect(html).toContain(icon);
    expect(html).toContain(color);
    expect(html).toContain('aria-hidden="true"');
    expect(textOf(html)).toBe(en);
    expect(textOf(render(<StatusBadge status={status} />, "ro"))).toBe(ro);
  });

  it("never uses the same icon for two statuses", () => {
    const icons = (["converged", "max-iterations", "error"] as const).map(
      (status) => render(<StatusBadge status={status} />).match(/lucide-[a-z-]+/)?.[0],
    );
    expect(new Set(icons).size).toBe(3);
  });
});

describe("error message keys", () => {
  it("uses the node wording for a Cauchy run", () => {
    expect(cauchyErrorKey("diverged")).toBe("run.cauchyError.diverged");
    expect(cauchyErrorKey("overflow")).toBe("run.cauchyError.overflow");
    expect(cauchyErrorKey(undefined)).toBe("run.cauchyError.undefined-value");
  });

  it("uses the shared scalar wording unless the method has its own", () => {
    expect(runErrorKey("zero-derivative")).toBe("run.error.zero-derivative");
    expect(
      runErrorKey("zero-denominator", { "zero-denominator": "lab3.method.halley.failure" }),
    ).toBe("lab3.method.halley.failure");
    expect(runErrorKey(undefined)).toBe("run.error.undefined-value");
  });

  it.each(["zero-jacobian", "undefined-value", "overflow", "diverged"] as const)(
    "gives a system run's %s the wording that names the point",
    (code) => {
      expect(systemErrorKey(code)).toBe(`run.systemError.${code}`);
    },
  );

  it("falls back to undefined-value for a system run with no code", () => {
    expect(systemErrorKey(undefined)).toBe("run.systemError.undefined-value");
    expect(systemErrorKey(undefined, true)).toBe("run.system3Error.undefined-value");
  });

  it.each(["undefined-value", "overflow", "diverged"] as const)(
    "gives a run with three unknowns its own %s wording, naming (xₙ, yₙ, zₙ)",
    (code) => {
      expect(systemErrorKey(code, true)).toBe(`run.system3Error.${code}`);
    },
  );
});
