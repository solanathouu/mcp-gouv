import { db } from "./db";
import { entreprises } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Entreprise, ApiEntrepriseRaw } from "@/types";
import { formatNatureJuridique, formatNafSection } from "./format";

const CACHE_TTL_DAYS = 7;

export function isCacheValid(cachedAt: string | null): boolean {
  if (!cachedAt) return false;
  const cachedDate = new Date(cachedAt);
  const now = new Date();
  const diffMs = now.getTime() - cachedDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays < CACHE_TTL_DAYS;
}

export function getCachedEntreprise(siren: string): Entreprise | null {
  const row = db.select().from(entreprises).where(eq(entreprises.siren, siren)).get();
  if (!row) return null;
  if (!isCacheValid(row.cached_at)) return null;
  return {
    siren: row.siren,
    siret_siege: row.siret_siege ?? null,
    raison_sociale: row.raison_sociale,
    nom_commercial: row.nom_commercial ?? null,
    code_naf: row.code_naf ?? null,
    libelle_naf: row.libelle_naf ?? null,
    forme_juridique: row.forme_juridique ?? null,
    nature_juridique: row.nature_juridique ?? null,
    date_creation: row.date_creation ?? null,
    date_fermeture: row.date_fermeture ?? null,
    tranche_effectif: row.tranche_effectif ?? null,
    categorie_entreprise: row.categorie_entreprise ?? null,
    adresse_complete: row.adresse_complete ?? null,
    code_postal: row.code_postal ?? null,
    commune: row.commune ?? null,
    departement: row.departement ?? null,
    region: row.region ?? null,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    dirigeant_nom: row.dirigeant_nom ?? null,
    dirigeant_fonction: row.dirigeant_fonction ?? null,
    statut: (row.statut as "A" | "C") ?? "A",
    statut_diffusion: row.statut_diffusion ?? null,
    est_ess: row.est_ess === true || (row.est_ess as unknown as number) === 1,
    est_qualiopi: row.est_qualiopi === true || (row.est_qualiopi as unknown as number) === 1,
    nombre_etablissements: row.nombre_etablissements ?? null,
    chiffre_affaires: row.chiffre_affaires ?? null,
    resultat_net: row.resultat_net ?? null,
    donnees_brutes: row.donnees_brutes ?? null,
    cached_at: row.cached_at ?? null,
    updated_at: row.updated_at ?? null,
  };
}

export function cacheEntreprise(entreprise: Entreprise): void {
  const now = new Date().toISOString();
  db.insert(entreprises)
    .values({
      ...entreprise,
      cached_at: now,
      updated_at: now,
    })
    .onConflictDoUpdate({
      target: entreprises.siren,
      set: {
        ...entreprise,
        cached_at: now,
        updated_at: now,
      },
    })
    .run();
}

export function cacheEntreprises(list: Entreprise[]): void {
  for (const e of list) {
    cacheEntreprise(e);
  }
}

export function mapApiToEntreprise(raw: ApiEntrepriseRaw): Entreprise {
  const latestFinanceYear = raw.finances
    ? Object.keys(raw.finances).sort().pop()
    : null;
  const finance = latestFinanceYear && raw.finances ? raw.finances[latestFinanceYear] : null;

  return {
    siren: raw.siren,
    siret_siege: raw.siege?.siret ?? null,
    raison_sociale: raw.nom_complet || raw.nom_raison_sociale,
    nom_commercial: raw.siege?.nom_commercial ?? null,
    code_naf: raw.activite_principale ?? null,
    libelle_naf: raw.activite_principale ? formatNafSection(raw.activite_principale) : null,
    forme_juridique: raw.nature_juridique ? formatNatureJuridique(raw.nature_juridique) : null,
    nature_juridique: raw.nature_juridique ?? null,
    date_creation: raw.date_creation ?? null,
    date_fermeture: raw.date_fermeture ?? null,
    tranche_effectif: raw.tranche_effectif_salarie ?? null,
    categorie_entreprise: raw.categorie_entreprise ?? null,
    adresse_complete: raw.siege?.adresse ?? null,
    code_postal: raw.siege?.code_postal ?? null,
    commune: raw.siege?.libelle_commune ?? null,
    departement: raw.siege?.departement ?? null,
    region: raw.siege?.region ?? null,
    latitude: raw.siege?.latitude ? parseFloat(raw.siege.latitude) : null,
    longitude: raw.siege?.longitude ? parseFloat(raw.siege.longitude) : null,
    dirigeant_nom: raw.dirigeants?.[0]
      ? `${raw.dirigeants[0].prenoms} ${raw.dirigeants[0].nom}`
      : null,
    dirigeant_fonction: raw.dirigeants?.[0]?.qualite ?? null,
    statut: raw.etat_administratif as "A" | "C",
    statut_diffusion: raw.statut_diffusion ?? null,
    est_ess: raw.complements?.est_ess ?? false,
    est_qualiopi: raw.complements?.est_qualiopi ?? false,
    nombre_etablissements: raw.nombre_etablissements_ouverts ?? null,
    chiffre_affaires: finance?.ca ?? null,
    resultat_net: finance?.resultat_net ?? null,
    donnees_brutes: JSON.stringify(raw),
    cached_at: null,
    updated_at: null,
  };
}
