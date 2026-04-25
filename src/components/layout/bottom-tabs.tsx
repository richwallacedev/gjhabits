"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Download,
  History,
  PiggyBank,
  Sparkles,
  Trophy
} from "lucide-react";

import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/gastos", label: "Gastos", icon: PiggyBank },
  { href: "/habitos", label: "Habitos", icon: Sparkles },
  { href: "/apuestas", label: "Apuestas", icon: Trophy },
  { href: "/historial", label: "Historial", icon: History },
  { href: "/exportar", label: "Exportar", icon: Download }
];

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-white/95 backdrop-blur-sm">
      <ul className="mx-auto grid max-w-2xl grid-cols-6 px-1 pb-[calc(env(safe-area-inset-bottom)+0.4rem)] pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
