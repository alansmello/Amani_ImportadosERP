"use client";

import { AlertCircle, Database, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { IncompleteDataNotice } from "@/types/dashboard";

type DashboardSectionStateProps = {
  state: "loading" | "empty" | "error" | "incomplete";
  title: string;
  description: string;
  notices?: IncompleteDataNotice[];
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
};

const stateIconClassName = {
  loading: "border-border text-primary",
  empty: "border-border text-info",
  error: "border-danger text-danger",
  incomplete: "border-warning text-warning"
} as const;

const stateLiveMode = {
  loading: "polite",
  empty: "polite",
  error: "assertive",
  incomplete: "polite"
} as const;

export function DashboardSectionState({
  state,
  title,
  description,
  notices = [],
  actionLabel = "Tentar novamente",
  onAction,
  icon,
  className
}: DashboardSectionStateProps) {
  const fallbackIcon =
    state === "loading" ? (
      <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden />
    ) : state === "empty" ? (
      <Database className="h-5 w-5" aria-hidden />
    ) : (
      <AlertCircle className="h-5 w-5" aria-hidden />
    );

  return (
    <Card
      className={cn("min-h-36", className)}
      role={state === "error" ? "alert" : "status"}
      aria-live={stateLiveMode[state]}
      aria-busy={state === "loading" ? true : undefined}
    >
      <CardHeader className="pb-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-amani border bg-surface-light",
            stateIconClassName[state]
          )}
        >
          {icon ?? fallbackIcon}
        </div>
      </CardHeader>
      <CardContent className="min-w-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-2 break-words">
          {description}
        </CardDescription>

        {state === "loading" ? (
          <span className="sr-only">Carregando conteudo do dashboard.</span>
        ) : null}

        {notices.length > 0 ? (
          <ul
            className="mt-4 space-y-2 text-sm text-text-secondary"
            aria-label="Avisos de dados incompletos"
          >
            {notices.map((notice) => (
              <li
                key={`${notice.codigo}-${notice.entidadeId ?? notice.impacto}`}
                className="rounded-amani border border-warning/40 bg-warning/10 px-3 py-2"
              >
                <span className="font-medium text-text-primary">
                  {notice.impacto}
                </span>
                : {notice.mensagem}
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
      {onAction ? (
        <CardFooter>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onAction}
            aria-label={`${actionLabel}: ${title}`}
          >
            {actionLabel}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
