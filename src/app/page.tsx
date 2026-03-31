"use client";

import { useState } from "react";
import { List, Map } from "lucide-react";
import { SearchFilters } from "@/components/search-filters";
import { SearchResults } from "@/components/search-results";
import { EntrepriseDetail } from "@/components/entreprise-detail";
import { AddToListDialog } from "@/components/add-to-list-dialog";
import { MapView } from "@/components/map-view";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import type { Entreprise, SearchParams } from "@/types";

export default function SearchPage() {
  const [results, setResults] = useState<Entreprise[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentParams, setCurrentParams] = useState<SearchParams>({});
  const [selectedSiren, setSelectedSiren] = useState<string | null>(null);
  const [addToListEntreprise, setAddToListEntreprise] = useState<Entreprise | null>(null);

  async function handleSearch(params: SearchParams, pageNum = 1) {
    setLoading(true);
    setError(null);
    setCurrentParams(params);
    setPage(pageNum);

    try {
      const searchParams = new URLSearchParams();
      if (params.q) searchParams.set("q", params.q);
      if (params.code_naf) searchParams.set("code_naf", params.code_naf);
      if (params.code_postal) searchParams.set("code_postal", params.code_postal);
      if (params.code_commune) searchParams.set("code_commune", params.code_commune);
      if (params.departement) searchParams.set("departement", params.departement);
      if (params.region) searchParams.set("region", params.region);
      if (params.tranche_effectif_salarie) searchParams.set("tranche_effectif_salarie", params.tranche_effectif_salarie);
      if (params.categorie_entreprise) searchParams.set("categorie_entreprise", params.categorie_entreprise);
      if (params.nature_juridique) searchParams.set("nature_juridique", params.nature_juridique);
      if (params.section_activite_principale) searchParams.set("section_activite_principale", params.section_activite_principale);
      if (params.etat_administratif) searchParams.set("etat_administratif", params.etat_administratif);
      if (params.est_ess !== undefined) searchParams.set("est_ess", String(params.est_ess));
      if (params.est_qualiopi !== undefined) searchParams.set("est_qualiopi", String(params.est_qualiopi));
      if (params.est_entrepreneur_individuel !== undefined) searchParams.set("est_entrepreneur_individuel", String(params.est_entrepreneur_individuel));
      if (params.ca_min !== undefined) searchParams.set("ca_min", String(params.ca_min));
      if (params.ca_max !== undefined) searchParams.set("ca_max", String(params.ca_max));
      if (params.nom_personne) searchParams.set("nom_personne", params.nom_personne);
      searchParams.set("page", String(pageNum));
      if (params.per_page) searchParams.set("per_page", String(params.per_page));

      const res = await fetch(`/api/search?${searchParams.toString()}`);
      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("429");
        }
        throw new Error(`${res.status}`);
      }
      const data = await res.json();

      setResults(data.results ?? []);
      setTotalResults(data.total_results ?? 0);
      setTotalPages(data.total_pages ?? 0);
      setPage(data.page ?? pageNum);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("429")) {
        setError("L'API est temporairement surchargée. Réessayez dans quelques secondes.");
      } else {
        setError("Une erreur est survenue lors de la recherche. Veuillez réessayer.");
      }
      setResults([]);
      setTotalResults(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }

  function handlePageChange(newPage: number) {
    handleSearch(currentParams, newPage);
  }

  return (
    <div className="flex h-full">
      {/* Left column: filters */}
      <div className="w-72 border-r overflow-y-auto shrink-0">
        <SearchFilters onSearch={(params) => handleSearch(params, 1)} loading={loading} />
      </div>

      {/* Right area: tabs with results / map */}
      <div className="flex-1 flex flex-col overflow-hidden p-4">
        {error && (
          <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <Tabs defaultValue="liste" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mb-4 w-fit">
            <TabsTrigger value="liste">
              <List className="h-4 w-4 mr-1.5" />
              Liste
            </TabsTrigger>
            <TabsTrigger value="carte">
              <Map className="h-4 w-4 mr-1.5" />
              Carte
            </TabsTrigger>
          </TabsList>

          <TabsContent value="liste" className="flex-1 overflow-y-auto">
            <SearchResults
              results={results}
              totalResults={totalResults}
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onSelectEntreprise={(e) => setSelectedSiren(e.siren)}
              onAddToList={setAddToListEntreprise}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="carte" className="flex-1 overflow-hidden">
            <div className="h-full min-h-[500px]">
              <MapView
                entreprises={results}
                onSelect={(e) => setSelectedSiren(e.siren)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* EntrepriseDetail sheet */}
      <EntrepriseDetail
        siren={selectedSiren}
        onClose={() => setSelectedSiren(null)}
        onAddToList={setAddToListEntreprise}
      />

      {/* AddToList dialog */}
      <AddToListDialog
        entreprise={addToListEntreprise}
        onClose={() => setAddToListEntreprise(null)}
      />
    </div>
  );
}
