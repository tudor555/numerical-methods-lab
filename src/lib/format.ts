/** Iterate values: up to 15 significant digits, in exponent form below 1e-6 and from 1e15 up. */
export function formatValue(x: number): string {
  if (!Number.isFinite(x)) return String(x);
  if (x === 0) return "0";
  const abs = Math.abs(x);
  if (abs >= 1e15 || abs < 1e-6) return x.toExponential(10).replace(/\.?0+e/, "e");
  return String(Number(x.toPrecision(15)));
}

/**
 * A point (x, y) or (x, y, z) for display, each part through {@link formatValue}: `(1.23, 1.66)`,
 * or `(1.23; 1.66)` in RO.
 */
export function formatPoint(values: readonly number[], separator = ","): string {
  return `(${values.map(formatValue).join(`${separator} `)})`;
}

/** The components of a point for {@link formatPoint}: [x, y] or [x, y, z]; NaNs when it is missing. */
export function pointValues(point?: { x: number; y: number; z?: number }): number[] {
  if (!point) return [Number.NaN, Number.NaN];
  return point.z === undefined ? [point.x, point.y] : [point.x, point.y, point.z];
}

/** Small quantities such as |xₙ − xₙ₋₁| or f(xₙ), in scientific notation. */
export function formatSmall(x: number | null): string {
  if (x === null) return "—";
  if (x === 0) return "0";
  return x.toExponential(3);
}

/** ε as TeX for headers: 1e-4 → `10^{-4}`. Values that are not a power of ten print as they are. */
export function formatEpsTex(eps: number): string {
  const exponent = Math.log10(eps);
  return Number.isInteger(exponent) ? `10^{${exponent}}` : String(eps);
}

const SUPERSCRIPT: Record<string, string> = {
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

/** A field limit for a message: large or tiny powers of ten as 10⁶ or −10⁶ or 10⁻¹⁵, anything else as it is. */
export function formatLimit(x: number): string {
  const abs = Math.abs(x);
  const exponent = Math.log10(abs);
  if (!Number.isInteger(exponent) || (abs < 1e6 && abs > 1e-3)) return String(x);
  const power = `10${[...String(exponent)].map((d) => SUPERSCRIPT[d]).join("")}`;
  return x < 0 ? `−${power}` : power;
}
