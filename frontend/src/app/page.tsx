import { PageHeader } from "@/components/layout/page-header";

export default function HomePage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Frontend em preparacao"
        description="Base responsiva inicial do Amani ERP, pronta para receber navegacao, dashboard placeholder e modulos operacionais nas proximas fases."
      />
      <section className="rounded-amani border border-border bg-surface p-4 text-sm leading-6 text-text-secondary">
        Shell responsivo ativo para smartphone, tablet e desktop.
      </section>
    </main>
  );
}
