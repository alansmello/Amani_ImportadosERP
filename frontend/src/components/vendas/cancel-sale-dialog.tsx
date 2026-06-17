"use client";

import { LoaderCircle, XCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { useCancelSale } from "@/hooks/use-sales";
import { toApiError } from "@/services/errors";

type CancelSaleDialogProps = {
  vendaId: string;
  onCancelled?: () => void;
};

export function CancelSaleDialog({ vendaId, onCancelled }: CancelSaleDialogProps) {
  const cancelSale = useCancelSale();
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSubmitting = cancelSale.isPending;

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setSubmitError(null);
    }
  }

  async function confirmCancel() {
    setSubmitError(null);

    try {
      await cancelSale.mutateAsync(vendaId);
      setOpen(false);
      onCancelled?.();
    } catch (error) {
      const apiError = toApiError(error);
      setSubmitError(apiError.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="secondary">
          <XCircle className="h-4 w-4" aria-hidden />
          <span>Cancelar venda</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cancelar venda</DialogTitle>
          <DialogDescription>
            Esta acao solicita o cancelamento desta venda ao backend. O resultado
            depende das regras oficiais do sistema.
          </DialogDescription>
        </DialogHeader>

        {submitError ? (
          <div className="rounded-amani border border-danger bg-surface-light px-4 py-3 text-sm leading-6 text-danger">
            {submitError}
          </div>
        ) : null}

        <div className="rounded-amani border border-border bg-surface-light p-4">
          <p className="text-sm leading-6 text-text-primary">
            Deseja confirmar o cancelamento desta venda?
          </p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            O estado da venda sera atualizado pelo backend. Esta acao nao pode
            ser desfeita.
          </p>
        </div>

        <DialogFooter>
          {submitError ? (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Fechar
              </Button>
              <Button
                type="button"
                onClick={confirmCancel}
                disabled={isSubmitting}
                className="w-full tablet:w-auto"
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <XCircle className="h-4 w-4" aria-hidden />
                )}
                <span>{isSubmitting ? "Cancelando" : "Tentar novamente"}</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Nao cancelar
              </Button>
              <Button
                type="button"
                onClick={confirmCancel}
                disabled={isSubmitting}
                className="w-full tablet:w-auto"
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <XCircle className="h-4 w-4" aria-hidden />
                )}
                <span>
                  {isSubmitting ? "Cancelando" : "Confirmar cancelamento"}
                </span>
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
