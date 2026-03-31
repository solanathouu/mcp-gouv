import { describe, it, expect } from "vitest";
import { isCacheValid } from "../cache";

describe("isCacheValid", () => {
  it("returns true for entry cached less than 7 days ago", () => {
    const now = new Date();
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    expect(isCacheValid(fiveDaysAgo.toISOString())).toBe(true);
  });

  it("returns false for entry cached more than 7 days ago", () => {
    const now = new Date();
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    expect(isCacheValid(tenDaysAgo.toISOString())).toBe(false);
  });

  it("returns false for null cached_at", () => {
    expect(isCacheValid(null)).toBe(false);
  });
});
