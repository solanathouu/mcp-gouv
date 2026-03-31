import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { listes, listesEntreprises } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const rows = db
      .select({
        id: listes.id,
        nom: listes.nom,
        description: listes.description,
        created_at: listes.created_at,
        updated_at: listes.updated_at,
        count: sql<number>`(SELECT COUNT(*) FROM listes_entreprises WHERE liste_id = ${listes.id})`,
      })
      .from(listes)
      .all();

    return NextResponse.json(rows);
  } catch (error) {
    console.error("[listes GET] Error:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des listes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nom, description } = await request.json();

    if (!nom) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
    }

    const result = db
      .insert(listes)
      .values({ nom, description: description ?? null })
      .returning()
      .get();

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[listes POST] Error:", error);
    return NextResponse.json({ error: "Erreur lors de la création de la liste" }, { status: 500 });
  }
}
