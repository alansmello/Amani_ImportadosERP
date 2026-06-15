"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/cn";

type ImplantationResultSummaryProps = {
  status: "success" | "error";
  title: string;
  description: string;
  details?: Array<{
    label: string;
    value: string | number;
  }>;
  className?: string;
};

export function ImplantationResultSummary({
  status,
  title,
  description,
  details = [],
  className
}: ImplantationResultSummaryProps) {
  const isSuccess = status === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertTriangle;

  return (
    <section
      className={cn(
        "rounded-amani border bg-surface-light p-4",
        isSuccess ? "border-success" : "border-danger",
        className
      )}
      role={isSuccess ? "status" : "alert"}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={cn("mt-0.5 h-5 w-5", isSuccess ? "text-success" : "text-danger")}
          aria-hidden
        />
        <div className="min-w-0 space-y-2">
          <div>
            <h3 className="break-words text-sm font-semibold text-text-primary">
              {title}
            </h3>
            <p className="mt-1 break-words text-sm leading-6 text-text-secondary">
              {description}
            </p>
          </div>
          {details.length > 0 ? (
            <dl className="grid gap-2 text-sm tablet:grid-cols-2">
              {details.map((detail) => (
                <div key={detail.label} className="min-w-0">
                  <dt className="text-xs uppercase text-text-secondary">
                    {detail.label}
                  </dt>
                  <dd className="break-words font-medium text-text-primary">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>
    </section>
  );
}

