"use client";

import { LoaderCircle, PackagePlus, Plus, Save } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import {
  buildCreatePurchasePayload,
  getPurchaseValidationMessage,
  validatePurchaseDraft
} from "@/components/compras/purchase-validation";
import { PurchaseItemEditor } from "@/components/compras/purchase-item-editor";
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

function createDraftItem(): PurchaseItemDraft {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now()),
    produtoId: "",
    quantidade: "",
    custoUnitario: "",
    desconto: "",
    acrescimo: ""
  };
}

function buildInitialDraft(): PurchaseDraft {
  return {
    fornecedorId: "",
    dataCompra: new Date().toISOString().slice(0, 10),
    desconto: "",
    acrescimo: "",
    items: [createDraftItem()]
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
  const [errors, setErrors] = useState<PurchaseValidationError[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const suppliers = suppliersQuery.data ?? EMPTY_SUPPLIERS;
  const products = productsQuery.data ?? EMPTY_PRODUCTS;
  const isLoadingSupportLists = suppliersQuery.isLoading || productsQuery.isLoading;
  const hasSupportListError = suppliersQuery.isError || productsQuery.isError;
  const hasNoSupportData =
    !isLoadingSupportLists &&
    !hasSupportListError &&
    (suppliers.length === 0 || products.length === 0);

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

  function updateItem(
    itemId: string,
    field: keyof Omit<PurchaseItemDraft, "id">,
    value: string
  ) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      items: currentDraft.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
    setErrors((currentErrors) =>
      currentErrors.filter(
        (error) => !(error.itemId === itemId && error.field === field)
      )
    );
    setSubmitError(null);
    setSuccessMessage(null);
  }

  function addItem() {
    setDraft((currentDraft) => ({
      ...currentDraft,
      items: [...currentDraft.items, createDraftItem()]
    }));
    setErrors((currentErrors) =>
      currentErrors.filter((error) => error.field !== "items")
    );
  }

  function removeItem(itemId: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      items: currentDraft.items.filter((item) => item.id !== itemId)
    }));
    setErrors((currentErrors) =>
      currentErrors.filter((error) => error.itemId !== itemId)
    );
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

  if (hasNoSupportData) {
    return (
      <EmptyState
        title="Referencias obrigatorias indisponiveis"
        description="Cadastre ao menos um fornecedor e um produto antes de registrar compras."
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
              <label className={fieldLabelClassName} htmlFor="purchase-supplier">
                Fornecedor
              </label>
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

          <div className="space-y-4">
            <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-text-primary">
                  Itens da compra
                </h3>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Informe produtos distintos, quantidades, custos e ajustes por
                  item.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addItem}
                disabled={isSubmitting}
                className="w-full tablet:w-auto"
              >
                <Plus className="h-4 w-4" aria-hidden />
                <span>Adicionar item</span>
              </Button>
            </div>

            <FieldError message={itemsError} />

            <div className="grid gap-4">
              {draft.items.map((item, index) => (
                <PurchaseItemEditor
                  key={item.id}
                  item={item}
                  index={index}
                  products={products}
                  errors={errors}
                  disabled={isSubmitting}
                  canRemove={draft.items.length > 1}
                  onChange={updateItem}
                  onRemove={removeItem}
                />
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch tablet:flex-row tablet:justify-end">
          <Button type="submit" disabled={isSubmitting}>
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
