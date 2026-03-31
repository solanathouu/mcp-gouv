# DataGouv Prospection B2B

Outil de prospection B2B exploitant les donnees ouvertes francaises (MCP DataGouv + API Recherche Entreprises) avec chatbot Gemini.

## Current Project State

| Aspect | Status |
|--------|--------|
| Code | Done — MVP complet, toutes les features implementees |
| Config | Done — Next.js 15, SQLite, Gemini, Tailwind, shadcn/ui |
| Tests | 34 tests passent (6 fichiers) — pas de tests d'integration |
| Build | Clean — 4 pages statiques, 10 routes dynamiques |
| Securite | Cle API purgee de l'historique git, .env gitignored |
| MCP DataGouv | Integre dans chat (enrichissement datasets) et fiche entreprise |

## Stack

- **Framework** : Next.js 15 (App Router) + TypeScript
- **UI** : Tailwind CSS + shadcn/ui + Leaflet (carte) + Recharts (graphiques)
- **DB** : SQLite (better-sqlite3 + Drizzle ORM) — cache 7j, listes, historique
- **IA** : Gemini 2.0 Flash (interpretation NL + synthese resultats)
- **APIs** : API Recherche Entreprises (recherche + geo) + MCP DataGouv (datasets publics)

## Architecture

```
src/
  app/           — 4 pages + 10 API routes
  components/    — 12 composants React
  lib/           — 6 modules (cache, db, gemini, entreprises-api, datagouv, format)
  db/            — schema Drizzle
  types/         — interfaces TypeScript partagees
```

## Commands

```bash
npm run dev      # Dev server (http://localhost:3000)
npm run build    # Production build
npm test         # Vitest (34 tests)
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Recherche : barre chat rapide + filtres avances (accordeon) + resultats liste/carte |
| `/assistant` | Chatbot conversationnel Gemini |
| `/listes` | Gestion des listes de prospects (CRUD, export CSV/Excel) |
| `/dashboard` | KPIs, graphiques secteur/departement, historique recherches |

## API Routes

| Route | Methode | Description |
|-------|---------|-------------|
| `/api/search` | GET | Recherche par filtres + geo |
| `/api/entreprise/[siren]` | GET | Fiche entreprise + datasets MCP |
| `/api/chat` | POST | Chat Gemini (SSE streaming) |
| `/api/listes` | GET/POST | Lister / creer des listes |
| `/api/listes/[id]` | PUT/DELETE | Modifier / supprimer une liste |
| `/api/listes/[id]/entreprises` | GET/POST/DELETE | Gerer les entreprises d'une liste |
| `/api/export` | POST | Export CSV/Excel |
| `/api/historique` | GET | Historique des recherches |
| `/api/dashboard` | GET | Stats dashboard |

## Env

```
GEMINI_API_KEY=   # Cle API Google Gemini (dans .env, jamais committee)
```

## Rodin Score: 7/10

Dernier audit : 2026-03-31. Faiblesses restantes :
- Pas de tests d'integration (routes API, flux SSE)
- Logique SSE dupliquee entre page.tsx et chat-interface.tsx
- page.tsx trop gros (273 lignes) — extraire le hook SSE
- Pas de validation SIREN sur la route detail
- Historique ne deduplique pas

## Next Immediate Action

Extraire la logique SSE en hook partage `src/hooks/useChat.ts` pour supprimer la duplication entre `page.tsx` et `chat-interface.tsx`, et reduire la taille de page.tsx.
