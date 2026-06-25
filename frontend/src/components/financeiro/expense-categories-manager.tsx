"use client";

import { AlertCircle, Edit3, LoaderCircle, Save, Tag, X } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useCreateExpenseCategory,
  useExpenseCategories,
  useInactivateExpenseCategory,
  useUpdateExpenseCategory
} from "@/hooks/use-expense-categories";
import { cn } from "@/lib/cn";
import { toApiError } from "@/services/errors";
import type { ExpenseCategory } from "@/types/expense-category";

type CategoryDraft = {
  nome: string;
  descricao: string;
};

type CategoryErrors = {
  nome?: string;
};

const initialDraft: CategoryDraft = {
  nome: "",
  descricao: ""
};

const fieldLabelClassName = "text-sm font-medium text-text-primary";
const fieldErrorClassName = "text-xs font-medium leading-5 text-danger";
const textareaClassName =
  "flex min-h-24 w-full rounded-amani border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger";

function validateDraft(draft: CategoryDraft): CategoryErrors {
  const errors: CategoryErrors = {};

  if (!draft.nome.trim()) {
    errors.nome = "Informe o nome da categoria.";
  }

  return errors;
}

function hasErrors(errors: CategoryErrors) {
  return Object.values(errors).some(Boolean);
}

export function ExpenseCategoriesManager() {
  const categoriesQuery = useExpenseCategories(true);
  const createCategory = useCreateExpenseCategory();
  const updateCategory = useUpdateExpenseCategory();
  const inactivateCategory = useInactivateExpenseCategory();

  const [draft, setDraft] = useState<CategoryDraft>(initialDraft);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(
    null
  );
  const [errors, setErrors] = useState<CategoryErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [inactivationError, setInactivationError] = useState<string | null>(null);

  const categories = categoriesQuery.data ?? [];
  const isSubmitting = createCategory.isPending || updateCategory.isPending;
  const editingId = editingCategory?.id;

  function updateField(field: keyof CategoryDraft, value: string) {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError(null);
  }

  function resetForm() {
    setDraft(initialDraft);
    setEditingCategory(null);
    setErrors({});
    setSubmitError(null);
  }

  function startEdit(category: ExpenseCategory) {
    setEditingCategory(category);
    setDraft({
      nome: category.nome,
      descricao: category.descricao ?? ""
    });
    setErrors({});
    setSubmitError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const validationErrors = validateDraft(draft);
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    setSubmitError(null);

    try {
      const payload = {
        nome: draft.nome.trim(),
        descricao: draft.descricao.trim() || null
      };

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

  async function handleInactivate(category: ExpenseCategory) {
    setInactivationError(null);

    try {
      await inactivateCategory.mutateAsync(category.id);

      if (editingId === category.id) {
        resetForm();
      }
    } catch (error) {
      setInactivationError(toApiError(error).message);
    }
  }

  if (categoriesQuery.isLoading) {
    return (
      <LoadingState
        title="Carregando categorias"
        description="Aguarde enquanto as categorias de despesa sao carregadas."
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

            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="category-name">
                Nome
              </label>
              <Input
                id="category-name"
                value={draft.nome}
                onChange={(event) => updateField("nome", event.target.value)}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.nome)}
                aria-describedby={errors.nome ? "category-name-error" : undefined}
              />
              {errors.nome ? (
                <p id="category-name-error" className={fieldErrorClassName}>
                  {errors.nome}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <label
                className={fieldLabelClassName}
                htmlFor="category-description"
              >
                Descricao
              </label>
              <textarea
                id="category-description"
                className={cn(textareaClassName)}
                value={draft.descricao}
                onChange={(event) =>
                  updateField("descricao", event.target.value)
                }
                disabled={isSubmitting}
              />
            </div>
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
        {inactivationError ? (
          <div className="flex items-start gap-2 rounded-amani border border-danger bg-surface-light px-4 py-3 text-sm leading-6 text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{inactivationError}</span>
          </div>
        ) : null}

        {categories.length === 0 ? (
          <EmptyState
            variant="empty"
            title="Nenhuma categoria cadastrada"
            description="Cadastre a primeira categoria para liberar lancamentos de despesas."
            icon={<Tag className="h-5 w-5" aria-hidden />}
          />
        ) : (
          <div className="grid gap-3">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="flex min-w-0 flex-col gap-4 p-4 tablet:flex-row tablet:items-center tablet:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="break-words text-base font-semibold text-text-primary">
                        {category.nome}
                      </h2>
                      <Badge variant={category.ativa ? "success" : "neutral"}>
                        {category.ativa ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                    {category.descricao ? (
                      <p className="mt-1 break-words text-sm leading-6 text-text-secondary">
                        {category.descricao}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 tablet:flex-row">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => startEdit(category)}
                      disabled={isSubmitting}
                    >
                      <Edit3 className="h-4 w-4" aria-hidden />
                      <span>Editar</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => void handleInactivate(category)}
                      disabled={!category.ativa || inactivateCategory.isPending}
                    >
                      <X className="h-4 w-4" aria-hidden />
                      <span>Inativar</span>
                    </Button>
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
