import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

import type { AppRoute } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type QuickAction = {
  title: string;
  description: string;
  href: AppRoute;
  icon: LucideIcon;
};

type QuickActionGridProps = {
  actions: readonly QuickAction[];
  className?: string;
};

export function QuickActionGrid({ actions, className }: QuickActionGridProps) {
  return (
    <section className={cn("space-y-3", className)} aria-labelledby="quick-actions">
      <div className="space-y-1">
        <h2 id="quick-actions" className="text-base font-semibold text-text-primary">
          Atalhos estruturais
        </h2>
        <p className="text-sm leading-6 text-text-secondary">
          Acessos para areas placeholder. Nenhum atalho executa operacao real.
        </p>
      </div>

      <div className="grid gap-3 tablet:grid-cols-2 desktop:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Button
              key={action.href}
              asChild
              variant="secondary"
              className="h-auto min-h-20 justify-between gap-4 p-4 text-left"
            >
              <Link href={action.href}>
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-amani border border-border bg-surface text-primary">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-text-primary">
                      {action.title}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-text-secondary">
                      {action.description}
                    </span>
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-text-secondary" aria-hidden />
              </Link>
            </Button>
          );
        })}
      </div>
    </section>
  );
}
