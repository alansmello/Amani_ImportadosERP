"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { AuthRouteState } from "@/components/auth/auth-route-state";
import { routes } from "@/config/routes";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/hooks/use-auth";

type RootShellProps = {
  children: ReactNode;
};

export function RootShell({ children }: RootShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (pathname !== routes.login && status === "unauthenticated") {
      router.replace(routes.login);
    }
  }, [pathname, router, status]);

  if (pathname === routes.login) {
    return <>{children}</>;
  }

  if (status === "loading") {
    return <AuthRouteState state="loading" />;
  }

  if (status === "unauthenticated") {
    return <AuthRouteState state="expired" />;
  }

  return <AppShell>{children}</AppShell>;
}
