import { describe, expect, it } from "vitest";
import { formatEpsTex, formatSmall, formatValue } from "./format";

describe("formatValue", () => {
  it("prints ordinary values in plain decimal form", () => {
    expect(formatValue(1.5)).toBe("1.5");
    expect(formatValue(-42)).toBe("-42");
    expect(formatValue(123456.789)).toBe("123456.789");
  });

  it("keeps at most 15 significant digits", () => {
    expect(formatValue(0.1 + 0.2)).toBe("0.3");
    expect(formatValue(Math.PI)).toBe("3.14159265358979");
  });

  it("prints 0 as 0", () => {
    expect(formatValue(0)).toBe("0");
  });

  it("switches to exponent form from 1e15 upwards, trimming trailing zeros", () => {
    expect(formatValue(1e15)).toBe("1e+15");
    expect(formatValue(-2.5e20)).toBe("-2.5e+20");
  });

  it("switches to exponent form below 1e-6", () => {
    expect(formatValue(1e-7)).toBe("1e-7");
    expect(formatValue(1.25e-9)).toBe("1.25e-9");
    expect(formatValue(1e-6)).toBe("0.000001");
  });

  it("prints non-finite values as JavaScript does", () => {
    expect(formatValue(Number.NaN)).toBe("NaN");
    expect(formatValue(Infinity)).toBe("Infinity");
    expect(formatValue(-Infinity)).toBe("-Infinity");
  });
});

describe("formatSmall", () => {
  it("prints scientific notation with 4 significant digits", () => {
    expect(formatSmall(0.000123456)).toBe("1.235e-4");
    expect(formatSmall(-5)).toBe("-5.000e+0");
  });

  it("prints 0 as 0", () => {
    expect(formatSmall(0)).toBe("0");
  });

  it("prints a dash for a missing value", () => {
    expect(formatSmall(null)).toBe("—");
  });
});

describe("formatEpsTex", () => {
  it("writes powers of ten as TeX", () => {
    expect(formatEpsTex(1e-4)).toBe("10^{-4}");
    expect(formatEpsTex(1e-12)).toBe("10^{-12}");
    expect(formatEpsTex(1)).toBe("10^{0}");
  });

  it("falls back to the plain number when the exponent is not an integer", () => {
    expect(formatEpsTex(5e-4)).toBe("0.0005");
    expect(formatEpsTex(0.5)).toBe("0.5");
  });
});
