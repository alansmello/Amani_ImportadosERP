"use client";

import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  Package,
  Percent,
  ReceiptText,
  Tag,
  Wallet,
  Wrench
} from "lucide-react";
import { useState } from "react";

import { ExpenseCategoriesManager } from "@/components/financeiro/expense-categories-manager";
import { PageHeader } from "@/components/layout/page-header";
import { ProductCategoriesManager } from "@/components/configuracoes/product-categories-manager";
import { PaymentFeesForm } from "@/components/configuracoes/payment-fees-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { routes } from "@/config/routes";

type TabId = "categorias-produto" | "categorias-despesa" | "taxas" | "implantacao";

type Tab = {
  id: TabId;
  label: string;
  icon: React.ReactNode;
};

const tabs: Tab[] = [
  {
    id: "categorias-produto",
    label: "Categorias de Produto",
    icon: <Package className="h-4 w-4" aria-hidden />
  },
  {
    id: "categorias-despesa",
    label: "Categorias de Despesa",
    icon: <Tag className="h-4 w-4" aria-hidden />
  },
  {
    id: "taxas",
    label: "Taxas de Operadora",
    icon: <Percent className="h-4 w-4" aria-hidden />
  },
  {
    id: "implantacao",
    label: "Implantacao",
    icon: <Wrench className="h-4 w-4" aria-hidden />
  }
];

const implantacaoCards = [
  {
    id: "inventario",
    title: "Inventario Inicial",
    description:
      "Registre o estoque fisico atual dos produtos antes de usar o ERP para controle de estoque.",
    icon: <ClipboardCheck className="h-5 w-5" aria-hidden />
  },
  {
    id: "saldo-caixa",
    title: "Saldo Inicial de Caixa",
    description:
      "Informe o saldo em dinheiro e bancos na data de inicio de uso do ERP.",
    icon: <Wallet className="h-5 w-5" aria-hidden />
  },
  {
    id: "contas-receber",
    title: "Contas a Receber Iniciais",
    description:
      "Registre vendas e acordos anteriores ao ERP que ainda aguardam recebimento.",
    icon: <ReceiptText className="h-5 w-5" aria-hidden />
  }
];

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<TabId>("categorias-produto");

  return (
    <main className="space-y-6">
      <PageHeader
        title="Configuracoes"
        description="Gerencie categorias, taxas de operadora e acesse o fluxo de implantacao do sistema."
      />

      <nav
        className="flex gap-1 overflow-x-auto border-b border-border pb-0"
        role="tablist"
        aria-label="Secoes de configuracoes"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div>
        {activeTab === "categorias-produto" ? (
          <section
            id="tabpanel-categorias-produto"
            role="tabpanel"
            aria-labelledby="tab-categorias-produto"
          >
            <ProductCategoriesManager />
          </section>
        ) : null}

        {activeTab === "categorias-despesa" ? (
          <section
            id="tabpanel-categorias-despesa"
            role="tabpanel"
            aria-labelledby="tab-categorias-despesa"
          >
            <ExpenseCategoriesManager />
          </section>
        ) : null}

        {activeTab === "taxas" ? (
          <section
            id="tabpanel-taxas"
            role="tabpanel"
            aria-labelledby="tab-taxas"
          >
            <PaymentFeesForm />
          </section>
        ) : null}

        {activeTab === "implantacao" ? (
          <section
            id="tabpanel-implantacao"
            role="tabpanel"
            aria-labelledby="tab-implantacao"
            className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3"
          >
            {implantacaoCards.map((card) => (
              <Card key={card.id}>
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-amani border border-border bg-surface-light text-primary">
                    {card.icon}
                  </div>
                </CardHeader>
                <CardContent className="min-w-0">
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription className="mt-2 break-words">
                    {card.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="flex-col items-stretch tablet:flex-row tablet:justify-end">
                  <Button asChild>
                    <Link href={routes.configuracoesImplantacao}>
                      <span>Acessar</span>
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
