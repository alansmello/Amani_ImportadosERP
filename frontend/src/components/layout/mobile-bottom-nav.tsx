"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mobileNavigationItems, moreNavigationItems } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function isMoreActive(pathname: string) {
  return moreNavigationItems.some((item) => isActiveRoute(pathname, item.href));
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegacao mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface px-2 py-2 desktop:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {mobileNavigationItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.id === "mais"
              ? isMoreActive(pathname)
              : isActiveRoute(pathname, item.href);

          return (
            <Button
              key={item.id}
              asChild
              variant={active ? "primary" : "ghost"}
              aria-current={active ? "page" : undefined}
              className={cn(
                "h-14 min-w-0 flex-col gap-1 px-1 text-[11px] leading-none",
                active ? "shadow-sm" : undefined
              )}
            >
              <Link href={item.href}>
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
