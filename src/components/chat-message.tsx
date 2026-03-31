"use client";

import { Eye, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Entreprise } from "@/types";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  entreprises?: Entreprise[];
  onSelectEntreprise?: (entreprise: Entreprise) => void;
  onAddToList?: (entreprise: Entreprise) => void;
}

export function ChatMessage({
  role,
  content,
  entreprises,
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
      </div>
    </div>
  );
}
