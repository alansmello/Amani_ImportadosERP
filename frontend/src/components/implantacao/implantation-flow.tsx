"use client";

import { ClipboardList } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { InitialCashStep } from "@/components/implantacao/initial-cash-step";
import { InitialInventoryStep } from "@/components/implantacao/initial-inventory-step";
import { InitialReceivablesStep } from "@/components/implantacao/initial-receivables-step";
import { ImplantationProgress } from "@/components/implantacao/implantation-progress";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { useProducts } from "@/hooks/use-products";
import type {
  ImplantationStepId,
  ImplantationStepState,
  ImplantationStepStatus
} from "@/types/implantation";

type FlowStep = ImplantationStepState & {
  title: string;
  description: string;
};

const stepMeta: Record<
  ImplantationStepId,
  {
    title: string;
    description: string;
  }
> = {
  initialInventory: {
    title: "Inventario inicial",
    description: "Entrada rastreavel do estoque de partida."
  },
  initialCash: {
    title: "Saldo inicial de caixa",
    description: "Evento financeiro de partida."
  },
  initialReceivables: {
    title: "Contas a receber iniciais",
    description: "Recebiveis anteriores ao uso do ERP."
  }
};

const initialStepStates: Record<ImplantationStepId, ImplantationStepState> = {
  initialInventory: {
    id: "initialInventory",
    status: "editing"
  },
  initialCash: {
    id: "initialCash",
    status: "editing"
  },
  initialReceivables: {
    id: "initialReceivables",
    status: "editing"
  }
};

function buildStepState(
  step: ImplantationStepState,
  statusOverride?: ImplantationStepStatus
): FlowStep {
  return {
    ...step,
    status: statusOverride ?? step.status,
    ...stepMeta[step.id]
  };
}

export function ImplantationFlow() {
  const productsQuery = useProducts();
  const products = productsQuery.data ?? [];
  const [steps, setSteps] = useState(initialStepStates);

  const updateStepStatus = useCallback((
    id: ImplantationStepId,
    status: ImplantationStepStatus,
    errorMessage?: string
  ) => {
    setSteps((currentSteps) => {
      const currentStep = currentSteps[id];

      if (currentStep.status === "completed" && status !== "completed") {
        return currentSteps;
      }

      if (
        currentStep.status === status &&
        currentStep.errorMessage === errorMessage
      ) {
        return currentSteps;
      }

      return {
        ...currentSteps,
        [id]: {
          ...currentStep,
          status,
          completedAt:
            status === "completed"
              ? currentStep.completedAt ?? new Date().toISOString()
              : currentStep.completedAt,
          errorMessage: status === "error" ? errorMessage : undefined
        }
      };
    });
  }, []);

  const updateInventoryStatus = useCallback(
    (status: ImplantationStepStatus, errorMessage?: string) => {
      updateStepStatus("initialInventory", status, errorMessage);
    },
    [updateStepStatus]
  );

  const updateCashStatus = useCallback(
    (status: ImplantationStepStatus, errorMessage?: string) => {
      updateStepStatus("initialCash", status, errorMessage);
    },
    [updateStepStatus]
  );

  const updateReceivablesStatus = useCallback(
    (status: ImplantationStepStatus, errorMessage?: string) => {
      updateStepStatus("initialReceivables", status, errorMessage);
    },
    [updateStepStatus]
  );

  const progressSteps = useMemo(() => {
    const inventoryStatus = productsQuery.isLoading
      ? "pending"
      : productsQuery.isError
        ? "error"
        : undefined;

    return [
      buildStepState(steps.initialInventory, inventoryStatus),
      buildStepState(steps.initialCash),
      buildStepState(steps.initialReceivables)
    ];
  }, [productsQuery.isError, productsQuery.isLoading, steps]);

  return (
    <section className="space-y-6">
      <ImplantationProgress steps={progressSteps} />

      {productsQuery.isLoading ? (
        <LoadingState
          title="Carregando produtos"
          description="Aguarde enquanto a lista oficial de produtos e carregada para o inventario inicial."
        />
      ) : null}

      {!productsQuery.isLoading && productsQuery.isError ? (
        <ErrorState
          title="Nao foi possivel carregar produtos"
          description="Verifique a API de produtos e tente novamente antes de registrar o inventario inicial."
          onRetry={() => {
            void productsQuery.refetch();
          }}
        />
      ) : null}

      {!productsQuery.isLoading && !productsQuery.isError ? (
        products.length === 0 ? (
          <EmptyState
            title="Nenhum produto disponivel"
            description="Cadastre produtos antes de registrar o inventario inicial."
            badgeLabel="Sem produtos"
            variant="empty"
            icon={<ClipboardList className="h-5 w-5" aria-hidden />}
          />
        ) : (
          <InitialInventoryStep
            products={products}
            onStatusChange={updateInventoryStatus}
          />
        )
      ) : null}

      <InitialCashStep onStatusChange={updateCashStatus} />

      <InitialReceivablesStep onStatusChange={updateReceivablesStatus} />
    </section>
  );
}
