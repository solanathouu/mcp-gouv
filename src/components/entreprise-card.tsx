"use client";

import { Eye, ListPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Entreprise } from "@/types";

interface EntrepriseCardProps {
  entreprise: Entreprise;
  onSelect: (entreprise: Entreprise) => void;
  onAddToList: (entreprise: Entreprise) => void;
}

function formatEffectif(tranche: string | null): string {
  const map: Record<string, string> = {
    "00": "0 salarié",
    "01": "1-2",
    "02": "3-5",
    "03": "6-9",
    "11": "10-19",
    "12": "20-49",
    "21": "50-99",
    "22": "100-199",
    "31": "200-249",
    "32": "250-499",
    "41": "500-999",
    "42": "1 000-1 999",
    "51": "2 000-4 999",
    "52": "5 000-9 999",
    "53": "10 000+",
  };
  return tranche ? (map[tranche] ?? tranche) : "N/A";
}

export function EntrepriseCard({ entreprise, onSelect, onAddToList }: EntrepriseCardProps) {
  const isActive = entreprise.statut === "A";
  const displayName = entreprise.nom_commercial || entreprise.raison_sociale;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base truncate">{displayName}</CardTitle>
            {entreprise.nom_commercial && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {entreprise.raison_sociale}
              </p>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              title="Voir la fiche"
              onClick={() => onSelect(entreprise)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              title="Ajouter à une liste"
              onClick={() => onAddToList(entreprise)}
            >
              <ListPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Localisation */}
        <p className="text-sm text-muted-foreground">
          {[entreprise.commune, entreprise.departement].filter(Boolean).join(" — ") || "Adresse inconnue"}
        </p>

        {/* Code NAF */}
        {entreprise.code_naf && (
          <p className="text-xs text-muted-foreground">
            NAF : {entreprise.code_naf}
            {entreprise.libelle_naf ? ` — ${entreprise.libelle_naf}` : ""}
          </p>
        )}

        {/* Effectif */}
        <p className="text-xs text-muted-foreground">
          Effectif : {formatEffectif(entreprise.tranche_effectif)}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Cessée"}
          </Badge>
          {entreprise.est_ess && (
            <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
              ESS
            </Badge>
          )}
          {entreprise.est_qualiopi && (
            <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
              Qualiopi
            </Badge>
          )}
          {entreprise.categorie_entreprise && (
            <Badge variant="outline">{entreprise.categorie_entreprise}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
