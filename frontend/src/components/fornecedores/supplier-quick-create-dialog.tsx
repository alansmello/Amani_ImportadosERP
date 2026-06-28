"use client";

import { LoaderCircle, Plus, Save } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import {
  SupplierFormFields,
  type SupplierFormErrors,
  type SupplierFormValues
} from "@/components/fornecedores/supplier-form-fields";
import { validateSupplierValues } from "@/components/fornecedores/supplier-form";
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
import { useCreateSupplier } from "@/hooks/use-suppliers";
import { toApiError } from "@/services/errors";
import type { Supplier } from "@/types/supplier";

type SupplierQuickCreateDialogProps = {
  onCreated: (supplier: Supplier) => void;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const initialValues: SupplierFormValues = { nome: "", telefone: "" };

export function SupplierQuickCreateDialog({
  onCreated,
  disabled = false,
  open: controlledOpen,
  onOpenChange
}: SupplierQuickCreateDialogProps) {
  const createSupplier = useCreateSupplier();
  const [internalOpen, setInternalOpen] = useState(false);
  const [values, setValues] = useState<SupplierFormValues>(initialValues);
  const [errors, setErrors] = useState<SupplierFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSubmitting = createSupplier.isPending;
  const open = controlledOpen ?? internalOpen;

  function setOpen(nextOpen: boolean) {
    if (controlledOpen === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  function reset() {
    setValues(initialValues);
    setErrors({});
    setSubmitError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) return;
    setOpen(nextOpen);
    if (!nextOpen) reset();
  }

  function updateField(field: keyof SupplierFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    const validation = validateSupplierValues(values);
    setErrors(validation.errors);

    if (Object.keys(validation.errors).length > 0) return;

    setSubmitError(null);
    try {
      const supplier = await createSupplier.mutateAsync(validation.payload);
      onCreated(supplier);
      reset();
      setOpen(false);
    } catch (error) {
      setSubmitError(toApiError(error).message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {controlledOpen === undefined ? (
        <DialogTrigger asChild>
          <Button type="button" variant="secondary" size="sm" disabled={disabled}>
            <Plus className="h-4 w-4" aria-hidden />
            <span>Cadastrar fornecedor</span>
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto">
        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Novo fornecedor</DialogTitle>
            <DialogDescription>
              Cadastre a referencia sem abandonar os dados ja preenchidos.
            </DialogDescription>
          </DialogHeader>

          {submitError ? (
            <div className="rounded-amani border border-danger bg-surface-light px-4 py-3 text-sm leading-6 text-danger">
              {submitError}
            </div>
          ) : null}

          <SupplierFormFields
            values={values}
            errors={errors}
            disabled={isSubmitting}
            onChange={updateField}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Save className="h-4 w-4" aria-hidden />
              )}
              <span>{isSubmitting ? "Salvando" : "Salvar fornecedor"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
