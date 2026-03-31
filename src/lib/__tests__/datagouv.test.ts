import { describe, it, expect } from "vitest";
import { buildJsonRpcRequest } from "../datagouv";

describe("buildJsonRpcRequest", () => {
  it("builds a valid JSON-RPC 2.0 request", () => {
    const req = buildJsonRpcRequest("tools/call", {
      name: "search_datasets",
      arguments: { query: "entreprises" },
    });
    expect(req.jsonrpc).toBe("2.0");
    expect(req.method).toBe("tools/call");
    expect(req.params).toEqual({
      name: "search_datasets",
      arguments: { query: "entreprises" },
    });
    expect(typeof req.id).toBe("number");
  });
});
