import { LoaderCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { cn } from "@/lib/cn";

type LoadingStateProps = {
  title?: string;
  description?: string;
  className?: string;
};

export function LoadingState({
  title = "Carregando informacoes",
  description = "Aguarde enquanto a area prepara os dados solicitados.",
  className
}: LoadingStateProps) {
  return (
    <Card className={cn("min-h-36", className)} role="status" aria-live="polite">
      <CardHeader className="pb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-amani border border-border bg-surface-light text-primary">
          <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden />
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
