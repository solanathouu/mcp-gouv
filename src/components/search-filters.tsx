"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchParams } from "@/types";

const NAF_SECTIONS = [
  { value: "A", label: "A — Agriculture, sylviculture et pêche" },
  { value: "B", label: "B — Industries extractives" },
  { value: "C", label: "C — Industrie manufacturière" },
  { value: "D", label: "D — Production et distribution d'électricité, de gaz, de vapeur et d'air conditionné" },
  { value: "E", label: "E — Production et distribution d'eau ; assainissement, gestion des déchets" },
  { value: "F", label: "F — Construction" },
  { value: "G", label: "G — Commerce ; réparation d'automobiles et de motocycles" },
  { value: "H", label: "H — Transports et entreposage" },
  { value: "I", label: "I — Hébergement et restauration" },
  { value: "J", label: "J — Information et communication" },
  { value: "K", label: "K — Activités financières et d'assurance" },
  { value: "L", label: "L — Activités immobilières" },
  { value: "M", label: "M — Activités spécialisées, scientifiques et techniques" },
  { value: "N", label: "N — Activités de services administratifs et de soutien" },
  { value: "O", label: "O — Administration publique" },
  { value: "P", label: "P — Enseignement" },
  { value: "Q", label: "Q — Santé humaine et action sociale" },
  { value: "R", label: "R — Arts, spectacles et activités récréatives" },
  { value: "S", label: "S — Autres activités de services" },
  { value: "T", label: "T — Activités des ménages en tant qu'employeurs" },
  { value: "U", label: "U — Activités extra-territoriales" },
];

interface SearchFiltersProps {
  onSearch: (params: SearchParams) => void;
  loading: boolean;
}

const DEFAULT_FORM = {
  q: "",
  section_activite_principale: "",
  code_naf: "",
  code_postal: "",
  departement: "",
  tranche_effectif_salarie: "",
  categorie_entreprise: "",
  ca_min: "",
  ca_max: "",
  est_ess: false,
  est_qualiopi: false,
};

export function SearchFilters({ onSearch, loading }: SearchFiltersProps) {
  const [form, setForm] = useState(DEFAULT_FORM);

  function handleChange(field: string, value: string | boolean | null) {
    setForm((prev) => ({ ...prev, [field]: value ?? "" }));
  }

  function handleSelectChange(field: string) {
    return (value: string | null) => handleChange(field, value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params: SearchParams = {};
    if (form.q) params.q = form.q;
    if (form.section_activite_principale && form.section_activite_principale !== "all")
      params.section_activite_principale = form.section_activite_principale;
    if (form.code_naf) params.code_naf = form.code_naf;
    if (form.code_postal) params.code_postal = form.code_postal;
    if (form.departement) params.departement = form.departement;
    if (form.tranche_effectif_salarie && form.tranche_effectif_salarie !== "all")
      params.tranche_effectif_salarie = form.tranche_effectif_salarie;
    if (form.categorie_entreprise && form.categorie_entreprise !== "all")
      params.categorie_entreprise = form.categorie_entreprise;
    if (form.ca_min) params.ca_min = Number(form.ca_min);
    if (form.ca_max) params.ca_max = Number(form.ca_max);
    if (form.est_ess) params.est_ess = true;
    if (form.est_qualiopi) params.est_qualiopi = true;
    onSearch(params);
  }

  function handleReset() {
    setForm(DEFAULT_FORM);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      {/* Recherche textuelle */}
      <div className="space-y-1.5">
        <Label htmlFor="q">Recherche</Label>
        <Input
          id="q"
          placeholder="Nom, SIREN, activité..."
          value={form.q}
          onChange={(e) => handleChange("q", e.target.value)}
        />
      </div>

      {/* Section NAF */}
      <div className="space-y-1.5">
        <Label htmlFor="section_naf">Section NAF</Label>
        <Select
          value={form.section_activite_principale || undefined}
          onValueChange={handleSelectChange("section_activite_principale")}
        >
          <SelectTrigger id="section_naf">
            <SelectValue placeholder="Toutes les sections" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les sections</SelectItem>
            {NAF_SECTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Code NAF précis */}
      <div className="space-y-1.5">
        <Label htmlFor="code_naf">Code NAF précis</Label>
        <Input
          id="code_naf"
          placeholder="Ex : 6201Z"
          value={form.code_naf}
          onChange={(e) => handleChange("code_naf", e.target.value)}
        />
      </div>

      {/* Code postal & Département */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="code_postal">Code postal</Label>
          <Input
            id="code_postal"
            placeholder="Ex : 75001"
            value={form.code_postal}
            onChange={(e) => handleChange("code_postal", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="departement">Département</Label>
          <Input
            id="departement"
            placeholder="Ex : 75"
            value={form.departement}
            onChange={(e) => handleChange("departement", e.target.value)}
          />
        </div>
      </div>

      {/* Tranche effectif */}
      <div className="space-y-1.5">
        <Label htmlFor="tranche_effectif">Tranche effectif</Label>
        <Select
          value={form.tranche_effectif_salarie || undefined}
          onValueChange={handleSelectChange("tranche_effectif_salarie")}
        >
          <SelectTrigger id="tranche_effectif">
            <SelectValue placeholder="Toutes les tranches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les tranches</SelectItem>
            <SelectGroup>
              <SelectLabel>Micro (0-9 salariés)</SelectLabel>
              <SelectItem value="00">0 salarié</SelectItem>
              <SelectItem value="01">1 à 2 salariés</SelectItem>
              <SelectItem value="02">3 à 5 salariés</SelectItem>
              <SelectItem value="03">6 à 9 salariés</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Petites (10-49 salariés)</SelectLabel>
              <SelectItem value="11">10 à 19 salariés</SelectItem>
              <SelectItem value="12">20 à 49 salariés</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Moyennes (50-199 salariés)</SelectLabel>
              <SelectItem value="21">50 à 99 salariés</SelectItem>
              <SelectItem value="22">100 à 199 salariés</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Intermédiaires (200-499 salariés)</SelectLabel>
              <SelectItem value="31">200 à 249 salariés</SelectItem>
              <SelectItem value="32">250 à 499 salariés</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Grandes (500+ salariés)</SelectLabel>
              <SelectItem value="41">500 à 999 salariés</SelectItem>
              <SelectItem value="42">1 000 à 1 999 salariés</SelectItem>
              <SelectItem value="51">2 000 à 4 999 salariés</SelectItem>
              <SelectItem value="52">5 000 à 9 999 salariés</SelectItem>
              <SelectItem value="53">10 000 salariés et plus</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Catégorie */}
      <div className="space-y-1.5">
        <Label htmlFor="categorie">Catégorie</Label>
        <Select
          value={form.categorie_entreprise || undefined}
          onValueChange={handleSelectChange("categorie_entreprise")}
        >
          <SelectTrigger id="categorie">
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            <SelectItem value="PME">PME — Petite et Moyenne Entreprise</SelectItem>
            <SelectItem value="ETI">ETI — Entreprise de Taille Intermédiaire</SelectItem>
            <SelectItem value="GE">GE — Grande Entreprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* CA min / max */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="ca_min">CA min (€)</Label>
          <Input
            id="ca_min"
            type="number"
            placeholder="0"
            min={0}
            value={form.ca_min}
            onChange={(e) => handleChange("ca_min", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ca_max">CA max (€)</Label>
          <Input
            id="ca_max"
            type="number"
            placeholder="Illimité"
            min={0}
            value={form.ca_max}
            onChange={(e) => handleChange("ca_max", e.target.value)}
          />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={form.est_ess}
            onChange={(e) => handleChange("est_ess", e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          Économie Sociale et Solidaire (ESS)
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={form.est_qualiopi}
            onChange={(e) => handleChange("est_qualiopi", e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          Certifié Qualiopi
        </label>
      </div>

      {/* Boutons */}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Recherche..." : "Rechercher"}
        </Button>
        <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
          Réinitialiser
        </Button>
      </div>
    </form>
  );
}
