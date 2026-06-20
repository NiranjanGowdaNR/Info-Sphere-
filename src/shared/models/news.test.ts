import { describe, expect, it } from "vitest";
import { CATEGORIES, COUNTRIES, PAGE_SIZE } from "./news";

describe("shared news model constants", () => {
  it("keeps expected navigation categories available", () => {
    expect(CATEGORIES).toContain("technology");
    expect(CATEGORIES).toContain("politics");
  });

  it("contains common country filters", () => {
    expect(COUNTRIES.some((country) => country.iso === "us")).toBe(true);
    expect(COUNTRIES.some((country) => country.iso === "in")).toBe(true);
  });

  it("uses a positive page size", () => {
    expect(PAGE_SIZE).toBeGreaterThan(0);
  });
});
