"use client";

import { LoaderCircle, PackagePlus, Plus, Save } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { SaleItemEditor } from "@/components/vendas/sale-item-editor";
import { SaleSummary } from "@/components/vendas/sale-summary";
import {
  buildCreateSalePayload,
  consolidateSaleItems,
  createEmptySaleDraft,
  createEmptySaleItemDraft,
  getSaleValidationMessage,
  validateSaleDraft
} from "@/components/vendas/sale-validation";
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
import { useCustomers } from "@/hooks/use-customers";
import { useProducts } from "@/hooks/use-products";
import { useCreateSale } from "@/hooks/use-sales";
import { useStockProducts } from "@/hooks/use-stock";
import { cn } from "@/lib/cn";
import { toApiError } from "@/services/errors";
import type { Customer } from "@/types/customer";
import type { Product } from "@/types/product";
import type {
  CreateSalePayload,
  SaleDraft,
  SaleItemDraft,
  SaleValidationError
} from "@/types/sale";
import type { StockProduct } from "@/types/stock";

type SaleFormProps = {
  onCreated?: (id: string) => void;
};

const EMPTY_CUSTOMERS: Customer[] = [];
const EMPTY_PRODUCTS: Product[] = [];
const EMPTY_STOCK_PRODUCTS: StockProduct[] = [];
const fieldLabelClassName = "text-sm font-medium text-text-primary";
const fieldHelpClassName = "text-xs leading-5 text-text-secondary";
const fieldErrorClassName = "text-xs font-medium leading-5 text-danger";
const selectClassName =
  "flex h-11 w-full rounded-amani border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className={fieldErrorClassName}>{message}</p>;
}

function buildInitialDraft(): SaleDraft {
  return {
    ...createEmptySaleDraft(),
    dataVenda: new Date().toISOString().slice(0, 10)
  };
}

export function SaleForm({ onCreated }: SaleFormProps) {
  const customersQuery = useCustomers();
  const productsQuery = useProducts();
  const stockQuery = useStockProducts();
  const createSale = useCreateSale();
  const [draft, setDraft] = useState<SaleDraft>(() => buildInitialDraft());
  const [errors, setErrors] = useState<SaleValidationError[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const customers = customersQuery.data ?? EMPTY_CUSTOMERS;
  const products = productsQuery.data ?? EMPTY_PRODUCTS;
  const stockProducts = stockQuery.data ?? EMPTY_STOCK_PRODUCTS;
  const isLoadingSupportLists = customersQuery.isLoading || productsQuery.isLoading;
  const hasSupportListError = customersQuery.isError || productsQuery.isError;
  const hasNoSupportData =
    !isLoadingSupportLists &&
    !hasSupportListError &&
    (customers.length === 0 || products.length === 0);

  const isSubmitting = createSale.isPending;
  const customerError = getSaleValidationMessage(errors, "clienteId");
  const itemsError = getSaleValidationMessage(errors, "items");
  const discountError = getSaleValidationMessage(errors, "desconto");
  const increaseError = getSaleValidationMessage(errors, "acrescimo");

  const referenceProducts = useMemo(
    () => products.map((product) => ({ id: product.id })),
    [products]
  );
  const referenceCustomers = useMemo(
    () => customers.map((customer) => ({ id: customer.id })),
    [customers]
  );
  const stockByProductId = useMemo(
    () =>
      new Map(
        stockProducts.map((stockProduct) => [
          stockProduct.produtoId,
          stockProduct
        ])
      ),
    [stockProducts]
  );
  const canSubmit = useMemo(
    () =>
      validateSaleDraft(draft, referenceProducts, referenceCustomers).length ===
      0,
    [draft, referenceProducts, referenceCustomers]
  );

  function retrySupportLists() {
    void customersQuery.refetch();
    void productsQuery.refetch();
    void stockQuery.refetch();
  }

  function updateDraftField(
    field: keyof Omit<SaleDraft, "items">,
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
    field: keyof Omit<SaleItemDraft, "id">,
    value: string
  ) {
    setDraft((currentDraft) => {
      const items = currentDraft.items.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        const nextItem = { ...item, [field]: value };

        if (field === "produtoId" && value && !item.precoUnitario) {
          const product = products.find(
            (availableProduct) => availableProduct.id === value
          );

          if (product) {
            nextItem.precoUnitario = String(product.precoVenda);
          }
        }

        return nextItem;
      });

      return {
        ...currentDraft,
        items:
          field === "produtoId" ? consolidateSaleItems(items) : items
      };
    });
    setErrors((currentErrors) =>
      currentErrors.filter(
        (error) =>
          error.field !== "items" &&
          !(error.itemId === itemId && error.field === field)
      )
    );
    setSubmitError(null);
    setSuccessMessage(null);
  }

  function addItem() {
    setDraft((currentDraft) => ({
      ...currentDraft,
      items: [...currentDraft.items, createEmptySaleItemDraft()]
    }));
    setErrors((currentErrors) =>
      currentErrors.filter((error) => error.field !== "items")
    );
    setSubmitError(null);
    setSuccessMessage(null);
  }

  function removeItem(itemId: string) {
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

  async function submitSale(payload: CreateSalePayload) {
    const response = await createSale.mutateAsync(payload);
    setSuccessMessage("Venda registrada pela fonte oficial.");
    onCreated?.(response.id);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    const consolidatedDraft = {
      ...draft,
      items: consolidateSaleItems(draft.items)
    };
    setDraft(consolidatedDraft);

    const validationErrors = validateSaleDraft(
      consolidatedDraft,
      referenceProducts,
      referenceCustomers
    );
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      return;
    }

    try {
      await submitSale(buildCreateSalePayload(consolidatedDraft));
    } catch (error) {
      const apiError = toApiError(error);
      setSubmitError(apiError.message);
    }
  }

  if (isLoadingSupportLists) {
    return (
      <LoadingState
        title="Carregando dados da venda"
        description="Aguarde enquanto clientes e produtos sao carregados."
      />
    );
  }

  if (hasSupportListError) {
    return (
      <ErrorState
        title="Nao foi possivel carregar referencias"
        description="Clientes e produtos reais sao obrigatorios para registrar uma venda."
        onRetry={retrySupportLists}
      />
    );
  }

  if (hasNoSupportData) {
    return (
      <EmptyState
        title="Referencias obrigatorias indisponiveis"
        description="Cadastre ao menos um cliente ativo e um produto antes de registrar vendas."
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
          <CardTitle>Registrar venda</CardTitle>
          <CardDescription>
            A venda so e concluida quando a API confirma estoque e registro.
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

          {stockQuery.isError ? (
            <div className="rounded-amani border border-warning bg-surface-light px-4 py-3 text-sm leading-6 text-warning">
              Nao foi possivel carregar o saldo consultivo. A venda ainda sera
              validada pela API ao registrar.
            </div>
          ) : null}

          <div className="grid gap-5 tablet:grid-cols-2">
            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="sale-customer">
                Cliente
              </label>
              <select
                id="sale-customer"
                className={cn(selectClassName)}
                value={draft.clienteId}
                onChange={(event) =>
                  updateDraftField("clienteId", event.target.value)
                }
                disabled={isSubmitting}
                aria-invalid={Boolean(customerError)}
                aria-describedby={
                  customerError ? "sale-customer-error" : "sale-customer-help"
                }
              >
                <option value="">Selecione um cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.nome}
                  </option>
                ))}
              </select>
              <p id="sale-customer-help" className={fieldHelpClassName}>
                Obrigatorio para vincular a venda ao cliente.
              </p>
              <div id="sale-customer-error">
                <FieldError message={customerError} />
              </div>
            </div>

            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="sale-date">
                Data da venda
              </label>
              <Input
                id="sale-date"
                type="date"
                value={draft.dataVenda}
                onChange={(event) =>
                  updateDraftField("dataVenda", event.target.value)
                }
                disabled={isSubmitting}
                aria-describedby="sale-date-help"
              />
              <p id="sale-date-help" className={fieldHelpClassName}>
                Opcional; deixe em branco para usar a regra da API.
              </p>
            </div>
          </div>

          <div className="grid gap-5 tablet:grid-cols-2">
            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="sale-discount">
                Desconto total
              </label>
              <Input
                id="sale-discount"
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
                  discountError ? "sale-discount-error" : undefined
                }
              />
              <div id="sale-discount-error">
                <FieldError message={discountError} />
              </div>
            </div>

            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="sale-increase">
                Acrescimo total
              </label>
              <Input
                id="sale-increase"
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
                  increaseError ? "sale-increase-error" : undefined
                }
              />
              <div id="sale-increase-error">
                <FieldError message={increaseError} />
              </div>
            </div>
          </div>

          <div className="grid gap-6 desktop:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] desktop:items-start">
            <div className="space-y-4">
              <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary">
                    Itens da venda
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-text-secondary">
                    Informe produtos, quantidades, precos e ajustes por item.
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
                  <SaleItemEditor
                    key={item.id}
                    item={item}
                    index={index}
                    products={products}
                    stockByProductId={stockByProductId}
                    errors={errors}
                    disabled={isSubmitting}
                    canRemove={draft.items.length > 1}
                    onChange={updateItem}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </div>

            <SaleSummary draft={draft} canSubmit={canSubmit} />
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch tablet:flex-row tablet:justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            <span>{isSubmitting ? "Registrando" : "Registrar venda"}</span>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
