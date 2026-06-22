"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  formatReceivableCurrency
} from "@/components/financeiro/receivable-formatters";
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
import { useDeleteReceivable } from "@/hooks/use-receivables";
import { toApiError } from "@/services/errors";

type DeleteReceivableDialogProps = {
  receivableId: string;
  clienteName: string;
  valorTotal: number;
  onDeleted?: () => void;
};

export function DeleteReceivableDialog({
  receivableId,
  clienteName,
  valorTotal,
  onDeleted
}: DeleteReceivableDialogProps) {
  const deleteReceivable = useDeleteReceivable();
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSubmitting = deleteReceivable.isPending;

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setSubmitError(null);
    }
  }

  async function confirmDelete() {
    setSubmitError(null);

    try {
      await deleteReceivable.mutateAsync(receivableId);
      setOpen(false);
      onDeleted?.();
    } catch (error) {
      const apiError = toApiError(error);
      setSubmitError(apiError.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="secondary" size="sm">
          <Trash2 className="h-4 w-4" aria-hidden />
          <span className="sr-only tablet:not-sr-only">Excluir</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Excluir conta a receber</DialogTitle>
          <DialogDescription>
            Esta acao solicita a exclusao desta conta ao backend. O registro
            so sera removido apos confirmacao oficial.
          </DialogDescription>
        </DialogHeader>

        {submitError ? (
          <div className="rounded-amani border border-danger bg-surface-light px-4 py-3 text-sm leading-6 text-danger">
            {submitError}
          </div>
        ) : null}

        <div className="rounded-amani border border-border bg-surface-light p-4">
          <p className="break-words text-sm font-semibold text-text-primary">
            {clienteName}
          </p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            Valor total: {formatReceivableCurrency(valorTotal)}
          </p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            Esta ação não pode ser desfeita.
          </p>
        </div>

        <DialogFooter className="gap-2 tablet:gap-0">
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
                onClick={confirmDelete}
                disabled={isSubmitting}
                className="w-full tablet:w-auto"
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden />
                )}
                <span>
                  {isSubmitting ? "Excluindo" : "Tentar novamente"}
                </span>
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
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={confirmDelete}
                disabled={isSubmitting}
                className="w-full tablet:w-auto"
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden />
                )}
                <span>{isSubmitting ? "Excluindo" : "Confirmar exclusão"}</span>
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
