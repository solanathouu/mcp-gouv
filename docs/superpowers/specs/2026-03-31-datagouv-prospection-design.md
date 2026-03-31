# DataGouv Prospection B2B — Spécification de design

**Date :** 2026-03-31
**Statut :** Validé
**Auteur :** Claude + utilisateur

---

## 1. Vision

Outil de prospection B2B ultime exploitant les données ouvertes françaises via le MCP DataGouv et l'API Recherche d'entreprises. Destiné à un commercial non-technique, il combine chatbot IA, filtres structurés, dashboard visuel et carte interactive dans une app web locale.

## 2. Utilisateur cible

Commercial / SDR non-technique qui a besoin de trouver des entreprises correspondant à des critères (secteur, taille, localisation) pour les démarcher. Il ne connaît pas les codes NAF, les APIs, ni les bases de données — il tape en français ce qu'il cherche.

## 3. Architecture

```
┌─────────────────────────────────────────────────┐
│                  FRONTEND (Next.js)              │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Chatbot  │  │ Filtres  │  │  Dashboard    │  │
│  │ (Q&A)    │  │ avancés  │  │  + Carte      │  │
│  └────┬─────┘  └────┬─────┘  └───────┬───────┘  │
│       └──────────────┼────────────────┘          │
│                      ▼                           │
│              API Routes (Next.js)                │
└──────────────────────┬───────────────────────────┘
                       │
          ┌────────────┼────────────────┐
          ▼            ▼                ▼
   ┌────────────┐ ┌─────────┐  ┌──────────────┐
   │ Gemini API │ │ MCP     │  │ API Recherche│
   │ (LLM)     │ │ DataGouv│  │ Entreprises  │
   └────────────┘ └─────────┘  └──────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  SQLite (cache  │
              │  + favoris +    │
              │  historique)    │
              └─────────────────┘
```

**3 couches :**
1. **Frontend** — 3 modes d'interaction : chatbot, filtres structurés, dashboard visuel
2. **Backend (API Routes Next.js)** — orchestre les appels, gère le cache, fait le pont avec Gemini
3. **Sources de données** — Gemini pour l'intelligence, MCP DataGouv + API Entreprises pour les données, SQLite pour la persistance locale

**Approche hybride progressive :** les APIs sont appelées en temps réel, et chaque entreprise consultée est mise en cache dans SQLite (TTL 7 jours). Le cache grandit naturellement avec l'usage.

## 4. Pages et navigation

### 4.1 Page Recherche (accueil)

- Barre de recherche textuelle en haut
- Panneau de filtres à gauche :
  - Secteur d'activité (code NAF / catégorie)
  - Localisation (ville, département, rayon géographique)
  - Tranche d'effectif
  - Date de création (min/max)
  - Statut juridique (SAS, SARL, etc.)
  - Statut (active / cessée)
  - Labels (ESS, Qualiopi)
- Résultats en liste avec aperçu rapide (nom, SIRET, activité, ville, effectif)
- Actions rapides : voir fiche, ajouter à une liste, exporter
- Carte interactive à droite (Leaflet) montrant les résultats géolocalisés

### 4.2 Page Assistant (chatbot)

- Interface de chat conversationnel
- Langage naturel : "Trouve-moi des boulangeries à Marseille créées depuis 2023"
- Gemini interprète, interroge les APIs, renvoie les résultats formatés
- Résultats cliquables pour voir la fiche ou ajouter à une liste

### 4.3 Page Mes Listes

- Créer / renommer / supprimer des listes de prospects
- Ajouter/retirer des entreprises
- Notes personnelles par prospect
- Export CSV/Excel par liste
- Compteur de prospects par liste

### 4.4 Page Dashboard

- Statistiques sur les recherches et les listes
- Répartition géographique des prospects (carte)
- Répartition par secteur d'activité (graphiques)
- Historique des recherches récentes

## 5. Fiche entreprise détaillée

Panneau latéral qui s'ouvre au clic sur une entreprise.

| Catégorie | Champs |
|-----------|--------|
| **Identité** | SIREN, SIRET, raison sociale, nom commercial, NAF (code + libellé), forme juridique, date création/cessation |
| **Localisation** | Adresse complète, code postal, commune, département, région, coordonnées GPS |
| **Taille** | Tranche d'effectif, catégorie entreprise (PME, ETI, GE) |
| **Dirigeants** | Nom, prénom, fonction (quand disponible) |
| **Statut** | Active/cessée, statut diffusion, ESS, Qualiopi |
| **Actions** | Ajouter à une liste, exporter, lien vers Annuaire des Entreprises |

Les champs non disponibles affichent clairement "Non disponible".

## 6. Modèle de données SQLite

### Table `entreprises` (cache)

| Colonne | Type | Description |
|---------|------|-------------|
| siren | TEXT PK | Identifiant unique |
| siret_siege | TEXT | SIRET du siège |
| raison_sociale | TEXT | Nom légal |
| nom_commercial | TEXT | Nom d'usage |
| code_naf | TEXT | Code activité |
| libelle_naf | TEXT | Libellé activité |
| forme_juridique | TEXT | SAS, SARL, etc. |
| date_creation | TEXT | Date ISO |
| tranche_effectif | TEXT | Tranche INSEE |
| categorie_entreprise | TEXT | PME, ETI, GE |
| adresse_complete | TEXT | Adresse complète |
| code_postal | TEXT | Code postal |
| commune | TEXT | Ville |
| departement | TEXT | Département |
| region | TEXT | Région |
| latitude | REAL | Coordonnée GPS |
| longitude | REAL | Coordonnée GPS |
| dirigeant_nom | TEXT | Nom du dirigeant |
| dirigeant_fonction | TEXT | Fonction |
| statut | TEXT | active / cessée |
| est_ess | BOOLEAN | Économie sociale et solidaire |
| est_qualiopi | BOOLEAN | Certification Qualiopi |
| donnees_brutes | JSON | Réponse API complète |
| cached_at | DATETIME | Date de mise en cache |
| updated_at | DATETIME | Dernière mise à jour |

### Table `listes`

| Colonne | Type | Description |
|---------|------|-------------|
| id | INTEGER PK AUTO | Identifiant |
| nom | TEXT | Nom de la liste |
| description | TEXT | Description |
| created_at | DATETIME | Date création |
| updated_at | DATETIME | Dernière modification |

### Table `listes_entreprises`

| Colonne | Type | Description |
|---------|------|-------------|
| liste_id | FK → listes.id | Référence liste |
| siren | FK → entreprises.siren | Référence entreprise |
| note | TEXT | Note du commercial |
| added_at | DATETIME | Date d'ajout |

### Table `historique_recherches`

| Colonne | Type | Description |
|---------|------|-------------|
| id | INTEGER PK AUTO | Identifiant |
| type | TEXT | 'chat' ou 'filtre' |
| requete | TEXT | Question ou JSON des filtres |
| nb_resultats | INTEGER | Nombre de résultats |
| created_at | DATETIME | Date de la recherche |
| resultats_ids | JSON | Liste des SIREN retournés |

### Stratégie de cache

- Chaque entreprise consultée via l'API est stockée dans `entreprises`
- Avant un appel API, le cache est vérifié — si l'entrée a moins de 7 jours, elle est servie directement
- Le commercial peut forcer un rafraîchissement depuis la fiche

## 7. Intégration Gemini

### System prompt

Gemini reçoit un prompt système définissant :
- Son rôle : assistant de prospection B2B spécialisé dans les entreprises françaises
- Les filtres disponibles et leurs valeurs possibles (codes NAF, tranches d'effectif, formes juridiques)
- Le format de sortie structuré (JSON de paramètres de recherche)
- Des exemples few-shot de questions → paramètres

### Deux modes d'appel

| Mode | Déclencheur | Rôle de Gemini |
|------|-------------|----------------|
| **Interprétation** | Le commercial pose une question | Transforme le langage naturel en paramètres de recherche structurés (JSON) |
| **Synthèse** | Les résultats API reviennent | Résume, met en forme, donne des insights contextuels |

### Gestion des cas limites

- **Question floue** : Gemini demande des précisions
- **Pas de résultats** : Gemini suggère d'élargir les critères
- **Trop de résultats** : Gemini propose d'affiner

## 8. Stack technique

| Couche | Technologie | Raison |
|--------|-------------|--------|
| Framework | Next.js 15 (App Router) | Fullstack, SSR, API routes |
| Langage | TypeScript | Typage, fiabilité |
| UI | Tailwind CSS + shadcn/ui | Composants pro, rapide |
| Chat | Vercel AI SDK | Streaming Gemini, hooks React |
| Carte | Leaflet + react-leaflet | Open source, données OSM |
| Graphiques | Recharts | Simple, intégré React |
| Base de données | better-sqlite3 | Synchrone, performant, zéro config |
| ORM | Drizzle ORM | Léger, type-safe, SQLite |
| HTTP | fetch natif | Appels MCP DataGouv et API Entreprises |
| Export | xlsx (SheetJS) | CSV et Excel |
| IA | @google/generative-ai | SDK officiel Gemini |

## 9. Structure du projet

```
datagouv/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                      # Recherche (accueil)
│   │   ├── assistant/
│   │   │   └── page.tsx                  # Chatbot
│   │   ├── listes/
│   │   │   └── page.tsx                  # Mes Listes
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # Dashboard
│   │   └── api/
│   │       ├── search/route.ts           # Recherche entreprises
│   │       ├── chat/route.ts             # Chat Gemini (streaming)
│   │       ├── entreprise/[siren]/route.ts # Fiche détaillée
│   │       ├── listes/route.ts           # CRUD listes
│   │       └── export/route.ts           # Export CSV/Excel
│   ├── lib/
│   │   ├── datagouv.ts                   # Client MCP DataGouv
│   │   ├── entreprises-api.ts            # Client API Recherche Entreprises
│   │   ├── gemini.ts                     # Config et prompts Gemini
│   │   ├── db.ts                         # Connexion SQLite + Drizzle
│   │   └── cache.ts                      # Logique de cache
│   ├── db/
│   │   ├── schema.ts                     # Schéma Drizzle
│   │   └── migrations/
│   ├── components/
│   │   ├── sidebar.tsx
│   │   ├── search-filters.tsx
│   │   ├── entreprise-card.tsx
│   │   ├── entreprise-detail.tsx
│   │   ├── chat-interface.tsx
│   │   ├── map-view.tsx
│   │   ├── liste-manager.tsx
│   │   └── dashboard-charts.tsx
│   └── types/
│       └── index.ts
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── drizzle.config.ts
└── next.config.ts
```

## 10. Sources de données externes

| Source | URL | Usage | Auth |
|--------|-----|-------|------|
| MCP DataGouv | `https://mcp.data.gouv.fr/mcp` | Datasets, métadonnées, données tabulaires | Aucune |
| API Recherche Entreprises | `https://recherche-entreprises.api.gouv.fr` | Recherche textuelle + géo | Aucune (7 req/s) |
| Gemini API | `https://generativelanguage.googleapis.com` | Intelligence IA | Clé API (.env) |
| OpenStreetMap tiles | `https://tile.openstreetmap.org` | Fond de carte Leaflet | Aucune |

### Quand utiliser quelle source

- **API Recherche Entreprises** : source principale pour la prospection. Recherche textuelle (nom, adresse, dirigeants), recherche géographique (lat/lng + rayon), filtres NAF/effectif. Retourne les infos SIRENE structurées.
- **MCP DataGouv** : enrichissement complémentaire. Accès aux 74k+ datasets publics (données financières, subventions, marchés publics, etc.) et aux dataservices enregistrés. Utilisé quand le commercial veut aller au-delà des infos SIRENE de base.
- **Gemini** : ne contacte jamais les APIs directement. Il reçoit la question, produit les paramètres de recherche (JSON), puis reçoit les résultats pour les synthétiser.

## 11. Scope MVP

### Inclus

- Recherche par filtres avec résultats en liste + carte
- Chatbot Gemini pour recherche en langage naturel
- Fiche entreprise détaillée (panneau latéral)
- Listes de prospects (créer, ajouter, supprimer)
- Export CSV/Excel
- Historique des recherches
- Dashboard avec stats et graphiques
- Cache SQLite progressif (TTL 7 jours)

### Exclus

- Authentification / multi-utilisateurs
- Envoi d'emails ou intégration CRM directe
- Scraping de données hors APIs officielles
- Notifications / alertes automatiques
- Application mobile
- Déploiement cloud

## 12. Contraintes et risques

| Contrainte | Impact | Mitigation |
|------------|--------|------------|
| Rate limit API Entreprises (7 req/s) | Recherches lentes si beaucoup de résultats | Cache SQLite + pagination |
| Données dirigeants parfois absentes | Fiches incomplètes | Afficher "Non disponible" |
| Restriction diffusion partielle (RGPD) | Entreprises individuelles masquées | Respecter le statut de diffusion |
| MCP DataGouv expérimental | Peut évoluer/casser | Abstraction dans `lib/datagouv.ts` |
| Tabulaire limité (CSV ≤100Mo, XLSX ≤12.5Mo) | Gros datasets inaccessibles via query | Fallback `download_and_parse_resource` |

## 13. Conformité légale

- Les données SIRENE sont libres de réutilisation **sauf** pour la prospection des personnes ayant demandé la non-diffusion (statut de diffusion partielle)
- L'application respecte le champ `statut_diffusion` et n'affiche pas les entreprises en diffusion partielle dans un contexte de prospection
- Aucune donnée personnelle n'est collectée au-delà de ce que fournissent les APIs publiques
