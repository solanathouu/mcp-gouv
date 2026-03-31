"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, FileSpreadsheet, MoreVertical, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Entreprise, Liste } from "@/types";

interface ListeEntrepriseRow extends Entreprise {
  note: string | null;
  added_at: string;
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

export function ListeManager() {
  const [listes, setListes] = useState<Liste[]>([]);
  const [selectedListe, setSelectedListe] = useState<Liste | null>(null);
  const [entreprises, setEntreprises] = useState<ListeEntrepriseRow[]>([]);
  const [loadingListes, setLoadingListes] = useState(true);
  const [loadingEntreprises, setLoadingEntreprises] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const loadListes = useCallback(async () => {
    setLoadingListes(true);
    setError(null);
    try {
      const res = await fetch("/api/listes");
      if (!res.ok) throw new Error("Erreur lors du chargement des listes");
      const data: Liste[] = await res.json();
      setListes(data);
    } catch {
      setError("Impossible de charger les listes");
    } finally {
      setLoadingListes(false);
    }
  }, []);

  useEffect(() => {
    loadListes();
  }, [loadListes]);

  async function loadEntreprises(listeId: number) {
    setLoadingEntreprises(true);
    setError(null);
    try {
      const res = await fetch(`/api/listes/${listeId}/entreprises`);
      if (!res.ok) throw new Error("Erreur lors du chargement des entreprises");
      const data = await res.json();
      setEntreprises(data);
    } catch {
      setError("Impossible de charger les entreprises de cette liste");
      setEntreprises([]);
    } finally {
      setLoadingEntreprises(false);
    }
  }

  function handleSelectListe(liste: Liste) {
    setSelectedListe(liste);
    loadEntreprises(liste.id);
  }

  async function handleCreateListe() {
    if (!newListName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/listes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: newListName.trim() }),
      });
      if (!res.ok) throw new Error("Erreur lors de la création");
      setNewListName("");
      await loadListes();
    } catch {
      setError("Impossible de créer la liste");
    } finally {
      setCreating(false);
    }
  }

  async function handleRenameListe(id: number) {
    if (!editName.trim()) return;
    setError(null);
    try {
      const res = await fetch(`/api/listes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: editName.trim() }),
      });
      if (!res.ok) throw new Error("Erreur lors du renommage");
      setEditingId(null);
      await loadListes();
      if (selectedListe?.id === id) {
        setSelectedListe((prev) => prev ? { ...prev, nom: editName.trim() } : prev);
      }
    } catch {
      setError("Impossible de renommer la liste");
    }
  }

  async function handleDeleteListe(id: number) {
    setError(null);
    try {
      const res = await fetch(`/api/listes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      if (selectedListe?.id === id) {
        setSelectedListe(null);
        setEntreprises([]);
      }
      await loadListes();
    } catch {
      setError("Impossible de supprimer la liste");
    }
  }

  async function handleRemoveEntreprise(siren: string) {
    if (!selectedListe) return;
    setError(null);
    try {
      const res = await fetch(`/api/listes/${selectedListe.id}/entreprises/${siren}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      setEntreprises((prev) => prev.filter((e) => e.siren !== siren));
      // Update count in list
      setListes((prev) =>
        prev.map((l) =>
          l.id === selectedListe.id
            ? { ...l, count: (l.count ?? 1) - 1 }
            : l
        )
      );
    } catch {
      setError("Impossible de retirer l'entreprise");
    }
  }

  async function handleExport(format: "csv" | "xlsx") {
    if (!selectedListe) return;
    setExportLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liste_id: selectedListe.id, format }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedListe.nom}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Erreur lors de l'export");
    } finally {
      setExportLoading(false);
    }
  }

  return (
    <div className="flex h-full">
      {/* Left panel — list of listes */}
      <div className="w-80 border-r flex flex-col shrink-0">
        <div className="p-4 border-b">
          <h2 className="text-base font-semibold mb-3">Mes listes</h2>
          {/* Create new list */}
          <div className="flex gap-2">
            <Input
              placeholder="Nouvelle liste..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateListe()}
              disabled={creating}
            />
            <Button
              size="icon"
              onClick={handleCreateListe}
              disabled={!newListName.trim() || creating}
              title="Créer"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {error && (
          <div className="px-4 py-2 text-sm text-destructive bg-destructive/5">{error}</div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loadingListes ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
              Chargement...
            </div>
          ) : listes.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm px-4 text-center">
              Aucune liste. Créez-en une ci-dessus.
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {listes.map((liste) => (
                <div
                  key={liste.id}
                  className={`group flex items-center rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
                    selectedListe?.id === liste.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => editingId !== liste.id && handleSelectListe(liste)}
                >
                  {editingId === liste.id ? (
                    /* Inline edit mode */
                    <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameListe(liste.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="h-7 text-sm"
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleRenameListe(liste.id)}>
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{liste.nom}</p>
                        {liste.count !== undefined && (
                          <p className="text-xs text-muted-foreground">
                            {liste.count} entreprise{liste.count !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(liste.id);
                              setEditName(liste.nom);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Renommer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteListe(liste.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel — entreprises in selected list */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedListe ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">Sélectionnez une liste</p>
              <p className="text-sm mt-1">Choisissez une liste dans le panneau gauche pour voir les entreprises</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
              <div>
                <h2 className="text-base font-semibold">{selectedListe.nom}</h2>
                <p className="text-sm text-muted-foreground">
                  {entreprises.length} entreprise{entreprises.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("csv")}
                  disabled={exportLoading || entreprises.length === 0}
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("xlsx")}
                  disabled={exportLoading || entreprises.length === 0}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-1.5" />
                  Excel
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              {loadingEntreprises ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
                  Chargement...
                </div>
              ) : entreprises.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
                  Aucune entreprise dans cette liste
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Raison sociale</TableHead>
                      <TableHead>Ville</TableHead>
                      <TableHead>Activité</TableHead>
                      <TableHead>Effectif</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entreprises.map((e) => (
                      <TableRow key={e.siren}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">
                              {e.nom_commercial || e.raison_sociale}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">{e.siren}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {[e.commune, e.departement].filter(Boolean).join(", ") || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {e.code_naf
                            ? `${e.code_naf}${e.libelle_naf ? ` — ${e.libelle_naf}` : ""}`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatEffectif(e.tranche_effectif)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {e.note || "—"}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            title="Retirer de la liste"
                            onClick={() => handleRemoveEntreprise(e.siren)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
