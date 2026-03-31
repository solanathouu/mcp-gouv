import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { listes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listeId = parseInt(id);
    const { nom, description } = await request.json();

    if (!nom) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
    }

    const result = db
      .update(listes)
      .set({
        nom,
        description: description ?? null,
        updated_at: new Date().toISOString(),
      })
      .where(eq(listes.id, listeId))
      .returning()
      .get();

    if (!result) {
      return NextResponse.json({ error: "Liste non trouvée" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[listes/[id] PUT] Error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour de la liste" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listeId = parseInt(id);

    const result = db
      .delete(listes)
      .where(eq(listes.id, listeId))
      .returning()
      .get();

    if (!result) {
      return NextResponse.json({ error: "Liste non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[listes/[id] DELETE] Error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression de la liste" }, { status: 500 });
  }
}
