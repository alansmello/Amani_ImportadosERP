"use client";

import { FormEvent, useState } from "react";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/services/errors";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [loginValue, setLoginValue] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ login: loginValue, senha });
      router.replace(routes.dashboard);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Credenciais nao aceitas.");
      } else {
        setError("Nao foi possivel entrar agora.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Entrar no ERP</CardTitle>
        <CardDescription>Acesso operacional Amani Importados</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary" htmlFor="login">
              Login
            </label>
            <Input
              id="login"
              autoComplete="username"
              value={loginValue}
              onChange={(event) => setLoginValue(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary" htmlFor="senha">
              Senha
            </label>
            <Input
              id="senha"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
            />
          </div>

          {error ? (
            <p className="rounded-amani border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <Button className="w-full" disabled={isSubmitting} type="submit">
            <LogIn aria-hidden="true" className="h-4 w-4" />
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
