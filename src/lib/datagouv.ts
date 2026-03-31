import type { McpJsonRpcRequest, McpJsonRpcResponse, DataGouvDataset } from "@/types";

const MCP_URL = "https://mcp.data.gouv.fr/mcp";
let requestId = 0;

export function buildJsonRpcRequest(method: string, params: Record<string, unknown>): McpJsonRpcRequest {
  return {
    jsonrpc: "2.0",
    id: ++requestId,
    method,
    params,
  };
}

async function mcpCall(method: string, params: Record<string, unknown>): Promise<unknown> {
  const body = buildJsonRpcRequest(method, params);
  const response = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`MCP DataGouv error: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  try {
    const json: McpJsonRpcResponse = JSON.parse(text);
    if (json.error) throw new Error(`MCP error ${json.error.code}: ${json.error.message}`);
    return json.result;
  } catch {
    const lines = text.split("\n").filter((l) => l.startsWith("data: "));
    for (const line of lines) {
      try {
        const json: McpJsonRpcResponse = JSON.parse(line.slice(6));
        if (json.result) return json.result;
      } catch { continue; }
    }
    throw new Error("Could not parse MCP response");
  }
}

export async function searchDatasets(query: string, page = 1, pageSize = 20) {
  return mcpCall("tools/call", { name: "search_datasets", arguments: { query, page, page_size: pageSize } });
}

export async function getDatasetInfo(datasetId: string) {
  return mcpCall("tools/call", { name: "get_dataset_info", arguments: { dataset_id: datasetId } });
}

export async function listDatasetResources(datasetId: string) {
  return mcpCall("tools/call", { name: "list_dataset_resources", arguments: { dataset_id: datasetId } });
}

export async function queryResourceData(resourceId: string, question: string, page = 1, pageSize = 20) {
  return mcpCall("tools/call", { name: "query_resource_data", arguments: { resource_id: resourceId, question, page, page_size: pageSize } });
}

export async function searchDataservices(query: string, page = 1, pageSize = 20) {
  return mcpCall("tools/call", { name: "search_dataservices", arguments: { query, page, page_size: pageSize } });
}

export async function getMetrics(datasetId?: string, resourceId?: string) {
  const args: Record<string, string> = {};
  if (datasetId) args.dataset_id = datasetId;
  if (resourceId) args.resource_id = resourceId;
  return mcpCall("tools/call", { name: "get_metrics", arguments: args });
}

/**
 * Parse the MCP tool result into a typed array of DataGouvDataset.
 * The MCP returns { content: [{ type: "text", text: "<json or markdown>" }] }
 */
export function parseDataGouvDatasets(result: unknown, maxResults = 5): DataGouvDataset[] {
  try {
    // result is { content: [{ type: string; text: string }] }
    const res = result as { content?: { type: string; text: string }[] };
    const textBlock = res?.content?.find((c) => c.type === "text");
    if (!textBlock?.text) return [];

    const raw = textBlock.text.trim();

    // Try to parse as JSON directly
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Try to extract JSON array / object from markdown code block
      const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) ?? raw.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      if (!jsonMatch) return [];
      try {
        parsed = JSON.parse(jsonMatch[1].trim());
      } catch {
        return [];
      }
    }

    // Normalize: accept array or { datasets: [...] } or { results: [...] }
    let items: unknown[] = [];
    if (Array.isArray(parsed)) {
      items = parsed;
    } else if (parsed && typeof parsed === "object") {
      const obj = parsed as Record<string, unknown>;
      if (Array.isArray(obj.datasets)) items = obj.datasets as unknown[];
      else if (Array.isArray(obj.results)) items = obj.results as unknown[];
      else if (Array.isArray(obj.data)) items = obj.data as unknown[];
    }

    return items.slice(0, maxResults).map((item) => {
      const d = item as Record<string, unknown>;
      return {
        id: String(d.id ?? d.slug ?? ""),
        title: String(d.title ?? d.nom ?? ""),
        description: String(d.description ?? d.resume ?? ""),
        url: String(d.url ?? d.page ?? (d.id ? `https://www.data.gouv.fr/fr/datasets/${d.id}/` : "")),
        organization: String(
          (d.organization as Record<string, unknown> | null)?.name ??
            d.organization ??
            d.organisation ??
            ""
        ),
      };
    }).filter((d) => d.title);
  } catch {
    return [];
  }
}
