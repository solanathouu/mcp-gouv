"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, MessageSquare, List, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Recherche", icon: Search },
  { href: "/assistant", label: "Assistant", icon: MessageSquare },
  { href: "/listes", label: "Mes Listes", icon: List },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-lg font-bold">
          <span className="text-primary">Data</span>Gouv Prospection
        </h1>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4 text-xs text-muted-foreground">
        Données : data.gouv.fr
      </div>
    </aside>
  );
}
