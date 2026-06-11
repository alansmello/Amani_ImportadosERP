"use client";

import { LoaderCircle, UserX } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { toApiError } from "@/services/errors";

type CustomerInactivateDialogProps = {
  customerName: string;
  isSubmitting?: boolean;
  onConfirm: () => Promise<void>;
};

export function CustomerInactivateDialog({
  customerName,
  isSubmitting = false,
  onConfirm
}: CustomerInactivateDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitError(null);

    try {
      await onConfirm();
      setOpen(false);
    } catch (error) {
      const apiError = toApiError(error);
      setSubmitError(apiError.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="destructive" size="sm">
          <UserX className="h-4 w-4" aria-hidden />
          <span>Inativar</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inativar cliente</DialogTitle>
          <DialogDescription>
            Confirme a inativacao de {customerName}. O cliente deixara a visao
            padrao de ativos, mas continuara disponivel em inativos e todos.
          </DialogDescription>
        </DialogHeader>

        {submitError ? (
          <div className="rounded-amani border border-danger bg-surface-light px-4 py-3 text-sm leading-6 text-danger">
            {submitError}
          </div>
        ) : null}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isSubmitting}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={isSubmitting}
            onClick={handleConfirm}
          >
            {isSubmitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <UserX className="h-4 w-4" aria-hidden />
            )}
            <span>{isSubmitting ? "Inativando" : "Confirmar inativacao"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
