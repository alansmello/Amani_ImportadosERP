import { Package } from "lucide-react";

import { ProductActions } from "@/components/produtos/product-actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import type { Product } from "@/types/product";

type ProductListItem = Product & {
  categoriaNome: string;
  fornecedorNome: string;
};

type ProductTableProps = {
  products: ProductListItem[];
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function ProductTable({ products }: ProductTableProps) {
  return (
    <section aria-label="Produtos cadastrados">
      <div className="grid gap-3 desktop:hidden">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader className="pb-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-amani border border-border bg-surface-light text-primary">
                  <Package className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate leading-6">
                    {product.nome}
                  </CardTitle>
                  <p className="mt-1 text-sm text-text-secondary">
                    {product.categoriaNome}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-text-secondary">Preco de venda</dt>
                  <dd className="font-medium text-text-primary">
                    {formatCurrency(product.precoVenda)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-text-secondary">Fornecedor</dt>
                  <dd className="min-w-0 text-right text-text-primary">
                    <Badge variant="neutral">{product.fornecedorNome}</Badge>
                  </dd>
                </div>
              </dl>
              <ProductActions productId={product.id} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="hidden rounded-amani border border-border bg-surface desktop:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Preco de venda</TableHead>
              <TableHead className="w-52">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.nome}</TableCell>
                <TableCell>{product.categoriaNome}</TableCell>
                <TableCell>
                  <Badge variant="neutral">{product.fornecedorNome}</Badge>
                </TableCell>
                <TableCell>{formatCurrency(product.precoVenda)}</TableCell>
                <TableCell>
                  <ProductActions productId={product.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
