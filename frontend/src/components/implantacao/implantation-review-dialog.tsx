"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

type ImplantationReviewDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isSubmitting?: boolean;
  children: ReactNode;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function ImplantationReviewDialog({
  open,
  title,
  description,
  confirmLabel,
  isSubmitting = false,
  children,
  onOpenChange,
  onConfirm
}: ImplantationReviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">{children}</div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Voltar para editar
          </Button>
          <Button type="button" disabled={isSubmitting} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

