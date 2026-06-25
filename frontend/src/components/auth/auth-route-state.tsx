import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

type AuthRouteStateProps = {
  state: "loading" | "expired";
};

export function AuthRouteState({ state }: AuthRouteStateProps) {
  if (state === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-text-secondary">
        <p className="text-sm">Validando sessao...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-text-primary">
      <div className="w-full max-w-sm rounded-amani border border-border bg-surface p-5 text-center">
        <h1 className="text-base font-semibold">Sessao expirada</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Entre novamente para continuar usando o ERP.
        </p>
        <Button asChild className="mt-4 w-full">
          <Link href={routes.login}>Entrar</Link>
        </Button>
      </div>
    </main>
  );
}
