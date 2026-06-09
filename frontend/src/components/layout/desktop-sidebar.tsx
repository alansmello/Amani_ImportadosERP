"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { desktopNavigationItems } from "@/config/navigation";
import { cn } from "@/lib/cn";

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
        <p className="text-sm font-semibold text-text-primary">Amani ERP</p>
        <p className="mt-1 text-xs text-text-secondary">Operacao em preparacao</p>
      </div>

      <nav className="space-y-1 px-3" aria-label="Modulos do ERP">
        {desktopNavigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-amani px-3 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-text-primary"
                  : "text-text-secondary hover:bg-surface-light hover:text-text-primary"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
