"use client";

import { LoaderCircle, PackagePlus, Save, UserPlus } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { QuickCustomerDialog } from "@/components/clientes/quick-customer-dialog";
import { SaleItemComposer } from "@/components/vendas/sale-item-composer";
import {
  SalePaymentModal,
  type SalePaymentSelection
} from "@/components/vendas/sale-payment-modal";
import { SaleSummary } from "@/components/vendas/sale-summary";
import {
  attachSalePaymentPayload,
  buildCreateSalePayload,
  createEmptySaleDraft,
  createEmptySaleItemDraft,
  getSaleValidationMessage,
  validateSaleItemDraft,
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
  CreateSaleResponse,
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
  const [pendingPayload, setPendingPayload] =
    useState<CreateSalePayload | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [quickCustomerOpen, setQuickCustomerOpen] = useState(false);
  const [composerItem, setComposerItem] = useState<SaleItemDraft>(() =>
    createEmptySaleItemDraft()
  );
  const [editingBackupItem, setEditingBackupItem] = useState<SaleItemDraft | null>(
    null
  );

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

  const referenceProducts = products;
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

  function handleQuickCustomerSuccess(customer: Customer) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      clienteId: customer.id
    }));
    setErrors((currentErrors) =>
      currentErrors.filter((error) => error.field !== "clienteId")
    );
    setSubmitError(null);
    setSuccessMessage(null);
  }

  function updateComposerField(
    field: keyof Omit<SaleItemDraft, "id">,
    value: string
  ) {
    setComposerItem((currentItem) => {
      const nextItem = { ...currentItem, [field]: value };

      if (field === "produtoId" && value) {
        const selectedProduct = products.find((product) => product.id === value);
        if (selectedProduct) {
          nextItem.precoUnitario = String(selectedProduct.precoVenda);
          nextItem.produtoApresentacaoId = "";
        }
      }

      if (field === "produtoApresentacaoId" && value) {
        const selectedProduct = products.find(
          (product) => product.id === nextItem.produtoId
        );
        const selectedPresentation = selectedProduct?.apresentacoes.find(
          (presentation) => presentation.id === value
        );
        if (selectedPresentation?.precoVenda !== null && selectedPresentation?.precoVenda !== undefined) {
          nextItem.precoUnitario = String(selectedPresentation.precoVenda);
        }
      }

      return nextItem;
    });
    setErrors((currentErrors) =>
      currentErrors.filter(
        (error) =>
          error.field !== "items" &&
          !(error.itemId === composerItem.id && error.field === field)
      )
    );
    setSubmitError(null);
    setSuccessMessage(null);
  }

  function removeConfirmedItem(itemId: string) {
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
    const itemToEdit = draft.items.find((item) => item.id === itemId);
    if (!itemToEdit) {
      return;
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      items: currentDraft.items.filter((item) => item.id !== itemId)
    }));
    setComposerItem(itemToEdit);
    setEditingBackupItem(itemToEdit);
    setErrors((currentErrors) =>
      currentErrors.filter(
        (error) => error.itemId !== itemId && error.field !== "items"
      )
    );
    setSubmitError(null);
    setSuccessMessage(null);
  }

  function cancelItemEdit() {
    if (!editingBackupItem) {
      return;
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      items: [...currentDraft.items, editingBackupItem]
    }));
    setComposerItem(createEmptySaleItemDraft());
    setEditingBackupItem(null);
    setErrors((currentErrors) =>
      currentErrors.filter((error) => error.itemId !== editingBackupItem.id)
    );
    setSubmitError(null);
    setSuccessMessage(null);
  }

  function includeComposerItem() {
    const itemErrors = validateSaleItemDraft(
      composerItem,
      referenceProducts,
      draft.items
    );

    if (itemErrors.length > 0) {
      setErrors((currentErrors) => {
        const remainingErrors = currentErrors.filter(
          (error) =>
            error.field !== "items" &&
            error.itemId !== composerItem.id
        );
        return [...remainingErrors, ...itemErrors];
      });
      return;
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      items: [...currentDraft.items, composerItem]
    }));
    setComposerItem(createEmptySaleItemDraft());
    setEditingBackupItem(null);
    setErrors((currentErrors) =>
      currentErrors.filter(
        (error) => error.itemId !== composerItem.id && error.field !== "items"
      )
    );
    setSubmitError(null);
    setSuccessMessage(null);
  }

  function buildFinancialSuccessMessage(response: CreateSaleResponse) {
    if (response.mensagemFinanceira) {
      return response.mensagemFinanceira;
    }

    if (response.statusFinanceiro === "Pago") {
      return "Recebido imediatamente.";
    }

    return "Conta a receber gerada.";
  }

  async function submitSale(
    payload: CreateSalePayload,
    payment: SalePaymentSelection
  ) {
    const response = await createSale.mutateAsync({
      ...attachSalePaymentPayload(payload, payment)
    });
    setPaymentModalOpen(false);
    setPendingPayload(null);
    setDraft(buildInitialDraft());
    setComposerItem(createEmptySaleItemDraft());
    setEditingBackupItem(null);
    setErrors([]);
    setSuccessMessage(
      `Venda registrada. ${buildFinancialSuccessMessage(response)}`
    );
    onCreated?.(response.id);
  }

  async function handlePaymentConfirm(payment: SalePaymentSelection) {
    if (!pendingPayload) {
      setSubmitError("Revise a venda antes de confirmar o pagamento.");
      return;
    }

    try {
      await submitSale(pendingPayload, payment);
    } catch (error) {
      const apiError = toApiError(error);
      setSubmitError(apiError.message);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    const validationErrors = validateSaleDraft(
      draft,
      referenceProducts,
      referenceCustomers
    );
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      return;
    }

    try {
      setPendingPayload(buildCreateSalePayload(draft));
      setPaymentModalOpen(true);
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
    <>
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
              <div className="flex items-center justify-between gap-2">
                <label className={fieldLabelClassName} htmlFor="sale-customer">
                  Cliente
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuickCustomerOpen(true)}
                  disabled={isSubmitting}
                  className="h-auto px-0 text-xs text-primary underline-offset-4 hover:underline"
                >
                  <UserPlus className="h-3 w-3" aria-hidden />
                  <span>Cadastrar cliente rapido</span>
                </Button>
              </div>
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
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-text-primary">
                  Itens da venda
                </h3>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Componha um item por vez e confirme para adicionar ao resumo.
                </p>
              </div>

              <FieldError message={itemsError} />

              <SaleItemComposer
                item={composerItem}
                products={products}
                stockByProductId={stockByProductId}
                errors={errors}
                disabled={isSubmitting}
                isEditing={Boolean(editingBackupItem)}
                onChange={updateComposerField}
                onInclude={includeComposerItem}
                onCancelEdit={editingBackupItem ? cancelItemEdit : undefined}
              />
            </div>

            <SaleSummary
              draft={draft}
              products={products}
              canSubmit={canSubmit}
              disabled={isSubmitting}
              onEditItem={startItemEdit}
              onRemoveItem={removeConfirmedItem}
            />
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

      <QuickCustomerDialog
        open={quickCustomerOpen}
        onOpenChange={setQuickCustomerOpen}
        onSuccess={handleQuickCustomerSuccess}
      />

      <SalePaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        onConfirm={handlePaymentConfirm}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
