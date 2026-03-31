"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/chat-interface";
import { EntrepriseDetail } from "@/components/entreprise-detail";
import { AddToListDialog } from "@/components/add-to-list-dialog";
import type { Entreprise } from "@/types";

export default function AssistantPage() {
  const [selectedSiren, setSelectedSiren] = useState<string | null>(null);
  const [addToListEntreprise, setAddToListEntreprise] = useState<Entreprise | null>(null);

  return (
    <div className="flex h-full">
      <div className="flex-1">
        <ChatInterface
          onSelectEntreprise={(e) => setSelectedSiren(e.siren)}
          onAddToList={setAddToListEntreprise}
        />
      </div>
      <EntrepriseDetail
        siren={selectedSiren}
        onClose={() => setSelectedSiren(null)}
        onAddToList={setAddToListEntreprise}
      />
      <AddToListDialog
        entreprise={addToListEntreprise}
        onClose={() => setAddToListEntreprise(null)}
      />
    </div>
  );
}
