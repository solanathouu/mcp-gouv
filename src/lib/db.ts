import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/db/schema";
import path from "path";

const DB_PATH = path.join(process.cwd(), "datagouv.db");

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS entreprises (
    siren TEXT PRIMARY KEY,
    siret_siege TEXT,
    raison_sociale TEXT NOT NULL,
    nom_commercial TEXT,
    code_naf TEXT,
    libelle_naf TEXT,
    forme_juridique TEXT,
    nature_juridique TEXT,
    date_creation TEXT,
    date_fermeture TEXT,
    tranche_effectif TEXT,
    categorie_entreprise TEXT,
    adresse_complete TEXT,
    code_postal TEXT,
    commune TEXT,
    departement TEXT,
    region TEXT,
    latitude REAL,
    longitude REAL,
    dirigeant_nom TEXT,
    dirigeant_fonction TEXT,
    statut TEXT NOT NULL DEFAULT 'A',
    statut_diffusion TEXT,
    est_ess INTEGER NOT NULL DEFAULT 0,
    est_qualiopi INTEGER NOT NULL DEFAULT 0,
    nombre_etablissements INTEGER,
    chiffre_affaires INTEGER,
    resultat_net INTEGER,
    donnees_brutes TEXT,
    cached_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS listes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS listes_entreprises (
    liste_id INTEGER NOT NULL REFERENCES listes(id) ON DELETE CASCADE,
    siren TEXT NOT NULL REFERENCES entreprises(siren) ON DELETE CASCADE,
    note TEXT,
    added_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (liste_id, siren)
  );

  CREATE TABLE IF NOT EXISTS historique_recherches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    requete TEXT NOT NULL,
    nb_resultats INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    resultats_ids TEXT NOT NULL DEFAULT '[]'
  );
`);
