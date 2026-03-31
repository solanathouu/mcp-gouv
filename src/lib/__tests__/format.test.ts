import { describe, it, expect } from "vitest";
import { formatEffectif, formatNafSection, formatNatureJuridique } from "../format";

describe("formatEffectif", () => {
  it("returns label for known tranche", () => {
    expect(formatEffectif("12")).toContain("20");
  });
  it("returns N/D for null", () => {
    expect(formatEffectif(null)).toBe("N/D");
  });
  it("returns the code for unknown tranche", () => {
    expect(formatEffectif("99")).toBe("99");
  });
});

describe("formatNafSection", () => {
  it("returns French label for known section", () => {
    expect(formatNafSection("C10.71")).toContain("Industrie");
  });
  it("returns N/D for null", () => {
    expect(formatNafSection(null)).toBe("N/D");
  });
});

describe("formatNatureJuridique", () => {
  it("maps 5710 to SAS", () => {
    expect(formatNatureJuridique("5710")).toContain("SAS");
  });
  it("returns the code for unknown", () => {
    expect(formatNatureJuridique("9999")).toBe("9999");
  });
  it("returns N/D for null", () => {
    expect(formatNatureJuridique(null)).toBe("N/D");
  });
});
