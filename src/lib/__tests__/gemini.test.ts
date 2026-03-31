import { describe, it, expect } from "vitest";
import { SYSTEM_PROMPT, parseSearchIntent } from "../gemini";

describe("SYSTEM_PROMPT", () => {
  it("contains role definition", () => {
    expect(SYSTEM_PROMPT).toContain("prospection B2B");
  });
  it("contains JSON output instruction", () => {
    expect(SYSTEM_PROMPT).toContain("JSON");
  });
});

describe("parseSearchIntent", () => {
  it("parses a valid search JSON", () => {
    const raw = JSON.stringify({ type: "search", params: { q: "boulangerie", code_postal: "75011" } });
    const intent = parseSearchIntent(raw);
    expect(intent.type).toBe("search");
    expect(intent.params?.q).toBe("boulangerie");
  });
  it("returns general for invalid JSON", () => {
    const intent = parseSearchIntent("not json at all");
    expect(intent.type).toBe("general");
  });
  it("handles clarification type", () => {
    const raw = JSON.stringify({ type: "clarification", message: "Quel secteur ?" });
    const intent = parseSearchIntent(raw);
    expect(intent.type).toBe("clarification");
    expect(intent.message).toBe("Quel secteur ?");
  });
});
