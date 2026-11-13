/** Iterate values: up to 15 significant digits, in exponent form below 1e-6 and from 1e15 up. */
export function formatValue(x: number): string {
  if (!Number.isFinite(x)) return String(x);
  if (x === 0) return "0";
  const abs = Math.abs(x);
  if (abs >= 1e15 || abs < 1e-6) return x.toExponential(10).replace(/\.?0+e/, "e");
  return String(Number(x.toPrecision(15)));
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
