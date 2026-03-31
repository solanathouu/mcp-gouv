import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GeminiSearchIntent, Entreprise, DataGouvDataset } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const SYSTEM_PROMPT = `Tu es un assistant de prospection B2B spécialisé dans les entreprises françaises.
Tu aides un commercial non-technique à trouver des prospects via les données publiques françaises.

IMPORTANT: Tu communiques TOUJOURS en français.

Quand l'utilisateur pose une question de recherche d'entreprises, tu dois répondre UNIQUEMENT avec un JSON structuré.
Quand l'utilisateur pose une question générale ou de conversation, tu réponds normalement en texte.

## Format de réponse pour une recherche

Réponds avec ce JSON (et rien d'autre) :
\`\`\`json
{
  "type": "search",
  "params": {
    "q": "mots-clés de recherche",
    "code_naf": "code NAF si pertinent",
    "code_postal": "code postal si mentionné",
    "departement": "numéro département si mentionné",
    "region": "code région si mentionné",
    "tranche_effectif_salarie": "tranche si mentionnée",
    "categorie_entreprise": "PME, ETI ou GE si mentionné",
    "etat_administratif": "A pour active, C pour cessée",
    "est_ess": true/false,
    "est_qualiopi": true/false,
    "ca_min": nombre minimum de CA si mentionné,
    "ca_max": nombre maximum de CA si mentionné,
    "nom_personne": "nom du dirigeant si mentionné"
  }
}
\`\`\`

Pour une recherche géographique (autour d'un lieu) :
\`\`\`json
{
  "type": "search",
  "geo_params": {
    "lat": latitude,
    "long": longitude,
    "radius": rayon_en_km,
    "activite_principale": "code NAF si pertinent"
  }
}
\`\`\`

## Si la question est floue
\`\`\`json
{
  "type": "clarification",
  "message": "Ta question de clarification en français"
}
\`\`\`

## Tranches d'effectif salariés (valeurs possibles)
- "00" : 0 salarié
- "01" : 1-2 salariés
- "02" : 3-5 salariés
- "03" : 6-9 salariés
- "11" : 10-19 salariés
- "12" : 20-49 salariés
- "21" : 50-99 salariés
- "22" : 100-199 salariés
- "31" : 200-249 salariés
- "32" : 250-499 salariés
- "41" : 500-999 salariés
- "42" : 1000-1999 salariés
- "51" : 2000-4999 salariés
- "52" : 5000-9999 salariés
- "53" : 10000+ salariés
Plusieurs tranches séparées par des virgules. Ex: "12,21,22" pour 20 à 199 salariés.

## Sections d'activité principale (valeurs possibles)
- A : Agriculture
- B : Industries extractives
- C : Industrie manufacturière
- D : Électricité, gaz
- E : Eau, assainissement, déchets
- F : Construction
- G : Commerce
- H : Transports
- I : Hébergement et restauration
- J : Information et communication
- K : Finance et assurance
- L : Immobilier
- M : Activités scientifiques et techniques
- N : Services administratifs
- O : Administration publique
- P : Enseignement
- Q : Santé
- R : Arts, spectacles
- S : Autres services
- T : Ménages employeurs
- U : Organisations extraterritoriales

## Exemples

Utilisateur: "Trouve-moi des restaurants à Lyon"
→ {"type":"search","params":{"q":"restaurant","code_postal":"69000","etat_administratif":"A","section_activite_principale":"I"}}

Utilisateur: "Des entreprises de BTP dans le 13 avec plus de 50 salariés"
→ {"type":"search","params":{"section_activite_principale":"F","departement":"13","tranche_effectif_salarie":"21,22,31,32,41,42,51,52,53","etat_administratif":"A"}}

Utilisateur: "Bonjour, comment ça marche ?"
→ Réponds normalement en texte sans JSON.

N'inclus que les paramètres pertinents. Omets les champs null/undefined.
Par défaut, filtre sur etat_administratif: "A" (entreprises actives) sauf si l'utilisateur demande explicitement des entreprises fermées.`;

export function parseSearchIntent(text: string): GeminiSearchIntent {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) {
    return { type: "general", message: text };
  }
  try {
    const parsed = JSON.parse(jsonMatch[1].trim());
    if (parsed.type === "search" || parsed.type === "clarification") {
      return parsed as GeminiSearchIntent;
    }
    return { type: "general", message: text };
  } catch {
    return { type: "general", message: text };
  }
}

export function getGeminiModel() {
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPT,
  });
}

export async function interpretQuery(userMessage: string): Promise<GeminiSearchIntent> {
  const model = getGeminiModel();
  const result = await model.generateContent(userMessage);
  const text = result.response.text();
  return parseSearchIntent(text);
}

export async function synthesizeResults(
  userMessage: string,
  entreprises: Entreprise[],
  totalResults: number,
  datasets?: DataGouvDataset[]
): Promise<string> {
  const model = getGeminiModel();
  const summary = entreprises.slice(0, 10).map((e) => ({
    nom: e.raison_sociale,
    siren: e.siren,
    activite: e.code_naf,
    ville: e.commune,
    effectif: e.tranche_effectif,
    dirigeant: e.dirigeant_nom,
    ca: e.chiffre_affaires,
  }));

  const datasetsSection =
    datasets && datasets.length > 0
      ? `\n\nJeux de données publics disponibles sur data.gouv.fr (à mentionner si pertinent) :\n${datasets
          .map((d) => `- ${d.title} (${d.organization}) : ${d.description.slice(0, 120)}`)
          .join("\n")}`
      : "";

  const prompt = `L'utilisateur a demandé : "${userMessage}"

Voici les résultats (${totalResults} au total, les ${summary.length} premiers affichés) :
${JSON.stringify(summary, null, 2)}${datasetsSection}

Fais une synthèse concise et utile pour un commercial. Mentionne les points clés, donne des insights si possible.${
    datasetsSection ? " Si des jeux de données publics sont pertinents, mentionne-les brièvement." : ""
  }
Ne génère PAS de JSON. Réponds en texte naturel français.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}
