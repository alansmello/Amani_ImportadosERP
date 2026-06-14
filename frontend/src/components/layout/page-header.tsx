import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  className
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex min-w-0 flex-col gap-4 border-b border-border pb-5 tablet:flex-row tablet:items-end tablet:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-normal text-text-secondary">
          Amani ERP
        </p>
        <h1 className="mt-2 text-2xl font-semibold leading-tight text-text-primary tablet:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? <div className="min-w-0 shrink-0">{actions}</div> : null}
    </header>
  );
}
