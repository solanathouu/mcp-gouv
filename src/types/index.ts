// === Entreprise (cached in SQLite + displayed in UI) ===

export interface Entreprise {
  siren: string;
  siret_siege: string | null;
  raison_sociale: string;
  nom_commercial: string | null;
  code_naf: string | null;
  libelle_naf: string | null;
  forme_juridique: string | null;
  nature_juridique: string | null;
  date_creation: string | null;
  date_fermeture: string | null;
  tranche_effectif: string | null;
  categorie_entreprise: string | null;
  adresse_complete: string | null;
  code_postal: string | null;
  commune: string | null;
  departement: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  dirigeant_nom: string | null;
  dirigeant_fonction: string | null;
  statut: "A" | "C";
  statut_diffusion: string | null;
  est_ess: boolean;
  est_qualiopi: boolean;
  nombre_etablissements: number | null;
  chiffre_affaires: number | null;
  resultat_net: number | null;
  donnees_brutes: string | null;
  cached_at: string | null;
  updated_at: string | null;
}

export interface SearchParams {
  q?: string;
  code_naf?: string;
  code_postal?: string;
  code_commune?: string;
  departement?: string;
  region?: string;
  tranche_effectif_salarie?: string;
  categorie_entreprise?: string;
  nature_juridique?: string;
  section_activite_principale?: string;
  etat_administratif?: string;
  est_ess?: boolean;
  est_qualiopi?: boolean;
  est_entrepreneur_individuel?: boolean;
  ca_min?: number;
  ca_max?: number;
  nom_personne?: string;
  page?: number;
  per_page?: number;
}

export interface GeoSearchParams {
  lat: number;
  long: number;
  radius?: number;
  activite_principale?: string;
  section_activite_principale?: string;
  page?: number;
  per_page?: number;
}

export interface SearchResult {
  results: Entreprise[];
  total_results: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiEntrepriseRaw {
  siren: string;
  nom_complet: string;
  nom_raison_sociale: string;
  sigle: string | null;
  nombre_etablissements: number;
  nombre_etablissements_ouverts: number;
  activite_principale: string | null;
  categorie_entreprise: string | null;
  date_creation: string | null;
  date_fermeture: string | null;
  etat_administratif: string;
  nature_juridique: string | null;
  section_activite_principale: string | null;
  tranche_effectif_salarie: string | null;
  statut_diffusion: string;
  siege: ApiSiegeRaw;
  dirigeants?: ApiDirigeantRaw[];
  finances?: Record<string, { ca?: number; resultat_net?: number }>;
  complements?: ApiComplementsRaw;
  matching_etablissements?: ApiEtablissementRaw[];
}

export interface ApiSiegeRaw {
  siret: string;
  activite_principale: string | null;
  adresse: string;
  code_postal: string;
  commune: string;
  libelle_commune: string;
  departement: string;
  region: string;
  latitude: string | null;
  longitude: string | null;
  date_creation: string | null;
  date_fermeture: string | null;
  etat_administratif: string;
  geo_adresse: string | null;
  nom_commercial: string | null;
  tranche_effectif_salarie: string | null;
  statut_diffusion_etablissement: string;
}

export interface ApiDirigeantRaw {
  nom: string;
  prenoms: string;
  qualite: string;
  type_dirigeant: string;
}

export interface ApiComplementsRaw {
  est_ess: boolean;
  est_qualiopi: boolean;
  est_entrepreneur_individuel: boolean;
  est_association: boolean;
  est_bio: boolean;
  est_rge: boolean;
  est_service_public: boolean;
  est_societe_mission: boolean;
  [key: string]: boolean | string | null | unknown[];
}

export interface ApiEtablissementRaw {
  siret: string;
  adresse: string;
  code_postal: string;
  libelle_commune: string;
  latitude: string | null;
  longitude: string | null;
  etat_administratif: string;
  est_siege: boolean;
}

export interface ApiSearchResponse {
  results: ApiEntrepriseRaw[];
  total_results: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface Liste {
  id: number;
  nom: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  count?: number;
}

export interface ListeEntreprise {
  liste_id: number;
  siren: string;
  note: string | null;
  added_at: string;
}

export interface HistoriqueRecherche {
  id: number;
  type: "chat" | "filtre";
  requete: string;
  nb_resultats: number;
  created_at: string;
  resultats_ids: string;
}

export interface DataGouvDataset {
  id: string;
  title: string;
  description: string;
  url: string;
  organization: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  entreprises?: Entreprise[];
  datasets?: DataGouvDataset[];
  timestamp: string;
}

export interface GeminiSearchIntent {
  type: "search" | "clarification" | "general";
  params?: SearchParams;
  geo_params?: GeoSearchParams;
  message?: string;
}

export interface McpJsonRpcRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params: Record<string, unknown>;
}

export interface McpJsonRpcResponse {
  jsonrpc: "2.0";
  id: number;
  result?: unknown;
  error?: { code: number; message: string };
}

export interface DashboardStats {
  total_entreprises_cached: number;
  total_listes: number;
  total_prospects: number;
  total_recherches: number;
  par_secteur: { secteur: string; count: number }[];
  par_departement: { departement: string; count: number }[];
  recherches_recentes: HistoriqueRecherche[];
}
