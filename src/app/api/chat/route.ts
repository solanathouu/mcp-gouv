import { NextRequest } from "next/server";
import { interpretQuery, getGeminiModel, synthesizeResults } from "@/lib/gemini";
import { searchEntreprises, searchNearPoint } from "@/lib/entreprises-api";
import { mapApiToEntreprise, cacheEntreprises } from "@/lib/cache";
import { searchDatasets, parseDataGouvDatasets } from "@/lib/datagouv";
import { db } from "@/lib/db";
import { historiqueRecherches } from "@/db/schema";
import type { Entreprise, DataGouvDataset } from "@/types";

function encode(encoder: TextEncoder, event: string, data: unknown): Uint8Array {
  const payload = JSON.stringify({ event, data });
  return encoder.encode(`data: ${payload}\n\n`);
}

export async function POST(request: NextRequest) {
  const { message } = await request.json();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 1. Status: analyzing
        controller.enqueue(encode(encoder, "status", "Analyse de votre demande..."));

        // 2. Interpret the query
        const intent = await interpretQuery(message);

        // 3. Handle clarification
        if (intent.type === "clarification") {
          controller.enqueue(encode(encoder, "message", intent.message ?? "Pouvez-vous préciser votre demande ?"));
          controller.close();
          return;
        }

        // 4. Handle general question
        if (intent.type === "general") {
          const model = getGeminiModel();
          const result = await model.generateContent(message);
          const text = result.response.text();
          controller.enqueue(encode(encoder, "message", text));
          controller.close();
          return;
        }

        // 5. type === "search" — status: searching
        controller.enqueue(encode(encoder, "status", "Recherche en cours..."));

        // 6. Call the appropriate API
        let apiResponse;
        if (intent.geo_params) {
          apiResponse = await searchNearPoint(intent.geo_params);
        } else {
          apiResponse = await searchEntreprises(intent.params ?? {});
        }

        // 7. Filter, map, cache
        const filtered = apiResponse.results.filter((r) => r.statut_diffusion !== "P");
        const entreprises: Entreprise[] = filtered.map(mapApiToEntreprise);
        const totalResults = apiResponse.total_results;

        cacheEntreprises(entreprises);

        // 8. Save to historique_recherches
        db.insert(historiqueRecherches)
          .values({
            type: "chat",
            requete: message,
            nb_resultats: totalResults,
            resultats_ids: JSON.stringify(entreprises.map((e) => e.siren)),
          })
          .run();

        // 9. Send entreprises event
        controller.enqueue(encode(encoder, "entreprises", { results: entreprises, total_results: totalResults }));

        // 10. Fetch related public datasets from MCP DataGouv (best-effort)
        let datasets: DataGouvDataset[] = [];
        try {
          controller.enqueue(encode(encoder, "status", "Recherche de données publiques associées..."));
          // Derive a compact query from the user message (first 5 words)
          const datasetQuery = message.trim().split(/\s+/).slice(0, 5).join(" ");
          const mcpResult = await searchDatasets(datasetQuery, 1, 5);
          datasets = parseDataGouvDatasets(mcpResult, 5);
          if (datasets.length > 0) {
            controller.enqueue(encode(encoder, "datasets", datasets));
          }
        } catch (mcpErr) {
          console.warn("[chat] MCP DataGouv call failed (non-critical):", mcpErr);
        }

        // 11. Status: analyzing results
        controller.enqueue(encode(encoder, "status", "Analyse des résultats..."));

        // 12. Synthesize results (with optional datasets context)
        const synthesis = await synthesizeResults(message, entreprises, totalResults, datasets.length > 0 ? datasets : undefined);

        // 13. Send message event with synthesis
        controller.enqueue(encode(encoder, "message", synthesis));

        // 14. Close stream
        controller.close();
      } catch (error) {
        console.error("[chat] Error:", error);
        controller.enqueue(
          encode(encoder, "error", "Une erreur est survenue lors du traitement de votre demande.")
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
