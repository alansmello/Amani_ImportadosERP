# Quickstart: Mercadorias em Transito e Recebimento Parcial

## Prerequisites

- PostgreSQL configurado em `src/Amani.ImportadosERP.Api/appsettings.json`.
- Ferramenta EF Core disponivel para migrations.
- Cadastros base existentes: fornecedor e produto.
- Feature 002 aplicada quando houver validacao de inventario inicial.

## Build

```powershell
dotnet build
```

Expected outcome: solucao compila sem erros.

## Apply Migration

```powershell
dotnet ef database update --project src/Amani.ImportadosERP.Infra.Data --startup-project src/Amani.ImportadosERP.Api
```

Expected outcome: banco contem status de compra, recebimentos e perdas por item,
recebimentos legados para compras anteriores a Feature 003, e nenhum campo fixo
de estoque.

## Run API

```powershell
dotnet run --project src/Amani.ImportadosERP.Api
```

Use a URL exibida pelo ASP.NET Core para executar os cenarios abaixo.

## Validation Scenarios

### 1. Criar compra sem estoque automatico

Expected outcome:

- Saldo fisico nao muda apos criar compra.
- Compra aparece em mercadorias em transito com quantidade pendente igual a
  quantidade comprada.

### 2. Receber parcialmente item de compra

Expected outcome:

- Saldo aumenta apenas pela quantidade recebida.
- Item mostra quantidade recebida e pendente corretas.
- Historico exibe o recebimento.
- Compra continua em transito se ainda houver pendencia.
- Recebimento, movimentacao de estoque e status da compra sao persistidos de
  forma atomica.

### 3. Registrar segundo recebimento do mesmo item

Expected outcome:

- Historico preserva os dois recebimentos.
- Saldo fisico corresponde a soma dos recebimentos.
- Nenhuma entrada foi criada para quantidade ainda pendente.

### 4. Registrar perda, extravio ou avaria

Expected outcome:

- Saldo fisico nao muda.
- Quantidade perdida reduz pendencia.
- Historico exibe perda com motivo e data.
- Perda, rastreabilidade de prejuizo e status da compra sao persistidos de forma
  atomica.

### 5. Rejeitar quantidade acima da pendencia

Expected outcome:

- Requests invalidos sao rejeitados.
- Nenhum evento historico novo e criado.
- Nenhuma movimentacao de estoque e criada.

### 6. Resolver compra e remover do transito

Expected outcome:

- Compra nao aparece mais em mercadorias em transito.
- Compra fica `Recebida` quando 100% foi recebido fisicamente.
- Compra fica `Finalizada` quando toda a quantidade foi resolvida e houve pelo
  menos uma perda, extravio ou avaria.
- Historicos permanecem consultaveis.

### 7. Regressao de venda

Expected outcome:

- Venda antes do recebimento e rejeitada por estoque insuficiente.
- Venda acima do recebido e rejeitada.
- Venda dentro do saldo fisico e aceita e gera saida de estoque.

### 8. Regressao de inventario inicial e custo medio

Expected outcome:

- Inventario inicial continua gerando entrada valida.
- Compra nao recebida nao altera custo medio.
- Recebimento confirmado passa a compor custo medio.
- Produtos com inventario inicial valorizado podem ter lucro/custo medio
  alterado porque o inventario inicial passa a ser entrada real considerada.
- Perda, extravio e avaria nao entram no custo medio.

### 9. Regressao de dashboard financeiro

Expected outcome:

- Dashboard financeiro continua considerando compra registrada como impacto
  financeiro imediato, mesmo que estoque fisico dependa de recebimento.
- Recebimentos e perdas nao alteram o regime financeiro.

### 10. Regressao de compras legadas

Expected outcome:

- Compra antiga fica com status `Recebida`.
- Cada item antigo possui recebimento `LegadoMigrado` com quantidade igual a
  quantidade comprada.
- Recebimento legado nao possui movimentacao nova de estoque.
- Quantidade pendente da compra antiga e zero.
- Compra antiga nao aparece em mercadorias em transito.
- Saldo fisico nao e duplicado pela migracao.

## Validation Results

### Phase 6 run - 2026-06-07

- `dotnet build --no-restore` com NuGet config temporario apontando para
  `nuget.org`: PASS, 0 warnings, 0 errors.
- `dotnet ef database update --no-build`: PASS, banco ja estava atualizado.
- Regressao HTTP/SQL local em `http://localhost:57593`: PASS para criacao de
  compra sem estoque automatico, mercadorias em transito, produtos pendentes,
  recebimento parcial, multiplos recebimentos, rejeicoes de recebimento/perda,
  perdas por `Avaria`, `Perda` e `Extravio`, status `ParcialmenteRecebida`,
  `Finalizada` e `Recebida`, historicos, vendas por saldo fisico, inventario
  inicial, custo medio, lucro com inventario valorizado, dashboard financeiro,
  compras legadas e movimentacoes antigas com `CompraItemId` nulo.
- Regressao encontrada e corrigida durante a fase: recebimentos/perdas validos
  geravam `DbUpdateConcurrencyException` porque novos eventos logisticos eram
  descobertos pelo EF com `Guid` ja atribuido e tratados como existentes. A
  correcao explicita a insercao sem `SaveChanges` intermediario e deixa o
  `UnitOfWork` fazer o commit unico.
- Observacao: `POST /api/implantacao/saldo-inicial-caixa` exige
  `origem = ImplantacaoInicial`; contas a receber iniciais aceitam
  `SaldoInicial`.

### Final handoff - 2026-06-07

- Resultado final da Feature 003: PASS para build, migration e cenarios HTTP/SQL
  registrados na execucao da Phase 6.
- Contratos revisados contra `ComprasController` e DTOs expostos: endpoints de
  criacao, recebimento, perda, mercadorias em transito, produtos pendentes,
  historico de recebimentos, historico de perdas e detalhe da compra permanecem
  refletidos em `contracts/compras-transito-api.md`.
- Modelo de dados revisado contra entidades e migration: status operacional,
  recebimentos, perdas, compatibilidade legada e `CompraItemId` nullable em
  `EstoqueMovimentacao` permanecem refletidos em `data-model.md`.
- Plano revisado contra implementacao: custo medio usa entradas reais
  (`InventarioInicial` e recebimento confirmado), recebimento/perda sao
  transacionais, compras legadas usam recebimentos `LegadoMigrado` sem nova
  movimentacao, e dashboard financeiro continua por compra registrada.
- Analise cruzada final entre `spec.md`, `plan.md`, `data-model.md`,
  `contracts/compras-transito-api.md`, `quickstart.md` e `tasks.md`: sem
  inconsistencias bloqueantes apos alinhar o valor tecnico de origem legada para
  `LegadoMigrado`.
- Handoff: a Feature 003 altera apenas o fluxo fisico/operacional de estoque.
  Compra registrada continua representando impacto financeiro imediato; entrada
  fisica, saldo disponivel e custo medio passam a depender de recebimentos
  fisicos confirmados. Recebimentos e perdas nao criam novo regime financeiro.

## References

- [Data model](./data-model.md)
- [API contracts](./contracts/compras-transito-api.md)
- [Specification](./spec.md)
