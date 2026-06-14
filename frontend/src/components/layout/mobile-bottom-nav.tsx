"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mobileNavigationItems, moreNavigationItems } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

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
      <div className="mx-auto grid w-full max-w-md grid-cols-[repeat(5,minmax(0,1fr))] gap-1">
        {mobileNavigationItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.id === "mais"
              ? isMoreActive(pathname)
              : isActiveRoute(pathname, item.href);

          if (item.id === "mais") {
            return (
              <Dialog key={item.id}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant={active ? "primary" : "ghost"}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "h-14 min-w-0 w-full flex-col gap-1 overflow-hidden px-1 text-[11px] leading-none",
                      active ? "shadow-sm" : undefined
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden />
                    <span className="max-w-full truncate">{item.label}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Mais modulos</DialogTitle>
                    <DialogDescription>
                      Acesse os cadastros e areas operacionais secundarias.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-2">
                    {moreNavigationItems.map((moreItem) => {
                      const MoreIcon = moreItem.icon;
                      const moreActive = isActiveRoute(pathname, moreItem.href);

                      return (
                        <DialogClose key={moreItem.id} asChild>
                          <Link
                            href={moreItem.href}
                            aria-current={moreActive ? "page" : undefined}
                            className={cn(
                              buttonVariants({
                                variant: moreActive ? "primary" : "ghost"
                              }),
                              "w-full justify-start px-3"
                            )}
                          >
                            <MoreIcon className="h-4 w-4 shrink-0" aria-hidden />
                            <span className="truncate">{moreItem.label}</span>
                          </Link>
                        </DialogClose>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            );
          }

          return (
            <Button
              key={item.id}
              asChild
              variant={active ? "primary" : "ghost"}
              aria-current={active ? "page" : undefined}
              className={cn(
                "h-14 min-w-0 w-full flex-col gap-1 overflow-hidden px-1 text-[11px] leading-none",
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
