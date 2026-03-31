import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { listesEntreprises, entreprises } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as XLSX from "xlsx";
import type { Entreprise } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { liste_id, format } = await request.json();

    if (!liste_id) {
      return NextResponse.json({ error: "liste_id est requis" }, { status: 400 });
    }

    const rows = db
      .select({
        siren: entreprises.siren,
        raison_sociale: entreprises.raison_sociale,
        nom_commercial: entreprises.nom_commercial,
        code_naf: entreprises.code_naf,
        libelle_naf: entreprises.libelle_naf,
        nature_juridique: entreprises.nature_juridique,
        date_creation: entreprises.date_creation,
        tranche_effectif: entreprises.tranche_effectif,
        categorie_entreprise: entreprises.categorie_entreprise,
        adresse_complete: entreprises.adresse_complete,
        code_postal: entreprises.code_postal,
        commune: entreprises.commune,
        departement: entreprises.departement,
        region: entreprises.region,
        dirigeant_nom: entreprises.dirigeant_nom,
        dirigeant_fonction: entreprises.dirigeant_fonction,
        statut: entreprises.statut,
        est_ess: entreprises.est_ess,
        est_qualiopi: entreprises.est_qualiopi,
        nombre_etablissements: entreprises.nombre_etablissements,
        chiffre_affaires: entreprises.chiffre_affaires,
        resultat_net: entreprises.resultat_net,
        note: listesEntreprises.note,
        added_at: listesEntreprises.added_at,
      })
      .from(listesEntreprises)
      .innerJoin(entreprises, eq(listesEntreprises.siren, entreprises.siren))
      .where(eq(listesEntreprises.liste_id, liste_id))
      .all();

    // Build worksheet data
    const headers = [
      "SIREN",
      "Raison sociale",
      "Nom commercial",
      "Code NAF",
      "Libellé NAF",
      "Nature juridique",
      "Date création",
      "Tranche effectif",
      "Catégorie entreprise",
      "Adresse",
      "Code postal",
      "Commune",
      "Département",
      "Région",
      "Dirigeant",
      "Fonction dirigeant",
      "Statut",
      "ESS",
      "Qualiopi",
      "Nb établissements",
      "Chiffre d'affaires",
      "Résultat net",
      "Note",
      "Ajouté le",
    ];

    const data = rows.map((r) => [
      r.siren,
      r.raison_sociale,
      r.nom_commercial ?? "",
      r.code_naf ?? "",
      r.libelle_naf ?? "",
      r.nature_juridique ?? "",
      r.date_creation ?? "",
      r.tranche_effectif ?? "",
      r.categorie_entreprise ?? "",
      r.adresse_complete ?? "",
      r.code_postal ?? "",
      r.commune ?? "",
      r.departement ?? "",
      r.region ?? "",
      r.dirigeant_nom ?? "",
      r.dirigeant_fonction ?? "",
      r.statut,
      r.est_ess ? "Oui" : "Non",
      r.est_qualiopi ? "Oui" : "Non",
      r.nombre_etablissements ?? "",
      r.chiffre_affaires ?? "",
      r.resultat_net ?? "",
      r.note ?? "",
      r.added_at,
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    if (format === "xlsx") {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Entreprises");
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="liste_${liste_id}.xlsx"`,
        },
      });
    } else {
      // Default: CSV with semicolon separator
      const csvContent = XLSX.utils.sheet_to_csv(worksheet, { FS: ";" });
      const buffer = Buffer.from("\uFEFF" + csvContent, "utf-8");

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="liste_${liste_id}.csv"`,
        },
      });
    }
  } catch (error) {
    console.error("[export] Error:", error);
    return NextResponse.json({ error: "Erreur lors de l'export" }, { status: 500 });
  }
}
