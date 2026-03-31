import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const entreprises = sqliteTable("entreprises", {
  siren: text("siren").primaryKey(),
  siret_siege: text("siret_siege"),
  raison_sociale: text("raison_sociale").notNull(),
  nom_commercial: text("nom_commercial"),
  code_naf: text("code_naf"),
  libelle_naf: text("libelle_naf"),
  forme_juridique: text("forme_juridique"),
  nature_juridique: text("nature_juridique"),
  date_creation: text("date_creation"),
  date_fermeture: text("date_fermeture"),
  tranche_effectif: text("tranche_effectif"),
  categorie_entreprise: text("categorie_entreprise"),
  adresse_complete: text("adresse_complete"),
  code_postal: text("code_postal"),
  commune: text("commune"),
  departement: text("departement"),
  region: text("region"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  dirigeant_nom: text("dirigeant_nom"),
  dirigeant_fonction: text("dirigeant_fonction"),
  statut: text("statut").notNull().default("A"),
  statut_diffusion: text("statut_diffusion"),
  est_ess: integer("est_ess", { mode: "boolean" }).notNull().default(false),
  est_qualiopi: integer("est_qualiopi", { mode: "boolean" }).notNull().default(false),
  nombre_etablissements: integer("nombre_etablissements"),
  chiffre_affaires: integer("chiffre_affaires"),
  resultat_net: integer("resultat_net"),
  donnees_brutes: text("donnees_brutes"),
  cached_at: text("cached_at").notNull().default(sql`(datetime('now'))`),
  updated_at: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const listes = sqliteTable("listes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nom: text("nom").notNull(),
  description: text("description"),
  created_at: text("created_at").notNull().default(sql`(datetime('now'))`),
  updated_at: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const listesEntreprises = sqliteTable("listes_entreprises", {
  liste_id: integer("liste_id")
    .notNull()
    .references(() => listes.id, { onDelete: "cascade" }),
  siren: text("siren")
    .notNull()
    .references(() => entreprises.siren, { onDelete: "cascade" }),
  note: text("note"),
  added_at: text("added_at").notNull().default(sql`(datetime('now'))`),
});

export const historiqueRecherches = sqliteTable("historique_recherches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),
  requete: text("requete").notNull(),
  nb_resultats: integer("nb_resultats").notNull().default(0),
  created_at: text("created_at").notNull().default(sql`(datetime('now'))`),
  resultats_ids: text("resultats_ids").notNull().default("[]"),
});
