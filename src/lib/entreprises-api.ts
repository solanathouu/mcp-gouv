import type { SearchParams, GeoSearchParams, ApiSearchResponse } from "@/types";

const BASE_URL = "https://recherche-entreprises.api.gouv.fr";
const DEFAULT_INCLUDE = "complements,dirigeants,finances,siege,matching_etablissements";

export function buildSearchUrl(params: SearchParams): string {
  const url = new URL(`${BASE_URL}/search`);
  if (params.q) url.searchParams.set("q", params.q);
  if (params.code_naf) url.searchParams.set("activite_principale", params.code_naf);
  if (params.code_postal) url.searchParams.set("code_postal", params.code_postal);
  if (params.code_commune) url.searchParams.set("code_commune", params.code_commune);
  if (params.departement) url.searchParams.set("departement", params.departement);
  if (params.region) url.searchParams.set("region", params.region);
  if (params.tranche_effectif_salarie) url.searchParams.set("tranche_effectif_salarie", params.tranche_effectif_salarie);
  if (params.categorie_entreprise) url.searchParams.set("categorie_entreprise", params.categorie_entreprise);
  if (params.nature_juridique) url.searchParams.set("nature_juridique", params.nature_juridique);
  if (params.section_activite_principale) url.searchParams.set("section_activite_principale", params.section_activite_principale);
  if (params.etat_administratif) url.searchParams.set("etat_administratif", params.etat_administratif);
  if (params.est_ess !== undefined) url.searchParams.set("est_ess", String(params.est_ess));
  if (params.est_qualiopi !== undefined) url.searchParams.set("est_qualiopi", String(params.est_qualiopi));
  if (params.est_entrepreneur_individuel !== undefined) url.searchParams.set("est_entrepreneur_individuel", String(params.est_entrepreneur_individuel));
  if (params.ca_min !== undefined) url.searchParams.set("ca_min", String(params.ca_min));
  if (params.ca_max !== undefined) url.searchParams.set("ca_max", String(params.ca_max));
  if (params.nom_personne) url.searchParams.set("nom_personne", params.nom_personne);
  url.searchParams.set("page", String(params.page ?? 1));
  url.searchParams.set("per_page", String(params.per_page ?? 25));
  url.searchParams.set("include", DEFAULT_INCLUDE);
  return url.toString();
}

export function buildNearPointUrl(params: GeoSearchParams): string {
  const url = new URL(`${BASE_URL}/near_point`);
  url.searchParams.set("lat", String(params.lat));
  url.searchParams.set("long", String(params.long));
  if (params.radius !== undefined) url.searchParams.set("radius", String(params.radius));
  if (params.activite_principale) url.searchParams.set("activite_principale", params.activite_principale);
  if (params.section_activite_principale) url.searchParams.set("section_activite_principale", params.section_activite_principale);
  url.searchParams.set("page", String(params.page ?? 1));
  url.searchParams.set("per_page", String(params.per_page ?? 25));
  url.searchParams.set("include", DEFAULT_INCLUDE);
  return url.toString();
}

async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url);
    if (response.status === 429 && attempt < maxRetries) {
      const waitMs = Math.pow(2, attempt) * 500;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      continue;
    }
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response;
  }
  throw new Error("API error: max retries exceeded (429 Too Many Requests)");
}

export async function searchEntreprises(params: SearchParams): Promise<ApiSearchResponse> {
  const url = buildSearchUrl(params);
  const response = await fetchWithRetry(url);
  return response.json();
}

export async function searchNearPoint(params: GeoSearchParams): Promise<ApiSearchResponse> {
  const url = buildNearPointUrl(params);
  const response = await fetchWithRetry(url);
  return response.json();
}
