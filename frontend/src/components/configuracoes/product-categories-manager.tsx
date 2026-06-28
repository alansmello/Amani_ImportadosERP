"use client";

import { AlertCircle, Edit3, LoaderCircle, Save, Tag, Trash2, X } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import {
  CategoryFormFields,
  emptyCategoryFormValues,
  type CategoryFormErrors,
  type CategoryFormValues,
  validateCategoryValues
} from "@/components/produtos/category-form-fields";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  useCategories,
  useCreateCategory,
  useRemoveCategory,
  useUpdateCategory
} from "@/hooks/use-categories";
import { toApiError } from "@/services/errors";
import type { Category } from "@/types/category";

function hasErrors(errors: CategoryFormErrors) {
  return Object.values(errors).some(Boolean);
}

export function ProductCategoriesManager() {
  const categoriesQuery = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const removeCategory = useRemoveCategory();

  const [draft, setDraft] = useState<CategoryFormValues>(emptyCategoryFormValues);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [errors, setErrors] = useState<CategoryFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [confirmingRemoveId, setConfirmingRemoveId] = useState<string | null>(null);

  const categories = categoriesQuery.data ?? [];
  const isSubmitting = createCategory.isPending || updateCategory.isPending;
  const editingId = editingCategory?.id;

  function updateField(field: keyof CategoryFormValues, value: string) {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError(null);
  }

  function resetForm() {
    setDraft(emptyCategoryFormValues);
    setEditingCategory(null);
    setErrors({});
    setSubmitError(null);
  }

  function startEdit(category: Category) {
    setEditingCategory(category);
    setDraft({ nome: category.nome });
    setErrors({});
    setSubmitError(null);
    setConfirmingRemoveId(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const validation = validateCategoryValues(draft);
    setErrors(validation.errors);

    if (hasErrors(validation.errors)) return;

    setSubmitError(null);

    try {
      const payload = validation.payload;

      if (editingId) {
        await updateCategory.mutateAsync({ id: editingId, payload });
      } else {
        await createCategory.mutateAsync(payload);
      }

      resetForm();
    } catch (error) {
      setSubmitError(toApiError(error).message);
    }
  }

  async function handleConfirmRemove(id: string) {
    setRemoveError(null);
    setConfirmingRemoveId(null);

    try {
      await removeCategory.mutateAsync(id);

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      setRemoveError(toApiError(error).message);
    }
  }

  if (categoriesQuery.isLoading) {
    return (
      <LoadingState
        title="Carregando categorias"
        description="Aguarde enquanto as categorias de produto sao carregadas."
      />
    );
  }

  if (categoriesQuery.isError) {
    return (
      <ErrorState
        title="Nao foi possivel carregar as categorias"
        description="Verifique a conexao e tente novamente."
        onRetry={() => void categoriesQuery.refetch()}
      />
    );
  }

  return (
    <div className="grid gap-6 desktop:grid-cols-[minmax(0,420px)_1fr]">
      <form onSubmit={handleSubmit} noValidate>
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCategory ? "Editar categoria" : "Nova categoria"}
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-5">
            {submitError ? (
              <div className="flex items-start gap-2 rounded-amani border border-danger bg-surface-light px-4 py-3 text-sm leading-6 text-danger">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{submitError}</span>
              </div>
            ) : null}

            <CategoryFormFields
              values={draft}
              errors={errors}
              disabled={isSubmitting}
              onChange={updateField}
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-3 tablet:flex-row">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Save className="h-4 w-4" aria-hidden />
              )}
              <span>{editingCategory ? "Salvar" : "Criar categoria"}</span>
            </Button>

            {editingCategory ? (
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
                disabled={isSubmitting}
                className="w-full"
              >
                <X className="h-4 w-4" aria-hidden />
                <span>Cancelar</span>
              </Button>
            ) : null}
          </CardFooter>
        </Card>
      </form>

      <section className="grid gap-4">
        {removeError ? (
          <div className="flex items-start gap-2 rounded-amani border border-danger bg-surface-light px-4 py-3 text-sm leading-6 text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{removeError}</span>
          </div>
        ) : null}

        {categories.length === 0 ? (
          <EmptyState
            variant="empty"
            title="Nenhuma categoria cadastrada"
            description="Cadastre a primeira categoria para classifica-la nos produtos."
            icon={<Tag className="h-5 w-5" aria-hidden />}
          />
        ) : (
          <div className="grid gap-3">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="flex min-w-0 flex-col gap-4 p-4 tablet:flex-row tablet:items-center tablet:justify-between">
                  <div className="min-w-0">
                    <h2 className="break-words text-base font-semibold text-text-primary">
                      {category.nome}
                    </h2>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 tablet:flex-row">
                    {confirmingRemoveId === category.id ? (
                      <>
                        <span className="self-center text-sm text-text-secondary">
                          Remover?
                        </span>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => void handleConfirmRemove(category.id)}
                          disabled={removeCategory.isPending}
                        >
                          {removeCategory.isPending ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                          ) : null}
                          <span>Confirmar</span>
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setConfirmingRemoveId(null)}
                          disabled={removeCategory.isPending}
                        >
                          <span>Cancelar</span>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => startEdit(category)}
                          disabled={isSubmitting || removeCategory.isPending}
                        >
                          <Edit3 className="h-4 w-4" aria-hidden />
                          <span>Editar</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setConfirmingRemoveId(category.id)}
                          disabled={isSubmitting || removeCategory.isPending}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                          <span>Remover</span>
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
