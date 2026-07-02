"use client";

import { LoaderCircle, PackagePlus, Save } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { PurchaseItemComposer } from "@/components/compras/purchase-item-composer";
import { PurchaseSummary } from "@/components/compras/purchase-summary";
import {
  buildCreatePurchasePayload,
  createEmptyPurchaseDraft,
  createPurchaseDraftItem,
  getPurchaseValidationMessage,
  hasPurchaseItemContent,
  validatePurchaseDraft,
  validatePurchaseItemDraft
} from "@/components/compras/purchase-validation";
import { SupplierQuickCreateDialog } from "@/components/fornecedores/supplier-quick-create-dialog";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/hooks/use-products";
import { useCreatePurchase } from "@/hooks/use-purchases";
import { useSuppliers } from "@/hooks/use-suppliers";
import { cn } from "@/lib/cn";
import { compraDetalhe } from "@/config/routes";
import { toApiError } from "@/services/errors";
import type {
  CreatePurchasePayload,
  PurchaseDraft,
  PurchaseItemDraft,
  PurchaseValidationError
} from "@/types/purchase";
import type { Product } from "@/types/product";
import type { Supplier } from "@/types/supplier";

type PurchaseFormProps = {
  onCreated?: (href: string, id: string) => void;
};

const EMPTY_PRODUCTS: Product[] = [];
const EMPTY_SUPPLIERS: Supplier[] = [];
const fieldLabelClassName = "text-sm font-medium text-text-primary";
const fieldHelpClassName = "text-xs leading-5 text-text-secondary";
const fieldErrorClassName = "text-xs font-medium leading-5 text-danger";
const selectClassName =
  "flex h-11 w-full rounded-amani border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger";

function buildInitialDraft(): PurchaseDraft {
  return {
    ...createEmptyPurchaseDraft(),
    dataCompra: new Date().toISOString().slice(0, 10)
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className={fieldErrorClassName}>{message}</p>;
}

export function PurchaseForm({ onCreated }: PurchaseFormProps) {
  const suppliersQuery = useSuppliers();
  const productsQuery = useProducts();
  const createPurchase = useCreatePurchase();
  const [draft, setDraft] = useState<PurchaseDraft>(() => buildInitialDraft());
  const [composerItem, setComposerItem] = useState<PurchaseItemDraft>(() =>
    createPurchaseDraftItem()
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [errors, setErrors] = useState<PurchaseValidationError[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const suppliers = suppliersQuery.data ?? EMPTY_SUPPLIERS;
  const products = productsQuery.data ?? EMPTY_PRODUCTS;
  const isLoadingSupportLists = suppliersQuery.isLoading || productsQuery.isLoading;
  const hasSupportListError = suppliersQuery.isError || productsQuery.isError;
  const hasNoProducts =
    !isLoadingSupportLists &&
    !hasSupportListError &&
    products.length === 0;

  const isSubmitting = createPurchase.isPending;
  const supplierError = getPurchaseValidationMessage(errors, "fornecedorId");
  const dateError = getPurchaseValidationMessage(errors, "dataCompra");
  const itemsError = getPurchaseValidationMessage(errors, "items");
  const discountError = getPurchaseValidationMessage(errors, "desconto");
  const increaseError = getPurchaseValidationMessage(errors, "acrescimo");

  const referenceProducts = useMemo(
    () => products.map((product) => ({ id: product.id })),
    [products]
  );
  const referenceSuppliers = useMemo(
    () => suppliers.map((supplier) => ({ id: supplier.id })),
    [suppliers]
  );
  const composerHasContent = hasPurchaseItemContent(composerItem);
  const hasEditingActive = Boolean(editingItemId);
  const canSubmit = useMemo(() => {
    return (
      validatePurchaseDraft(draft, referenceProducts, referenceSuppliers).length ===
        0 &&
      !composerHasContent &&
      !hasEditingActive
    );
  }, [
    composerHasContent,
    draft,
    hasEditingActive,
    referenceProducts,
    referenceSuppliers
  ]);

  const composerSubmitMessage = hasEditingActive
    ? "Atualize o item em edicao ou cancele antes de registrar a compra."
    : composerHasContent
      ? "Inclua o item preenchido no carrinho ou limpe a composicao antes de registrar."
      : null;

  function retrySupportLists() {
    void suppliersQuery.refetch();
    void productsQuery.refetch();
  }

  function updateDraftField(
    field: keyof Omit<PurchaseDraft, "items">,
    value: string
  ) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value
    }));
    setErrors((currentErrors) =>
      currentErrors.filter((error) => error.field !== field)
    );
    setSubmitError(null);
    setSuccessMessage(null);
  }

  function updateComposerField(
    field: keyof Omit<PurchaseItemDraft, "id">,
    value: string
  ) {
    const composerId = composerItem.id;

    setComposerItem((currentItem) => ({
      ...currentItem,
      [field]: value
    }));
    setErrors((currentErrors) =>
      currentErrors.filter(
        (error) =>
          error.field !== "items" &&
          !(error.itemId === composerId && error.field === field)
      )
    );
    setSubmitError(null);
    setSuccessMessage(null);
  }

  function resetComposer() {
    setComposerItem(createPurchaseDraftItem());
    setEditingItemId(null);
  }

  function clearComposer() {
    const composerId = composerItem.id;

    resetComposer();
    setErrors((currentErrors) =>
      currentErrors.filter(
        (error) => error.itemId !== composerId && error.field !== "items"
      )
    );
    setSubmitError(null);
    setSuccessMessage(null);
  }

  function removeConfirmedItem(itemId: string) {
    if (editingItemId) {
      return;
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      items: currentDraft.items.filter((item) => item.id !== itemId)
    }));
    setErrors((currentErrors) =>
      currentErrors.filter((error) => error.itemId !== itemId)
    );
    setSubmitError(null);
    setSuccessMessage(null);
  }

  function startItemEdit(itemId: string) {
    if (editingItemId) {
      return;
    }

    const itemToEdit = draft.items.find((item) => item.id === itemId);
    if (!itemToEdit) {
      return;
    }

    setComposerItem({ ...itemToEdit });
    setEditingItemId(itemId);
    setErrors((currentErrors) =>
      currentErrors.filter((error) => error.field !== "items")
    );
    setSubmitError(null);
    setSuccessMessage(null);
  }

  function cancelItemEdit() {
    if (!editingItemId) {
      return;
    }

    const currentComposerId = composerItem.id;
    resetComposer();
    setErrors((currentErrors) =>
      currentErrors.filter(
        (error) => error.itemId !== currentComposerId && error.field !== "items"
      )
    );
    setSubmitError(null);
    setSuccessMessage(null);
  }

  function includeComposerItem() {
    const currentComposer = composerItem;
    const itemErrors = validatePurchaseItemDraft(
      currentComposer,
      referenceProducts,
      draft.items,
      editingItemId
    );

    if (itemErrors.length > 0) {
      setErrors((currentErrors) => {
        const remainingErrors = currentErrors.filter(
          (error) =>
            error.field !== "items" && error.itemId !== currentComposer.id
        );
        return [...remainingErrors, ...itemErrors];
      });
      return;
    }

    setDraft((currentDraft) => {
      if (editingItemId) {
        const itemIndex = currentDraft.items.findIndex(
          (item) => item.id === editingItemId
        );

        if (itemIndex === -1) {
          return currentDraft;
        }

        const nextItems = [...currentDraft.items];
        nextItems[itemIndex] = currentComposer;
        return {
          ...currentDraft,
          items: nextItems
        };
      }

      return {
        ...currentDraft,
        items: [...currentDraft.items, currentComposer]
      };
    });

    const previousComposerId = currentComposer.id;
    resetComposer();
    setErrors((currentErrors) =>
      currentErrors.filter(
        (error) => error.itemId !== previousComposerId && error.field !== "items"
      )
    );
    setSubmitError(null);
    setSuccessMessage(null);
  }

  async function submitPurchase(payload: CreatePurchasePayload) {
    const response = await createPurchase.mutateAsync(payload);
    const href = compraDetalhe(response.id);
    setSuccessMessage("Compra registrada como mercadoria em transito.");
    onCreated?.(href, response.id);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    const validationErrors = validatePurchaseDraft(
      draft,
      referenceProducts,
      referenceSuppliers
    );
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      return;
    }

    if (hasEditingActive || composerHasContent) {
      setSubmitError(
        hasEditingActive
          ? "Atualize o item em edicao ou cancele antes de registrar a compra."
          : "Inclua o item preenchido no carrinho ou limpe a composicao antes de registrar."
      );
      return;
    }

    try {
      await submitPurchase(buildCreatePurchasePayload(draft));
    } catch (error) {
      const apiError = toApiError(error);
      setSubmitError(apiError.message);
    }
  }

  if (isLoadingSupportLists) {
    return (
      <LoadingState
        title="Carregando dados da compra"
        description="Aguarde enquanto fornecedores e produtos sao carregados."
      />
    );
  }

  if (hasSupportListError) {
    return (
      <ErrorState
        title="Nao foi possivel carregar referencias"
        description="Fornecedores e produtos reais sao obrigatorios para registrar uma compra."
        onRetry={retrySupportLists}
      />
    );
  }

  if (hasNoProducts) {
    return (
      <EmptyState
        title="Produtos indisponiveis"
        description="Cadastre ao menos um produto antes de registrar compras."
        badgeLabel="Dependencia obrigatoria"
        variant="empty"
        icon={<PackagePlus className="h-5 w-5" aria-hidden />}
      />
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} noValidate>
        <CardHeader>
          <CardTitle>Registrar compra</CardTitle>
          <CardDescription>
            A compra fica como mercadoria em transito. A entrada de estoque so
            ocorre em recebimento fisico confirmado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {submitError ? (
            <div className="rounded-amani border border-danger bg-surface-light px-4 py-3 text-sm leading-6 text-danger">
              {submitError}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-amani border border-success bg-surface-light px-4 py-3 text-sm leading-6 text-text-primary">
              {successMessage}
            </div>
          ) : null}

          <div className="grid gap-5 tablet:grid-cols-2">
            <div className="grid gap-2">
              <div className="flex flex-col gap-2 tablet:flex-row tablet:items-center tablet:justify-between">
                <label className={fieldLabelClassName} htmlFor="purchase-supplier">
                  Fornecedor
                </label>
                <SupplierQuickCreateDialog
                  disabled={isSubmitting}
                  onCreated={(supplier) =>
                    updateDraftField("fornecedorId", supplier.id)
                  }
                />
              </div>
              <select
                id="purchase-supplier"
                className={cn(selectClassName)}
                value={draft.fornecedorId}
                onChange={(event) =>
                  updateDraftField("fornecedorId", event.target.value)
                }
                disabled={isSubmitting}
                aria-invalid={Boolean(supplierError)}
                aria-describedby={
                  supplierError
                    ? "purchase-supplier-error"
                    : "purchase-supplier-help"
                }
              >
                <option value="">Selecione um fornecedor</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.nome}
                  </option>
                ))}
              </select>
              <p id="purchase-supplier-help" className={fieldHelpClassName}>
                Obrigatorio para vincular a compra a origem comercial.
              </p>
              <div id="purchase-supplier-error">
                <FieldError message={supplierError} />
              </div>
            </div>

            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="purchase-date">
                Data da compra
              </label>
              <Input
                id="purchase-date"
                type="date"
                value={draft.dataCompra}
                onChange={(event) =>
                  updateDraftField("dataCompra", event.target.value)
                }
                disabled={isSubmitting}
                aria-invalid={Boolean(dateError)}
                aria-describedby={
                  dateError ? "purchase-date-error" : "purchase-date-help"
                }
              />
              <p id="purchase-date-help" className={fieldHelpClassName}>
                Use a data comercial da compra.
              </p>
              <div id="purchase-date-error">
                <FieldError message={dateError} />
              </div>
            </div>
          </div>

          <div className="grid gap-5 tablet:grid-cols-2">
            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="purchase-discount">
                Desconto total
              </label>
              <Input
                id="purchase-discount"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={draft.desconto}
                onChange={(event) =>
                  updateDraftField("desconto", event.target.value)
                }
                disabled={isSubmitting}
                aria-invalid={Boolean(discountError)}
                aria-describedby={
                  discountError ? "purchase-discount-error" : undefined
                }
              />
              <div id="purchase-discount-error">
                <FieldError message={discountError} />
              </div>
            </div>

            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="purchase-increase">
                Acrescimo total
              </label>
              <Input
                id="purchase-increase"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={draft.acrescimo}
                onChange={(event) =>
                  updateDraftField("acrescimo", event.target.value)
                }
                disabled={isSubmitting}
                aria-invalid={Boolean(increaseError)}
                aria-describedby={
                  increaseError ? "purchase-increase-error" : undefined
                }
              />
              <div id="purchase-increase-error">
                <FieldError message={increaseError} />
              </div>
            </div>
          </div>

          <div className="grid gap-6 desktop:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] desktop:items-start">
            <div className="space-y-4">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-text-primary">
                  Itens da compra
                </h3>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Componha um item por vez e confirme para adicionar ao carrinho.
                </p>
              </div>

              <FieldError message={itemsError} />

              <PurchaseItemComposer
                item={composerItem}
                products={products}
                errors={errors}
                disabled={isSubmitting}
                isEditing={hasEditingActive}
                canClear={composerHasContent}
                submitBlockMessage={composerSubmitMessage}
                onChange={updateComposerField}
                onInclude={includeComposerItem}
                onCancelEdit={hasEditingActive ? cancelItemEdit : undefined}
                onClear={!hasEditingActive ? clearComposer : undefined}
              />
            </div>

            <PurchaseSummary
              draft={draft}
              products={products}
              canSubmit={canSubmit}
              disabled={isSubmitting}
              editingItemId={editingItemId}
              onEditItem={startItemEdit}
              onRemoveItem={removeConfirmedItem}
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch tablet:flex-row tablet:justify-end">
          <Button type="submit" disabled={isSubmitting || !canSubmit}>
            {isSubmitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            <span>{isSubmitting ? "Registrando" : "Registrar compra"}</span>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
