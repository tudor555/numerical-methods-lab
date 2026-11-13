/** Rule R0 from the lab: start at x₀ = a if f(a)·f″(a) > 0, otherwise at x₀ = b. */
export function chooseStartingValue(
  fAtA: number,
  secondDerivativeAtA: number,
  a: number,
  b: number,
): number {
  return fAtA * secondDerivativeAtA > 0 ? a : b;
}
