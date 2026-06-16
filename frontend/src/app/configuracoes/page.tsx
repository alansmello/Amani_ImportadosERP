import Link from "next/link";
import { ArrowRight, ClipboardCheck, Settings } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { routes } from "@/config/routes";

export default function ConfiguracoesPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Configuracoes"
        description="Acesse configuracoes de preparacao do sistema sem misturar implantacao com compras, vendas, estoque ou financeiro recorrente."
      />

      <section className="grid gap-4 tablet:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-amani border border-border bg-surface-light text-primary">
                <ClipboardCheck className="h-5 w-5" aria-hidden />
              </div>
              <Badge variant="success">Operacional</Badge>
            </div>
          </CardHeader>
          <CardContent className="min-w-0">
            <CardTitle>Implantacao inicial</CardTitle>
            <CardDescription className="mt-2 max-w-2xl break-words">
              Registre inventario inicial, saldo inicial de caixa e contas a
              receber anteriores ao uso do ERP.
            </CardDescription>
          </CardContent>
          <CardFooter className="flex-col items-stretch tablet:flex-row tablet:justify-end">
            <Button asChild>
              <Link href={routes.configuracoesImplantacao}>
                <span>Abrir implantacao</span>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-amani border border-border bg-surface-light text-text-secondary">
                <Settings className="h-5 w-5" aria-hidden />
              </div>
              <Badge>Planejado</Badge>
            </div>
          </CardHeader>
          <CardContent className="min-w-0">
            <CardTitle>Parametros do sistema</CardTitle>
            <CardDescription className="mt-2 max-w-2xl break-words">
              Preferencias, permissoes e demais configuracoes permanecem fora
              desta entrega.
            </CardDescription>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
