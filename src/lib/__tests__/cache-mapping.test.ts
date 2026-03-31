import { describe, it, expect } from "vitest";
import { mapApiToEntreprise } from "../cache";
import type { ApiEntrepriseRaw } from "@/types";

const FIXTURE: ApiEntrepriseRaw = {
  siren: "123456789",
  nom_complet: "BOULANGERIE DUPONT",
  nom_raison_sociale: "BOULANGERIE DUPONT",
  sigle: null,
  nombre_etablissements: 2,
  nombre_etablissements_ouverts: 1,
  activite_principale: "10.71C",
  categorie_entreprise: "PME",
  date_creation: "2019-03-15",
  date_fermeture: null,
  etat_administratif: "A",
  nature_juridique: "5710",
  section_activite_principale: "C",
  tranche_effectif_salarie: "12",
  statut_diffusion: "O",
  siege: {
    siret: "12345678900012",
    activite_principale: "10.71C",
    adresse: "12 rue de la Paix",
    code_postal: "75002",
    commune: "75102",
    libelle_commune: "Paris",
    departement: "75",
    region: "11",
    latitude: "48.8698",
    longitude: "2.3312",
    date_creation: "2019-03-15",
    date_fermeture: null,
    etat_administratif: "A",
    geo_adresse: "12 Rue de la Paix 75002 Paris",
    nom_commercial: "Chez Dupont",
    tranche_effectif_salarie: "12",
    statut_diffusion_etablissement: "O",
  },
  dirigeants: [
    { nom: "DUPONT", prenoms: "Jean", qualite: "Président", type_dirigeant: "personne physique" },
  ],
  finances: {
    "2023": { ca: 500000, resultat_net: 45000 },
    "2024": { ca: 550000, resultat_net: 52000 },
  },
  complements: {
    est_ess: false,
    est_qualiopi: true,
    est_entrepreneur_individuel: false,
    est_association: false,
    est_bio: true,
    est_rge: false,
    est_service_public: false,
    est_societe_mission: false,
  },
};

describe("mapApiToEntreprise", () => {
  it("maps basic fields correctly", () => {
    const result = mapApiToEntreprise(FIXTURE);
    expect(result.siren).toBe("123456789");
    expect(result.raison_sociale).toBe("BOULANGERIE DUPONT");
    expect(result.statut).toBe("A");
  });

  it("maps siege fields correctly", () => {
    const result = mapApiToEntreprise(FIXTURE);
    expect(result.siret_siege).toBe("12345678900012");
    expect(result.nom_commercial).toBe("Chez Dupont");
    expect(result.adresse_complete).toBe("12 rue de la Paix");
    expect(result.code_postal).toBe("75002");
    expect(result.commune).toBe("Paris");
    expect(result.departement).toBe("75");
  });

  it("parses GPS coordinates as numbers", () => {
    const result = mapApiToEntreprise(FIXTURE);
    expect(result.latitude).toBeCloseTo(48.8698);
    expect(result.longitude).toBeCloseTo(2.3312);
  });

  it("handles null coordinates gracefully", () => {
    const raw = { ...FIXTURE, siege: { ...FIXTURE.siege, latitude: null, longitude: null } };
    const result = mapApiToEntreprise(raw);
    expect(result.latitude).toBeNull();
    expect(result.longitude).toBeNull();
  });

  it("extracts latest finance year", () => {
    const result = mapApiToEntreprise(FIXTURE);
    expect(result.chiffre_affaires).toBe(550000);
    expect(result.resultat_net).toBe(52000);
  });

  it("handles missing finances", () => {
    const raw = { ...FIXTURE, finances: undefined };
    const result = mapApiToEntreprise(raw);
    expect(result.chiffre_affaires).toBeNull();
    expect(result.resultat_net).toBeNull();
  });

  it("extracts first dirigeant", () => {
    const result = mapApiToEntreprise(FIXTURE);
    expect(result.dirigeant_nom).toBe("Jean DUPONT");
    expect(result.dirigeant_fonction).toBe("Président");
  });

  it("handles missing dirigeants", () => {
    const raw = { ...FIXTURE, dirigeants: undefined };
    const result = mapApiToEntreprise(raw);
    expect(result.dirigeant_nom).toBeNull();
    expect(result.dirigeant_fonction).toBeNull();
  });

  it("maps complements booleans", () => {
    const result = mapApiToEntreprise(FIXTURE);
    expect(result.est_ess).toBe(false);
    expect(result.est_qualiopi).toBe(true);
  });

  it("handles missing complements", () => {
    const raw = { ...FIXTURE, complements: undefined };
    const result = mapApiToEntreprise(raw);
    expect(result.est_ess).toBe(false);
    expect(result.est_qualiopi).toBe(false);
  });

  it("stores raw JSON in donnees_brutes", () => {
    const result = mapApiToEntreprise(FIXTURE);
    expect(result.donnees_brutes).toBeTruthy();
    const parsed = JSON.parse(result.donnees_brutes!);
    expect(parsed.siren).toBe("123456789");
  });

  it("populates libelle_naf from NAF section", () => {
    const result = mapApiToEntreprise(FIXTURE);
    expect(result.libelle_naf).toBeTruthy();
    expect(result.libelle_naf).not.toBe("null");
  });

  it("populates forme_juridique from nature_juridique", () => {
    const result = mapApiToEntreprise(FIXTURE);
    expect(result.forme_juridique).toBeTruthy();
  });
});
