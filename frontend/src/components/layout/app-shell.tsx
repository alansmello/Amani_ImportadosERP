import type { ReactNode } from "react";

import { PageContainer } from "@/components/layout/page-container";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="flex min-h-screen w-full">
        <aside
          aria-label="Navegacao desktop em preparacao"
          className="hidden min-h-screen w-64 shrink-0 border-r border-border bg-surface desktop:block"
        >
          <div className="px-5 py-6">
            <p className="text-sm font-semibold text-text-primary">Amani ERP</p>
            <p className="mt-1 text-xs text-text-secondary">
              Navegacao em preparacao
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <PageContainer className="pb-24 desktop:pb-8">{children}</PageContainer>
        </div>
      </div>

      <nav
        aria-label="Navegacao mobile em preparacao"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface px-4 py-3 desktop:hidden"
      >
        <div className="mx-auto h-12 max-w-md rounded-amani border border-border bg-surface-light" />
      </nav>
    </div>
  );
}
