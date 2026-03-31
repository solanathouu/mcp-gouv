"use client";

import { Eye, ExternalLink, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Entreprise, DataGouvDataset } from "@/types";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  entreprises?: Entreprise[];
  datasets?: DataGouvDataset[];
  onSelectEntreprise?: (entreprise: Entreprise) => void;
  onAddToList?: (entreprise: Entreprise) => void;
}

export function ChatMessage({
  role,
  content,
  entreprises,
  datasets,
  onSelectEntreprise,
  onAddToList,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm"
        }`}
      >
        {/* Message text */}
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>

        {/* Mini entreprise list */}
        {!isUser && entreprises && entreprises.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Entreprises trouvées
            </p>
            {entreprises.slice(0, 5).map((e) => (
              <div
                key={e.siren}
                className="flex items-center justify-between gap-2 rounded-lg bg-background/50 border border-border/50 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">
                    {e.nom_commercial || e.raison_sociale}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {[e.commune, e.code_naf].filter(Boolean).join(" — ")}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {onSelectEntreprise && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      title="Voir la fiche"
                      onClick={() => onSelectEntreprise(e)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {onAddToList && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      title="Ajouter à une liste"
                      onClick={() => onAddToList(e)}
                    >
                      <ListPlus className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {entreprises.length > 5 && (
              <p className="text-xs text-muted-foreground">
                + {entreprises.length - 5} autre{entreprises.length - 5 > 1 ? "s" : ""} résultat{entreprises.length - 5 > 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}

        {/* Public datasets section */}
        {!isUser && datasets && datasets.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Données publiques associées
            </p>
            {datasets.map((d) => (
              <div
                key={d.id}
                className="rounded-lg bg-background/50 border border-border/50 px-3 py-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs leading-snug line-clamp-1">{d.title}</p>
                    {d.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {d.description.length > 120 ? `${d.description.slice(0, 120)}…` : d.description}
                      </p>
                    )}
                  </div>
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs text-primary flex items-center gap-0.5 hover:underline mt-0.5"
                    title="Voir sur data.gouv.fr"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span className="sr-only">Voir sur data.gouv.fr</span>
                  </a>
                </div>
                {d.organization && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{d.organization}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
