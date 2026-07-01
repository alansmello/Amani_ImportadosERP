"use client";

import { Pencil, Plus, Power, Save, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useCreateProductPresentation,
  useDisableProductPresentation,
  useProductPresentations,
  useUpdateProductPresentation
} from "@/hooks/use-products";
import { toApiError } from "@/services/errors";
import type { ProductPresentation, ProductPresentationPayload } from "@/types/product";

type FormState = {
  nome: string;
  numerador: string;
  denominador: string;
  precoVenda: string;
  permiteVenda: boolean;
  ativo: boolean;
};

const emptyForm: FormState = {
  nome: "",
  numerador: "1",
  denominador: "1",
  precoVenda: "",
  permiteVenda: true,
  ativo: true
};

function toForm(item: ProductPresentation): FormState {
  return {
    nome: item.nome,
    numerador: String(item.fatorNumerador),
    denominador: String(item.fatorDenominador),
    precoVenda: item.precoVenda === null ? "" : String(item.precoVenda),
    permiteVenda: item.permiteVenda,
    ativo: item.ativo
  };
}

function toPayload(form: FormState): ProductPresentationPayload {
  const fatorNumerador = Number(form.numerador);
  const fatorDenominador = Number(form.denominador);
  const precoVenda = form.precoVenda.trim() ? Number(form.precoVenda.replace(",", ".")) : null;

  if (!form.nome.trim()) throw new Error("Informe o nome da apresentacao.");
  if (!Number.isSafeInteger(fatorNumerador) || fatorNumerador <= 0) throw new Error("Numerador deve ser inteiro seguro e maior que zero.");
  if (!Number.isSafeInteger(fatorDenominador) || fatorDenominador <= 0) throw new Error("Denominador deve ser inteiro seguro e maior que zero.");
  if (fatorNumerador > 2147483647 || fatorDenominador > 2147483647) throw new Error("Numerador e denominador devem ser menores ou iguais a 2147483647.");
  if (fatorNumerador > fatorDenominador) throw new Error("O fator deve ser menor ou igual a 1.");
  if (precoVenda !== null && (!Number.isFinite(precoVenda) || precoVenda < 0)) throw new Error("Preco de venda invalido.");

  return {
    nome: form.nome.trim(),
    fatorNumerador,
    fatorDenominador,
    permiteCompra: false,
    permiteVenda: form.permiteVenda,
    precoVenda,
    ativo: form.ativo
  };
}

export function ProductPresentations({ productId }: { productId: string }) {
  const query = useProductPresentations(productId);
  const createMutation = useCreateProductPresentation(productId);
  const updateMutation = useUpdateProductPresentation(productId);
  const disableMutation = useDisableProductPresentation(productId);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pending = createMutation.isPending || updateMutation.isPending || disableMutation.isPending;

  function reset() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function save() {
    try {
      setError(null);
      const payload = toPayload(form);
      if (editingId) await updateMutation.mutateAsync({ id: editingId, payload });
      else await createMutation.mutateAsync(payload);
      reset();
    } catch (cause) {
      setError(toApiError(cause).message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apresentacoes comerciais</CardTitle>
        <CardDescription>Configure apresentações como Unidade 1/1, Pacote 1/4 ou Item 1/24. Compras permanecem na unidade principal.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {error ? <p className="rounded-amani border border-danger px-3 py-2 text-sm text-danger">{error}</p> : null}
        <div className="grid gap-3 tablet:grid-cols-2 desktop:grid-cols-4">
          <Input aria-label="Nome da apresentacao" placeholder="Nome" value={form.nome} onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))} disabled={pending} />
          <Input aria-label="Numerador" type="number" min="1" step="1" value={form.numerador} onChange={(event) => setForm((current) => ({ ...current, numerador: event.target.value }))} disabled={pending} />
          <Input aria-label="Denominador" type="number" min="1" step="1" value={form.denominador} onChange={(event) => setForm((current) => ({ ...current, denominador: event.target.value }))} disabled={pending} />
          <Input aria-label="Preco da apresentacao" type="number" min="0" step="0.01" placeholder="Preco opcional" value={form.precoVenda} onChange={(event) => setForm((current) => ({ ...current, precoVenda: event.target.value }))} disabled={pending} />
        </div>
        <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input type="checkbox" checked={form.permiteVenda} onChange={(event) => setForm((current) => ({ ...current, permiteVenda: event.target.checked }))} disabled={pending} />
            Permitir venda
          </label>
          <div className="flex gap-2">
            {editingId ? <Button type="button" variant="ghost" onClick={reset}><X className="h-4 w-4" />Cancelar</Button> : null}
            <Button type="button" onClick={save} disabled={pending}>
              {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? "Atualizar" : "Adicionar"}
            </Button>
          </div>
        </div>
        <div className="grid gap-3 tablet:grid-cols-2">
          {(query.data ?? []).map((item) => (
            <div key={item.id} className="rounded-amani border border-border bg-surface-light p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-text-primary">{item.nome}</p>
                  <p className="text-sm text-text-secondary">{item.fatorNumerador}/{item.fatorDenominador} = {item.fatorCalculado}</p>
                  <p className="text-xs text-text-secondary">{item.precoVenda === null ? "Preco padrao do produto" : `R$ ${item.precoVenda.toFixed(2)}`} · {item.ativo && item.permiteVenda ? "Disponivel" : "Inativa"}</p>
                </div>
                <div className="flex gap-1">
                  <Button type="button" size="sm" variant="ghost" onClick={() => { setEditingId(item.id); setForm(toForm(item)); }} disabled={pending}><Pencil className="h-4 w-4" /></Button>
                  {item.ativo ? <Button type="button" size="sm" variant="ghost" onClick={() => disableMutation.mutate(item.id)} disabled={pending}><Power className="h-4 w-4" /></Button> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
