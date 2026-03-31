"use client";

import { useEffect, useState } from "react";
import { ExternalLink, ListPlus, RefreshCw } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Entreprise } from "@/types";
import { formatEffectif } from "@/lib/format";

interface EntrepriseDetailProps {
  siren: string | null;
  onClose: () => void;
  onAddToList: (entreprise: Entreprise) => void;
}

function formatCA(value: number | null): string {
  if (value === null) return "N/D";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} Md€`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} M€`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)} k€`;
  return `${value} €`;
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-muted-foreground shrink-0 mr-4">{label}</span>
      <span className="text-right font-medium break-all">{value || "N/D"}</span>
    </div>
  );
}

export function EntrepriseDetail({ siren, onClose, onAddToList }: EntrepriseDetailProps) {
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchData(s: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/entreprise/${s}`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setEntreprise(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (siren) {
      fetchData(siren);
    } else {
      setEntreprise(null);
    }
  }, [siren]);

  return (
    <Sheet open={!!siren} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pr-8">
          <SheetTitle className="text-left">
            {loading
              ? "Chargement..."
              : error
              ? "Erreur"
              : (entreprise?.nom_commercial || entreprise?.raison_sociale || "Fiche entreprise")}
          </SheetTitle>
        </SheetHeader>

        {loading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            Chargement de la fiche...
          </div>
        )}

        {error && (
          <div className="py-8 text-center text-destructive space-y-2">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={() => siren && fetchData(siren)}>
              Réessayer
            </Button>
          </div>
        )}

        {!loading && !error && entreprise && (
          <div className="mt-4 space-y-4">
            {/* Badges statut */}
            <div className="flex flex-wrap gap-2">
              <Badge variant={entreprise.statut === "A" ? "default" : "secondary"}>
                {entreprise.statut === "A" ? "Active" : "Cessée"}
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

            <Separator />

            {/* Identité */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Identité</h3>
              <Row label="SIREN" value={entreprise.siren} />
              <Row label="SIRET siège" value={entreprise.siret_siege} />
              <Row label="Code NAF" value={entreprise.code_naf} />
              <Row label="Libellé NAF" value={entreprise.libelle_naf} />
              <Row label="Forme juridique" value={entreprise.forme_juridique} />
              <Row label="Date création" value={entreprise.date_creation} />
              {entreprise.date_fermeture && (
                <Row label="Date fermeture" value={entreprise.date_fermeture} />
              )}
              <Row
                label="Nb établissements"
                value={entreprise.nombre_etablissements?.toString() ?? null}
              />
            </div>

            <Separator />

            {/* Adresse */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Adresse</h3>
              <Row label="Adresse complète" value={entreprise.adresse_complete} />
              <Row label="Code postal" value={entreprise.code_postal} />
              <Row label="Commune" value={entreprise.commune} />
              <Row label="Département" value={entreprise.departement} />
              <Row label="Région" value={entreprise.region} />
            </div>

            <Separator />

            {/* Effectif & Finances */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Effectif &amp; Finances</h3>
              <Row label="Effectif" value={formatEffectif(entreprise.tranche_effectif)} />
              <Row label="Catégorie" value={entreprise.categorie_entreprise} />
              <Row label="Chiffre d'affaires" value={formatCA(entreprise.chiffre_affaires)} />
              <Row label="Résultat net" value={formatCA(entreprise.resultat_net)} />
            </div>

            {/* Dirigeant */}
            {entreprise.dirigeant_nom && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold mb-2">Dirigeant</h3>
                  <Row label="Nom" value={entreprise.dirigeant_nom} />
                  <Row label="Fonction" value={entreprise.dirigeant_fonction} />
                </div>
              </>
            )}

            <Separator />

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-1 pb-4">
              <Button onClick={() => onAddToList(entreprise)} className="w-full">
                <ListPlus className="h-4 w-4 mr-2" />
                Ajouter à une liste
              </Button>
              <Button
                variant="outline"
                onClick={() => fetchData(entreprise.siren + "?refresh=true")}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser les données
              </Button>
              <a
                href={`https://annuaire-entreprises.data.gouv.fr/entreprise/${entreprise.siren}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline" }), "w-full")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Voir sur l&apos;annuaire officiel
              </a>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
