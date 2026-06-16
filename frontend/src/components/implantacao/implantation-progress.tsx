"use client";

import {
  AlertCircle,
  CheckCircle2,
  Circle,
  LoaderCircle,
  Pencil
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { ImplantationStepState } from "@/types/implantation";

type ImplantationProgressProps = {
  steps: Array<
    ImplantationStepState & {
      title: string;
      description: string;
    }
  >;
  className?: string;
};

const statusConfig = {
  pending: {
    label: "Pendente",
    icon: Circle,
    className: "border-border text-text-secondary"
  },
  editing: {
    label: "Em edicao",
    icon: Pencil,
    className: "border-primary text-primary"
  },
  reviewing: {
    label: "Em revisao",
    icon: Pencil,
    className: "border-primary text-primary"
  },
  submitting: {
    label: "Enviando",
    icon: LoaderCircle,
    className: "border-primary text-primary"
  },
  completed: {
    label: "Concluida",
    icon: CheckCircle2,
    className: "border-success text-success"
  },
  error: {
    label: "Com erro",
    icon: AlertCircle,
    className: "border-danger text-danger"
  }
} as const;

export function ImplantationProgress({
  steps,
  className
}: ImplantationProgressProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <ol className="grid gap-3 tablet:grid-cols-3">
          {steps.map((step) => {
            const config = statusConfig[step.status];
            const Icon = config.icon;

            return (
              <li
                key={step.id}
                className="min-w-0 rounded-amani border border-border bg-surface-light p-3"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-amani border bg-surface",
                      config.className
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        step.status === "submitting" ? "animate-spin" : undefined
                      )}
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="break-words text-sm font-medium text-text-primary">
                      {step.title}
                    </p>
                    <p className="break-words text-xs leading-5 text-text-secondary">
                      {step.description}
                    </p>
                    <p className="text-xs font-medium text-text-secondary">
                      {config.label}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

