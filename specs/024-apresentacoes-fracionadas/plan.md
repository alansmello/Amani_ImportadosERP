# Implementation Plan: Apresentações Comerciais e Conversão Fracionada de Estoque

**Branch**: `024-apresentacoes-fracionadas` | **Date**: 2026-06-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/024-apresentacoes-fracionadas/spec.md`

**Authorization**: implementação autorizada; novo projeto e tarefas de testes automatizados removidos do escopo por decisão explícita.

## Summary

Adicionar apresentações comerciais opt-in ao produto e converter novas vendas pela razão exata `QuantidadeInformada × FatorNumerador / FatorDenominador`. A razão, reduzida de forma canônica, será a fonte autoritativa para saldo, validação, cancelamento, custo e lucro. Fator e quantidade decimais serão projeções persistidas para contratos, auditoria e exibição. VendaItem e EstoqueMovimentacao preservarão os componentes exatos necessários para que operações separadas como 24 doses de 1/24 conciliem exatamente com 1 caixa. Dados legados permanecem sem apresentação e são interpretados como quantidade inteira sobre denominador 1, sem DML retroativo.

## Technical Context

**Language/Version**: C# 12 / .NET 8 no backend; TypeScript 5.7, React 19 e Next.js 15 no frontend

**Primary Dependencies**: MediatR 12.1, Entity Framework Core 8, Npgsql 8 e PostgreSQL; TanStack Query 5, Tailwind CSS 3 e Design System local; `System.Numerics.BigInteger` para composição racional sem nova dependência de produção

**Storage**: PostgreSQL existente; nova tabela de apresentações, snapshots nullable em itens de venda, metadados racionais nullable em movimentações e ampliação compatível da quantidade de estoque para projeção decimal

**Validation**: sem novo projeto de testes; `dotnet build`, `npm run lint`, `npm run typecheck`, `npm run build` e roteiro manual sobre cópia anonimizada de produção

**Target Platform**: API .NET em Linux/container com PostgreSQL; aplicação web responsiva em navegadores modernos

**Project Type**: aplicação web full stack em monorepo, com backend Clean Architecture e frontend Next.js App Router

**Performance Goals**: validação de venda sem materializar histórico; 95% das consultas de saldo e dashboard em até 3 segundos com 100 mil movimentações, agregando numeradores por produto e denominador no banco

**Constraints**: nenhuma atualização de linha histórica; produtos sem apresentação preservam comportamento; razão exata é autoritativa; projeção decimal não decide saldo; estoque somente por movimentações; compras/recebimentos/perdas permanecem na unidade principal; transação atômica; sem AutoMapper; controllers finos; Fluent API; Mobile First e Dark Theme

**Scale/Scope**: 1 nova entidade, 1 value object racional, extensões em VendaItem e EstoqueMovimentacao, 3 grupos de endpoints/contratos, aproximadamente 12 consumidores backend de quantidade/custo e 10 componentes/tipos frontend diretamente afetados

## Constitution Check

*GATE: aprovado antes da Phase 0 e reavaliado após o design da Phase 1.*

- **I. Arquitetura e separação**: PASS — invariantes ficam no Domain; Application orquestra; repositories agregam; controllers apenas traduzem HTTP.
- **II. Estoque por movimentações**: PASS — saldo continua derivado somente de movimentações; a razão exata passa a compor a própria movimentação.
- **III. Compras, vendas, custos e lucro**: PASS — compras continuam em trânsito até recebimento; entradas reais formam custo médio; venda usa quantidade exata proporcional.
- **IV. DTOs e mapeamento explícito**: PASS — contratos aditivos e snapshots explícitos; sem AutoMapper.
- **V. Persistência e histórico**: PASS — tabela/colunas novas são nullable; nenhuma linha antiga recebe apresentação ou é recalculada. A ampliação de `estoque_movimentacoes.quantidade` será ensaiada e preserva numericamente todos os inteiros.
- **VI. Backend como fonte**: PASS — frações, saldo, custo, lucro e métricas são calculados no backend.
- **VII. Analytics**: PASS — consultas agrupam por produto/denominador e retornam agregados, não o histórico completo.
- **VIII. Mobile First**: PASS — cadastro e seletor de apresentação serão validados em 390 px, 768 px e 1440 px.
- **IX. Experiência operacional**: PASS — venda adiciona somente a seleção de apresentação e mostra unidade comercial sem expor ruído decimal.
- **X. Priorização**: PASS — resolve venda/estoque produtivos antes de integrações avançadas.
- **XI. Identidade visual**: PASS — componentes e tokens existentes serão reutilizados.
- **XII. Simplicidade**: PASS — razão exata e projeção decimal resolvem um risco real; não há produtos duplicados, embalagem física ou migração de saldo.

**Reavaliação pós-design**: PASS, condicionada aos gates de rollout do [impact-analysis.md](impact-analysis.md). A migration é expansiva e não executa DML histórico; a única operação sobre estrutura existente é a ampliação de inteiro para decimal da quantidade, que exige medição de lock e ensaio de reversão antes de produção.

## Exact Quantity Strategy

1. `ProdutoApresentacao` persiste `FatorNumerador` e `FatorDenominador` positivos e reduzidos por MDC; numerador não excede denominador nesta versão.
2. `QuantidadeRacional` no Domain multiplica, soma, compara e reduz razões com aritmética inteira verificada. A conversão decimal ocorre somente no limite de persistência/exibição.
3. `VendaItem` mantém `Quantidade` como quantidade comercial inteira e adiciona snapshot nullable de apresentação, nome, numerador, denominador, fator decimal e quantidade decimal convertida.
4. `EstoqueMovimentacao` mantém `Quantidade` como projeção decimal final e adiciona `QuantidadeExataNumerador`, `QuantidadeExataDenominador` e `VendaItemId` nullable. Linhas antigas com par nulo equivalem exatamente a `Quantidade/1`.
5. Saldo e validação agregam no banco por produto, tipo e denominador; a Application combina os totais por aritmética racional. Assim, 24 movimentos `1/24` resultam em `24/24 = 1/1` antes da projeção decimal.
6. Cancelamento cria entrada com a mesma razão normalizada e a mesma projeção decimal da saída original, vinculada ao VendaItem. Essa compensação não usa preço de venda como custo e não entra na formação do custo médio.
7. Custo e lucro multiplicam o custo médio da unidade principal pela razão exata e arredondam apenas o valor monetário final.

## Migration and Rollout Strategy

- Criar `produto_apresentacoes` com FK restritiva para produto, índices por produto/ativo/permissão e validações de numerador/denominador.
- Adicionar campos de snapshot nullable em `venda_itens`; registros antigos continuam nulos e usam semântica legada.
- Adicionar `VendaItemId`, numerador e denominador exatos nullable em `estoque_movimentacoes`; registros antigos continuam nulos.
- Ampliar `estoque_movimentacoes.quantidade` de inteiro para `numeric(28,12)` usando conversão direta, sem `UPDATE`. Todos os valores inteiros existentes permanecem numericamente idênticos.
- Usar `numeric(28,12)` para fator e quantidade convertida apenas como projeção. A precisão operacional vem dos pares inteiros, não da escala decimal.
- Executar migration primeiro com funcionalidade desabilitada; medir lock e tempo em cópia de produção; conciliar contagens, somas legadas, custos e dashboards.
- Habilitar cadastro e venda fracionada somente após smoke test. O rollback operacional desabilita a feature e mantém o schema expansivo; depois da primeira venda fracionada, não executar `Down` nem voltar para binário que suponha quantidade inteira.

## Project Structure

### Documentation (this feature)

```text
specs/024-apresentacoes-fracionadas/
├── spec.md
├── plan.md
├── research.md
├── impact-analysis.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── apresentacoes-fracionadas.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── Amani.ImportadosERP.Domain/
│   ├── Common/QuantidadeRacional.cs
│   └── Entities/{Produto,ProdutoApresentacao,Venda,VendaItem,EstoqueMovimentacao}.cs
├── Amani.ImportadosERP.Application/
│   ├── DTOs/{Produtos,Vendas,Estoque}/
│   ├── Interfaces/{IProdutoApresentacaoRepository,IEstoqueConsultaRepository}.cs
│   ├── Services/{ProdutoApresentacaoService,VendaService}.cs
│   ├── Commands/Handlers/CancelarVendaCommandHandler.cs
│   └── Mappers/VendaMapper.cs
├── Amani.ImportadosERP.Infra.Data/
│   ├── EntityConfigurations/{ProdutoApresentacao,VendaItem,EstoqueMovimentacao}Mapping.cs
│   ├── Repositories/{ProdutoApresentacao,EstoqueConsulta,CustoProduto,Dashboard*}Repository.cs
│   └── Migrations/
├── Amani.ImportadosERP.Infra.IoC/DependencyInjection.cs
└── Amani.ImportadosERP.Api/Controllers/{Produtos,Vendas,Estoque}Controller.cs

frontend/src/
├── types/{product,sale,stock,dashboard}.ts
├── services/{products,sales,stock}.ts
├── hooks/{use-products,use-sales,use-stock}.ts
└── components/
    ├── produtos/{product-form,product-details,product-presentations}.tsx
    ├── vendas/{sale-item-composer,sale-summary,sale-detail,sales-list}.tsx
    └── estoque/{stock-list,stock-movement-list,stock-movement-detail}.tsx

```

**Structure Decision**: manter a Clean Architecture existente. A aritmética racional é um value object de domínio sem dependência externa; persistência armazena componentes primitivos via Fluent API; repositories devolvem agregados; Application compõe saldo e casos de uso; frontend apenas envia a apresentação e exibe resultados oficiais.

## Affected Files Confirmed

- **Domain**: `Produto.cs`, `Venda.cs`, `VendaItem.cs`, `EstoqueMovimentacao.cs` e nova `ProdutoApresentacao.cs`/`QuantidadeRacional.cs`.
- **Application**: `VendaService.cs`, `CancelarVendaCommandHandler.cs`, DTOs de produto/venda/estoque, `VendaMapper.cs`, interfaces de produto e estoque, handlers de lista/dashboard que hoje multiplicam `Quantidade` diretamente. O cancelamento atual usa preço de venda como valor da entrada e precisa deixar de contaminar custo médio nas novas operações.
- **Infra.Data**: `AmaniDbContext.cs`, mappings e snapshot, migration nova, `EstoqueConsultaRepository.cs`, `CustoProdutoRepository.cs`, `DashboardCustoMedioReadService.cs`, `DashboardEstoqueRepository.cs`, `DashboardRankingRepository.cs` e repositories de venda/produto.
- **API/IoC**: controllers de produtos/vendas/estoque e `DependencyInjection.cs`.
- **Frontend**: tipos de produto/venda/estoque/dashboard; formulário/detalhe de produto; compositor, resumo, detalhe e lista de vendas; lista e detalhe de movimentações.
- **Sem alteração funcional em compras**: `CompraItem`, recebimentos e perdas permanecem inteiros; seus DTOs e telas entram apenas na regressão.

## Implementation Strategy

1. Implementar a aritmética racional e validar seus invariantes pelo roteiro manual antes de integrar ao fluxo produtivo.
2. Criar schema expansivo, snapshots e contratos aditivos, mantendo a feature desabilitada.
3. Adaptar saldo, movimentações, custo, lucro, cancelamento e dashboards para dados legados + racionais.
4. Expor cadastro de apresentações e integrar seleção/snapshot à venda.
5. Atualizar frontend Mobile First e formatação de quantidades.
6. Ensaiar migration, conciliação e rollback lógico em cópia de produção.
7. Executar builds e roteiro manual completo antes do rollout.
