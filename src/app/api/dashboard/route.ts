import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { entreprises, listes, listesEntreprises, historiqueRecherches } from "@/db/schema";
import { sql, desc } from "drizzle-orm";
import type { DashboardStats } from "@/types";

export async function GET() {
  try {
    // Count entreprises
    const totalEntreprisesRow = db
      .select({ count: sql<number>`COUNT(*)` })
      .from(entreprises)
      .get();

    // Count listes
    const totalListesRow = db
      .select({ count: sql<number>`COUNT(*)` })
      .from(listes)
      .get();

    // Count listes_entreprises (prospects)
    const totalProspectsRow = db
      .select({ count: sql<number>`COUNT(*)` })
      .from(listesEntreprises)
      .get();

    // Count historique_recherches
    const totalRecherchesRow = db
      .select({ count: sql<number>`COUNT(*)` })
      .from(historiqueRecherches)
      .get();

    // Top 10 sectors (by code_naf)
    const parSecteur = db
      .select({
        secteur: entreprises.code_naf,
        count: sql<number>`COUNT(*) as count`,
      })
      .from(entreprises)
      .groupBy(entreprises.code_naf)
      .orderBy(desc(sql`count`))
      .limit(10)
      .all()
      .map((row) => ({
        secteur: row.secteur ?? "Non renseigné",
        count: row.count,
      }));

    // Top 10 departments
    const parDepartement = db
      .select({
        departement: entreprises.departement,
        count: sql<number>`COUNT(*) as count`,
      })
      .from(entreprises)
      .groupBy(entreprises.departement)
      .orderBy(desc(sql`count`))
      .limit(10)
      .all()
      .map((row) => ({
        departement: row.departement ?? "Non renseigné",
        count: row.count,
      }));

    // Last 10 recherches
    const recherchesRecentes = db
      .select()
      .from(historiqueRecherches)
      .orderBy(desc(historiqueRecherches.created_at))
      .limit(10)
      .all();

    const stats: DashboardStats = {
      total_entreprises_cached: totalEntreprisesRow?.count ?? 0,
      total_listes: totalListesRow?.count ?? 0,
      total_prospects: totalProspectsRow?.count ?? 0,
      total_recherches: totalRecherchesRow?.count ?? 0,
      par_secteur: parSecteur,
      par_departement: parDepartement,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recherches_recentes: recherchesRecentes as any,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[dashboard GET] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du tableau de bord" },
      { status: 500 }
    );
  }
}
