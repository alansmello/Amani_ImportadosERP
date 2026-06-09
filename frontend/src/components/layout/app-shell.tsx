import type { ReactNode } from "react";

import { DesktopSidebar } from "@/components/layout/desktop-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { PageContainer } from "@/components/layout/page-container";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="flex min-h-screen w-full">
        <DesktopSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <PageContainer className="pb-24 desktop:pb-8">{children}</PageContainer>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
