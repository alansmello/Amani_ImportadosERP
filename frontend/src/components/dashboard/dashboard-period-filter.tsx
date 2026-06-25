"use client";

import { CalendarDays, Check, RotateCcw } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { isValidDashboardPeriod } from "@/services/dashboard";
import type {
  DashboardPeriodFilter,
  DashboardPeriodMode
} from "@/types/dashboard";

type DashboardPeriodFilterProps = {
  value: DashboardPeriodFilter;
  onApply: (period: DashboardPeriodFilter) => void;
  className?: string;
};

const monthOptions = [
  ["1", "Jan"],
  ["2", "Fev"],
  ["3", "Mar"],
  ["4", "Abr"],
  ["5", "Mai"],
  ["6", "Jun"],
  ["7", "Jul"],
  ["8", "Ago"],
  ["9", "Set"],
  ["10", "Out"],
  ["11", "Nov"],
  ["12", "Dez"]
] as const;

function getDraftFromPeriod(period: DashboardPeriodFilter) {
  if (period.mode === "month") {
    return {
      mode: period.mode,
      month: String(period.month),
      year: String(period.year),
      startDate: "",
      endDate: ""
    };
  }

  if (period.mode === "year") {
    return {
      mode: period.mode,
      month: String(new Date().getMonth() + 1),
      year: String(period.year),
      startDate: "",
      endDate: ""
    };
  }

  return {
    mode: period.mode,
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    startDate: period.startDate,
    endDate: period.endDate
  };
}

function buildPeriodFromDraft(
  draft: ReturnType<typeof getDraftFromPeriod>
): DashboardPeriodFilter {
  if (draft.mode === "month") {
    return {
      mode: "month",
      month: Number(draft.month),
      year: Number(draft.year)
    };
  }

  if (draft.mode === "year") {
    return {
      mode: "year",
      year: Number(draft.year)
    };
  }

  return {
    mode: "range",
    startDate: draft.startDate,
    endDate: draft.endDate
  };
}

export function DashboardPeriodFilter({
  value,
  onApply,
  className
}: DashboardPeriodFilterProps) {
  const [draft, setDraft] = useState(() => getDraftFromPeriod(value));
  const [touched, setTouched] = useState(false);

  const draftPeriod = useMemo(() => buildPeriodFromDraft(draft), [draft]);
  const isValid = isValidDashboardPeriod(draftPeriod);
  const errorMessage =
    draft.mode === "range"
      ? "Informe um intervalo com data inicial menor ou igual a data final."
      : "Informe mes e ano validos para aplicar o filtro.";

  function updateMode(mode: DashboardPeriodMode) {
    setTouched(false);
    setDraft((current) => ({
      ...current,
      mode
    }));
  }

  function applyFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);

    if (!isValid) {
      return;
    }

    onApply(draftPeriod);
  }

  function resetDraft() {
    setTouched(false);
    setDraft(getDraftFromPeriod(value));
  }

  return (
    <form
      className={cn(
        "rounded-amani border border-border bg-surface p-4",
        className
      )}
      onSubmit={applyFilter}
    >
      <div className="flex flex-col gap-4 desktop:flex-row desktop:items-end desktop:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <CalendarDays className="h-4 w-4 text-primary" aria-hidden />
            Periodo do painel
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Modo">
            {[
              ["month", "Mes"],
              ["year", "Ano"],
              ["range", "Intervalo"]
            ].map(([mode, label]) => (
              <Button
                key={mode}
                type="button"
                size="sm"
                variant={draft.mode === mode ? "primary" : "secondary"}
                onClick={() => updateMode(mode as DashboardPeriodMode)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid min-w-0 flex-1 gap-3 tablet:grid-cols-3 desktop:max-w-2xl">
          {draft.mode === "month" ? (
            <>
              <label className="space-y-1 text-sm text-text-secondary">
                Mes
                <select
                  className="flex h-11 w-full rounded-amani border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  value={draft.month}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      month: event.target.value
                    }))
                  }
                >
                  {monthOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-sm text-text-secondary">
                Ano
                <Input
                  type="number"
                  min="2000"
                  value={draft.year}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      year: event.target.value
                    }))
                  }
                />
              </label>
            </>
          ) : null}

          {draft.mode === "year" ? (
            <label className="space-y-1 text-sm text-text-secondary">
              Ano
              <Input
                type="number"
                min="2000"
                value={draft.year}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    year: event.target.value
                  }))
                }
              />
            </label>
          ) : null}

          {draft.mode === "range" ? (
            <>
              <label className="space-y-1 text-sm text-text-secondary">
                Inicio
                <Input
                  type="date"
                  value={draft.startDate}
                  aria-invalid={touched && !isValid}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      startDate: event.target.value
                    }))
                  }
                />
              </label>
              <label className="space-y-1 text-sm text-text-secondary">
                Fim
                <Input
                  type="date"
                  value={draft.endDate}
                  aria-invalid={touched && !isValid}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      endDate: event.target.value
                    }))
                  }
                />
              </label>
            </>
          ) : null}

          <div className="flex items-end gap-2">
            <Button type="submit" size="sm">
              <Check className="h-4 w-4" aria-hidden />
              Aplicar
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label="Restaurar filtro aplicado"
              onClick={resetDraft}
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      </div>

      {touched && !isValid ? (
        <p className="mt-3 text-sm text-danger">{errorMessage}</p>
      ) : null}
    </form>
  );
}
