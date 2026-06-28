"use client";

import { LoaderCircle, Plus, Save } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import {
  CategoryFormFields,
  emptyCategoryFormValues,
  type CategoryFormErrors,
  type CategoryFormValues,
  validateCategoryValues
} from "@/components/produtos/category-form-fields";
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
import { useCreateCategory } from "@/hooks/use-categories";
import { toApiError } from "@/services/errors";
import type { Category } from "@/types/category";

type CategoryQuickCreateDialogProps = {
  onCreated: (category: Category) => void;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CategoryQuickCreateDialog({
  onCreated,
  disabled = false,
  open: controlledOpen,
  onOpenChange
}: CategoryQuickCreateDialogProps) {
  const createCategory = useCreateCategory();
  const [internalOpen, setInternalOpen] = useState(false);
  const [values, setValues] = useState<CategoryFormValues>(emptyCategoryFormValues);
  const [errors, setErrors] = useState<CategoryFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSubmitting = createCategory.isPending;
  const open = controlledOpen ?? internalOpen;

  function setOpen(nextOpen: boolean) {
    if (controlledOpen === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  function reset() {
    setValues(emptyCategoryFormValues);
    setErrors({});
    setSubmitError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) return;
    setOpen(nextOpen);
    if (!nextOpen) reset();
  }

  function updateField(field: keyof CategoryFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    const validation = validateCategoryValues(values);
    setErrors(validation.errors);

    if (Object.keys(validation.errors).length > 0) return;

    setSubmitError(null);
    try {
      const category = await createCategory.mutateAsync(validation.payload);
      onCreated(category);
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
            <span>Cadastrar categoria</span>
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto">
        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Nova categoria</DialogTitle>
            <DialogDescription>
              Cadastre a categoria sem abandonar os dados do produto.
            </DialogDescription>
          </DialogHeader>

          {submitError ? (
            <div className="rounded-amani border border-danger bg-surface-light px-4 py-3 text-sm leading-6 text-danger">
              {submitError}
            </div>
          ) : null}

          <CategoryFormFields
            values={values}
            errors={errors}
            disabled={isSubmitting}
            idPrefix="quick-product-category"
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
              <span>{isSubmitting ? "Salvando" : "Salvar categoria"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
