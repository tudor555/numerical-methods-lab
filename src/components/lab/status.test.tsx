import { describe, expect, it } from "vitest";
import { render, textOf } from "@/test/render";
import { StatusBadge } from "./status";

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
