"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DashboardStats } from "@/types";

const COLORS = [
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#16a34a",
  "#0891b2",
  "#4f46e5",
  "#c026d3",
  "#d97706",
  "#059669",
];

interface DashboardChartsProps {
  stats: DashboardStats;
}

function KPICard({ title, value }: { title: string; value: number | string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{typeof value === "number" ? value.toLocaleString("fr-FR") : value}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardCharts({ stats }: DashboardChartsProps) {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Tableau de bord</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Entreprises en cache" value={stats.total_entreprises_cached} />
        <KPICard title="Listes créées" value={stats.total_listes} />
        <KPICard title="Prospects" value={stats.total_prospects} />
        <KPICard title="Recherches effectuées" value={stats.total_recherches} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector pie chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition par secteur</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.par_secteur.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                Aucune donnée disponible
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={stats.par_secteur}
                    dataKey="count"
                    nameKey="secteur"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {stats.par_secteur.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      Number(value).toLocaleString("fr-FR"),
                      "Entreprises",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top departments bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top départements</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.par_departement.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                Aucune donnée disponible
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={stats.par_departement.slice(0, 10)}
                  margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                >
                  <XAxis dataKey="departement" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [
                      Number(value).toLocaleString("fr-FR"),
                      "Entreprises",
                    ]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stats.par_departement.slice(0, 10).map((_, index) => (
                      <Cell
                        key={`bar-cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent searches */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recherches récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recherches_recentes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Aucune recherche récente
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Requête</TableHead>
                  <TableHead>Résultats</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recherches_recentes.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          r.type === "chat"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {r.type === "chat" ? "Chat" : "Filtre"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {r.requete}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {r.nb_resultats.toLocaleString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
