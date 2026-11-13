import { describe, expect, it } from "vitest";
import { chooseStartingValue } from "./starting-value";

describe("chooseStartingValue (rule R0)", () => {
  it("picks a when f(a)·f″(a) > 0", () => {
    expect(chooseStartingValue(2, 3, 1, 2)).toBe(1);
    expect(chooseStartingValue(-2, -3, 1, 2)).toBe(1);
  });

  it("picks b when f(a)·f″(a) ≤ 0", () => {
    expect(chooseStartingValue(-1, 6, 1, 2)).toBe(2);
    expect(chooseStartingValue(0, 6, 1, 2)).toBe(2);
  });
});
