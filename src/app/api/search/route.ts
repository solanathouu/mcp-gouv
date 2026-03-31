import { NextRequest, NextResponse } from "next/server";
import { searchEntreprises, searchNearPoint } from "@/lib/entreprises-api";
import { mapApiToEntreprise, cacheEntreprises } from "@/lib/cache";
import { db } from "@/lib/db";
import { historiqueRecherches } from "@/db/schema";
import type { SearchParams, GeoSearchParams } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const lat = searchParams.get("lat");
    const long = searchParams.get("long");

    let apiResponse;

    if (lat && long) {
      const geoParams: GeoSearchParams = {
        lat: parseFloat(lat),
        long: parseFloat(long),
        radius: searchParams.get("radius") ? parseFloat(searchParams.get("radius")!) : undefined,
        activite_principale: searchParams.get("activite_principale") ?? undefined,
        section_activite_principale: searchParams.get("section_activite_principale") ?? undefined,
        page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined,
        per_page: searchParams.get("per_page") ? parseInt(searchParams.get("per_page")!) : undefined,
      };
      apiResponse = await searchNearPoint(geoParams);
    } else {
      const params: SearchParams = {
        q: searchParams.get("q") ?? undefined,
        code_naf: searchParams.get("code_naf") ?? undefined,
        code_postal: searchParams.get("code_postal") ?? undefined,
        code_commune: searchParams.get("code_commune") ?? undefined,
        departement: searchParams.get("departement") ?? undefined,
        region: searchParams.get("region") ?? undefined,
        tranche_effectif_salarie: searchParams.get("tranche_effectif_salarie") ?? undefined,
        categorie_entreprise: searchParams.get("categorie_entreprise") ?? undefined,
        nature_juridique: searchParams.get("nature_juridique") ?? undefined,
        section_activite_principale: searchParams.get("section_activite_principale") ?? undefined,
        etat_administratif: searchParams.get("etat_administratif") ?? "A",
        est_ess: searchParams.get("est_ess") ? searchParams.get("est_ess") === "true" : undefined,
        est_qualiopi: searchParams.get("est_qualiopi") ? searchParams.get("est_qualiopi") === "true" : undefined,
        est_entrepreneur_individuel: searchParams.get("est_entrepreneur_individuel")
          ? searchParams.get("est_entrepreneur_individuel") === "true"
          : undefined,
        ca_min: searchParams.get("ca_min") ? parseFloat(searchParams.get("ca_min")!) : undefined,
        ca_max: searchParams.get("ca_max") ? parseFloat(searchParams.get("ca_max")!) : undefined,
        nom_personne: searchParams.get("nom_personne") ?? undefined,
        page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined,
        per_page: searchParams.get("per_page") ? parseInt(searchParams.get("per_page")!) : undefined,
      };
      apiResponse = await searchEntreprises(params);
    }

    const filtered = apiResponse.results.filter((r) => r.statut_diffusion !== "P");
    const entreprises = filtered.map(mapApiToEntreprise);

    cacheEntreprises(entreprises);

    const requete = lat && long
      ? `geo:${lat},${long}`
      : (searchParams.get("q") ?? JSON.stringify(Object.fromEntries(searchParams.entries())));

    db.insert(historiqueRecherches)
      .values({
        type: "filtre",
        requete,
        nb_resultats: apiResponse.total_results,
        resultats_ids: JSON.stringify(entreprises.map((e) => e.siren)),
      })
      .run();

    return NextResponse.json({
      results: entreprises,
      total_results: apiResponse.total_results,
      total_pages: apiResponse.total_pages,
      page: apiResponse.page,
      per_page: apiResponse.per_page,
    });
  } catch (error) {
    console.error("[search] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}
