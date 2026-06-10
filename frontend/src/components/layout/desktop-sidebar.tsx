"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { desktopNavigationItems } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Navegacao principal"
      className="hidden min-h-screen w-64 shrink-0 border-r border-border bg-surface desktop:block"
    >
      <div className="px-5 py-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-text-primary">Amani ERP</p>
          <Badge variant="accent">Base</Badge>
        </div>
        <p className="mt-1 text-xs text-text-secondary">Operacao em preparacao</p>
      </div>

      <nav className="space-y-1 px-3" aria-label="Modulos do ERP">
        {desktopNavigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActiveRoute(pathname, item.href);

          return (
            <Button
              key={item.id}
              asChild
              variant={active ? "primary" : "ghost"}
              aria-current={active ? "page" : undefined}
              className={cn(
                "w-full justify-start px-3",
                active ? "shadow-sm" : undefined
              )}
            >
              <Link href={item.href}>
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
