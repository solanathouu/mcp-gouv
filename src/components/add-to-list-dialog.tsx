"use client";

import { useEffect, useState } from "react";
import { Check, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Entreprise, Liste } from "@/types";

interface AddToListDialogProps {
  entreprise: Entreprise | null;
  onClose: () => void;
}

export function AddToListDialog({ entreprise, onClose }: AddToListDialogProps) {
  const [listes, setListes] = useState<Liste[]>([]);
  const [newListName, setNewListName] = useState("");
  const [loading, setLoading] = useState(false);
  const [addedLists, setAddedLists] = useState<Set<number>>(new Set());
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (entreprise) {
      loadListes();
      setAddedLists(new Set());
      setNewListName("");
      setError(null);
    }
  }, [entreprise]);

  async function loadListes() {
    setLoading(true);
    try {
      const res = await fetch("/api/listes");
      if (!res.ok) throw new Error("Erreur lors du chargement des listes");
      const data = await res.json();
      setListes(data);
    } catch {
      setError("Impossible de charger les listes");
    } finally {
      setLoading(false);
    }
  }

  async function addToList(listeId: number) {
    if (!entreprise) return;
    try {
      const res = await fetch(`/api/listes/${listeId}/entreprises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siren: entreprise.siren }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'ajout");
      setAddedLists((prev) => new Set([...prev, listeId]));
    } catch {
      setError("Erreur lors de l'ajout à la liste");
    }
  }

  async function createAndAdd() {
    if (!newListName.trim() || !entreprise) return;
    setCreating(true);
    setError(null);
    try {
      // Créer la liste
      const resCreate = await fetch("/api/listes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: newListName.trim() }),
      });
      if (!resCreate.ok) throw new Error("Erreur lors de la création");
      const newListe: Liste = await resCreate.json();

      // Ajouter l'entreprise
      await addToList(newListe.id);

      // Recharger la liste
      await loadListes();
      setNewListName("");
    } catch {
      setError("Erreur lors de la création de la liste");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={!!entreprise} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter à une liste</DialogTitle>
        </DialogHeader>

        {entreprise && (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              {entreprise.nom_commercial || entreprise.raison_sociale}
              <span className="ml-2 font-mono text-xs">{entreprise.siren}</span>
            </p>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {/* Créer une nouvelle liste */}
            <div className="space-y-2">
              <Label htmlFor="new-list">Créer une nouvelle liste</Label>
              <div className="flex gap-2">
                <Input
                  id="new-list"
                  placeholder="Nom de la liste..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createAndAdd()}
                />
                <Button
                  onClick={createAndAdd}
                  disabled={!newListName.trim() || creating}
                  size="icon"
                  title="Créer et ajouter"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Listes existantes */}
            <div className="space-y-2">
              <Label>Listes existantes</Label>
              {loading ? (
                <p className="text-sm text-muted-foreground py-2">Chargement...</p>
              ) : listes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  Aucune liste. Créez-en une ci-dessus.
                </p>
              ) : (
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {listes.map((liste) => {
                    const isAdded = addedLists.has(liste.id);
                    return (
                      <button
                        key={liste.id}
                        onClick={() => !isAdded && addToList(liste.id)}
                        disabled={isAdded}
                        className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm text-left transition-colors ${
                          isAdded
                            ? "bg-green-50 text-green-700 cursor-default"
                            : "hover:bg-muted cursor-pointer"
                        }`}
                      >
                        <div>
                          <span className="font-medium">{liste.nom}</span>
                          {liste.count !== undefined && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({liste.count} entreprise{liste.count !== 1 ? "s" : ""})
                            </span>
                          )}
                        </div>
                        {isAdded && <Check className="h-4 w-4 text-green-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
