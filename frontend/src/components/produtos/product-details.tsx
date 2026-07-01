import { Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import type { Product } from "@/types/product";

type ProductDetailsProps = {
  product: Product;
  categoriaNome: string;
  fornecedorNome: string;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function ProductDetails({
  product,
  categoriaNome,
  fornecedorNome
}: ProductDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-amani border border-border bg-surface-light text-primary">
            <Package className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <CardTitle className="leading-6">{product.nome}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 tablet:grid-cols-2">
          <div className="rounded-amani border border-border bg-surface-light p-4">
            <dt className="text-xs font-medium uppercase tracking-normal text-text-secondary">
              Preco de venda
            </dt>
            <dd className="mt-2 text-lg font-semibold text-text-primary">
              {formatCurrency(product.precoVenda)}
            </dd>
          </div>

          <div className="rounded-amani border border-border bg-surface-light p-4">
            <dt className="text-xs font-medium uppercase tracking-normal text-text-secondary">
              Custo
            </dt>
            <dd className="mt-2 text-lg font-semibold text-text-primary">
              {formatCurrency(product.custo)}
            </dd>
          </div>

          <div className="rounded-amani border border-border bg-surface-light p-4">
            <dt className="text-xs font-medium uppercase tracking-normal text-text-secondary">
              Categoria
            </dt>
            <dd className="mt-2 text-sm font-medium text-text-primary">
              {categoriaNome}
            </dd>
          </div>

          <div className="rounded-amani border border-border bg-surface-light p-4">
            <dt className="text-xs font-medium uppercase tracking-normal text-text-secondary">
              Fornecedor
            </dt>
            <dd className="mt-2">
              <Badge variant="neutral">{fornecedorNome}</Badge>
            </dd>
          </div>
        </dl>
      </CardContent>
      {product.apresentacoesFracionadasHabilitadas && product.apresentacoes.length > 0 ? (
        <CardContent>
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Apresentacoes comerciais</h3>
          <div className="grid gap-3 tablet:grid-cols-2">
            {product.apresentacoes.map((item) => (
              <div key={item.id} className="rounded-amani border border-border bg-surface-light p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-text-primary">{item.nome}</p>
                  <Badge variant={item.ativo && item.permiteVenda ? "success" : "neutral"}>
                    {item.ativo && item.permiteVenda ? "Venda ativa" : "Inativa"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-text-secondary">Fator {item.fatorNumerador}/{item.fatorDenominador} · {item.precoVenda === null ? "preco padrao" : formatCurrency(item.precoVenda)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}
