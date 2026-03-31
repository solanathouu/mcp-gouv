import { NextRequest, NextResponse } from "next/server";
import { searchEntreprises } from "@/lib/entreprises-api";
import { getCachedEntreprise, mapApiToEntreprise, cacheEntreprise } from "@/lib/cache";
import { searchDatasets, parseDataGouvDatasets } from "@/lib/datagouv";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siren: string }> }
) {
  try {
    const { siren } = await params;
    const refresh = request.nextUrl.searchParams.get("refresh") === "true";

    if (!refresh) {
      const cached = getCachedEntreprise(siren);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    const apiResponse = await searchEntreprises({
      q: `siren:${siren}`,
      per_page: 1,
    });

    if (!apiResponse.results || apiResponse.results.length === 0) {
      return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });
    }

    const raw = apiResponse.results[0];

    if (raw.statut_diffusion === "P") {
      return NextResponse.json(
        { error: "Accès refusé : entreprise non diffusable" },
        { status: 403 }
      );
    }

    const entreprise = mapApiToEntreprise(raw);
    cacheEntreprise(entreprise);

    // Fetch related public datasets from MCP DataGouv (best-effort)
    let datasets: import("@/types").DataGouvDataset[] = [];
    try {
      const nafQuery = entreprise.libelle_naf ?? entreprise.code_naf ?? entreprise.raison_sociale;
      if (nafQuery) {
        const mcpResult = await searchDatasets(nafQuery, 1, 5);
        datasets = parseDataGouvDatasets(mcpResult, 5);
      }
    } catch (mcpErr) {
      console.warn("[entreprise/siren] MCP DataGouv call failed (non-critical):", mcpErr);
    }

    return NextResponse.json({ ...entreprise, datasets });
  } catch (error) {
    console.error("[entreprise/siren] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'entreprise" },
      { status: 500 }
    );
  }
}
