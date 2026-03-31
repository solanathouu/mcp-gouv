import { describe, it, expect } from "vitest";
import { buildSearchUrl, buildNearPointUrl } from "../entreprises-api";

describe("buildSearchUrl", () => {
  it("builds URL with text query", () => {
    const url = buildSearchUrl({ q: "boulangerie", page: 1, per_page: 10 });
    expect(url).toContain("q=boulangerie");
    expect(url).toContain("page=1");
    expect(url).toContain("per_page=10");
    expect(url).not.toContain("include=");
  });

  it("builds URL with multiple filters", () => {
    const url = buildSearchUrl({
      q: "restaurant",
      code_postal: "75011",
      etat_administratif: "A",
      est_ess: true,
    });
    expect(url).toContain("code_postal=75011");
    expect(url).toContain("etat_administratif=A");
    expect(url).toContain("est_ess=true");
  });

  it("omits undefined params", () => {
    const url = buildSearchUrl({ q: "test" });
    expect(url).not.toContain("code_postal");
    expect(url).not.toContain("departement");
  });
});

describe("buildNearPointUrl", () => {
  it("builds URL with coordinates and radius", () => {
    const url = buildNearPointUrl({ lat: 48.8566, long: 2.3522, radius: 10 });
    expect(url).toContain("lat=48.8566");
    expect(url).toContain("long=2.3522");
    expect(url).toContain("radius=10");
  });
});
