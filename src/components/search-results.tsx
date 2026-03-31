"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntrepriseCard } from "@/components/entreprise-card";
import { Entreprise } from "@/types";

interface SearchResultsProps {
  results: Entreprise[];
  totalResults: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSelectEntreprise: (entreprise: Entreprise) => void;
  onAddToList: (entreprise: Entreprise) => void;
  loading: boolean;
}

export function SearchResults({
  results,
  totalResults,
  page,
  totalPages,
  onPageChange,
  onSelectEntreprise,
  onAddToList,
  loading,
}: SearchResultsProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        Recherche en cours...
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
        <p className="text-lg font-medium">Aucun résultat</p>
        <p className="text-sm">Modifiez vos critères de recherche et réessayez.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compteur */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          {totalResults.toLocaleString("fr-FR")} résultat{totalResults > 1 ? "s" : ""}
          {totalPages > 1 && ` — page ${page} / ${totalPages}`}
        </p>
      </div>

      {/* Liste */}
      <div className="grid gap-3">
        {results.map((entreprise) => (
          <EntrepriseCard
            key={entreprise.siren}
            entreprise={entreprise}
            onSelect={onSelectEntreprise}
            onAddToList={onAddToList}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Suivant
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
