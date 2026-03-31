import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { historiqueRecherches } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = db
      .select()
      .from(historiqueRecherches)
      .orderBy(desc(historiqueRecherches.created_at))
      .limit(50)
      .all();

    return NextResponse.json(rows);
  } catch (error) {
    console.error("[historique GET] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'historique" },
      { status: 500 }
    );
  }
}
