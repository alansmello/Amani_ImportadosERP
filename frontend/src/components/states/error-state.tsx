"use client";

import { AlertTriangle } from "lucide-react";

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

type ErrorStateProps = {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title = "Nao foi possivel carregar",
  description = "Tente novamente em instantes ou retorne para esta area depois.",
  retryLabel = "Tentar novamente",
  onRetry,
  className
}: ErrorStateProps) {
  return (
    <Card className={cn("min-h-36", className)} role="alert">
      <CardHeader className="pb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-amani border border-danger bg-surface-light text-danger">
          <AlertTriangle className="h-5 w-5" aria-hidden />
        </div>
      </CardHeader>
      <CardContent className="min-w-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-2 break-words">
          {description}
        </CardDescription>
      </CardContent>
      {onRetry ? (
        <CardFooter>
          <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
