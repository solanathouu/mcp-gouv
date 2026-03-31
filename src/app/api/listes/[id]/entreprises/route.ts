import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { listes, listesEntreprises, entreprises } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listeId = parseInt(id);

    const rows = db
      .select({
        siren: entreprises.siren,
        siret_siege: entreprises.siret_siege,
        raison_sociale: entreprises.raison_sociale,
        nom_commercial: entreprises.nom_commercial,
        code_naf: entreprises.code_naf,
        libelle_naf: entreprises.libelle_naf,
        forme_juridique: entreprises.forme_juridique,
        nature_juridique: entreprises.nature_juridique,
        date_creation: entreprises.date_creation,
        date_fermeture: entreprises.date_fermeture,
        tranche_effectif: entreprises.tranche_effectif,
        categorie_entreprise: entreprises.categorie_entreprise,
        adresse_complete: entreprises.adresse_complete,
        code_postal: entreprises.code_postal,
        commune: entreprises.commune,
        departement: entreprises.departement,
        region: entreprises.region,
        latitude: entreprises.latitude,
        longitude: entreprises.longitude,
        dirigeant_nom: entreprises.dirigeant_nom,
        dirigeant_fonction: entreprises.dirigeant_fonction,
        statut: entreprises.statut,
        statut_diffusion: entreprises.statut_diffusion,
        est_ess: entreprises.est_ess,
        est_qualiopi: entreprises.est_qualiopi,
        nombre_etablissements: entreprises.nombre_etablissements,
        chiffre_affaires: entreprises.chiffre_affaires,
        resultat_net: entreprises.resultat_net,
        donnees_brutes: entreprises.donnees_brutes,
        cached_at: entreprises.cached_at,
        updated_at: entreprises.updated_at,
        note: listesEntreprises.note,
        added_at: listesEntreprises.added_at,
      })
      .from(listesEntreprises)
      .innerJoin(entreprises, eq(listesEntreprises.siren, entreprises.siren))
      .where(eq(listesEntreprises.liste_id, listeId))
      .all();

    return NextResponse.json(rows);
  } catch (error) {
    console.error("[listes/[id]/entreprises GET] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des entreprises de la liste" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listeId = parseInt(id);
    const { siren, note } = await request.json();

    if (!siren) {
      return NextResponse.json({ error: "Le SIREN est requis" }, { status: 400 });
    }

    db.insert(listesEntreprises)
      .values({ liste_id: listeId, siren, note: note ?? null })
      .onConflictDoNothing()
      .run();

    db.update(listes)
      .set({ updated_at: new Date().toISOString() })
      .where(eq(listes.id, listeId))
      .run();

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("[listes/[id]/entreprises POST] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout de l'entreprise dans la liste" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listeId = parseInt(id);
    const { siren } = await request.json();

    if (!siren) {
      return NextResponse.json({ error: "Le SIREN est requis" }, { status: 400 });
    }

    db.delete(listesEntreprises)
      .where(
        and(
          eq(listesEntreprises.liste_id, listeId),
          eq(listesEntreprises.siren, siren)
        )
      )
      .run();

    db.update(listes)
      .set({ updated_at: new Date().toISOString() })
      .where(eq(listes.id, listeId))
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[listes/[id]/entreprises DELETE] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'entreprise de la liste" },
      { status: 500 }
    );
  }
}
