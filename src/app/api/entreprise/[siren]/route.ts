import { NextRequest, NextResponse } from "next/server";
import { searchEntreprises } from "@/lib/entreprises-api";
import { getCachedEntreprise, mapApiToEntreprise, cacheEntreprise } from "@/lib/cache";

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

    return NextResponse.json(entreprise);
  } catch (error) {
    console.error("[entreprise/siren] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'entreprise" },
      { status: 500 }
    );
  }
}
