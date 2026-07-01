# RoadMap AmaniERP

---

# **1. Diagnóstico do estado atual**

## **1.1 Backend (`src/`) — maduro e integrado ao frontend**

Arquitetura confirmada: Clean Architecture + DDD Lite, .NET 8, EF Core (Npgsql) + Fluent API, Repository Pattern, MediatR (Commands/Queries), DTOs explícitos sem AutoMapper. A regra constitucional **estoque por movimentações** está respeitada (não há campo fixo de saldo; `EstoqueConsultaRepository.ObterSaldoAsync` calcula entradas − saídas).

Endpoints já implementados e funcionais:

| **Módulo** | **Endpoints** | **Situação** |
| --- | --- | --- |
| Produtos | `POST`, `GET`, `GET/{id}`, `PUT/{id}` | OK (sem saldo no DTO, por design) |
| Categorias (produto) | CRUD | OK |
| Clientes | CRUD + `inativar` | OK |
| Fornecedores | CRUD | OK |
| Compras | criar, obter, `recebimentos`, `perdas`, `em-transito`, `produtos-pendentes`, listar | OK (recebimento parcial + perdas + transação) |
| Vendas | criar (valida estoque + calcula lucro por custo médio), obter, listar, `dashboard`, `cancelar` | OK |
| Despesas | criar, listar | Operacional (update/delete permanecem no backlog) |
| Categorias de despesa | criar, listar, atualizar, inativar, reativar | OK |
| Contas a Receber | criar, `pagamentos`, listar, `por-cliente`, detalhe por cliente, update, delete | OK |
| Configurações de pagamento | listar e atualizar taxas | Funcional, com regra a restringir em F020 |
| Implantação | `inventario-inicial`, `saldo-inicial-caixa`, `contas-receber-iniciais` | OK |
| Dashboard Gerencial | consolidado, `financeiro`, `operacional`, `rankings`, `alertas`, `graficos` | OK (consultas agregadas via repositories de leitura) |
| Dashboard Financeiro | `GET` | OK |

## **1.2 Frontend (`frontend/`) — Next.js 15 / React 19 / Tailwind, Dark Only, Mobile First**

- **Fluxo operacional implementado:** Produtos, Clientes, Fornecedores, Implantação Inicial, Compras/Recebimentos, Estoque, Vendas, Contas a Receber, Despesas, Dashboard, Autenticação e Configurações.
- **Infraestrutura disponível:** Design System local, `app-shell`, navegação responsiva, estados loading/error/empty, TanStack Query, API client autenticado e componentes de modal baseados em Radix Dialog.
- **Estado atual do refinamento:** os módulos estão funcionais, porém existem divergências de UX entre telas, identificadores técnicos expostos, navegação de retorno baseada em links fixos, cadastro auxiliar que interrompe fluxos e uma inconsistência financeira entre os dois acessos ao pagamento de contas a receber.

## **1.3 Features concluídas (specs 001–019)**

001 Cadastros base · 002 Implantação inicial · 003 Mercadorias em trânsito/recebimento parcial · 004 Dashboards gerenciais · 005 Frontend base · 006 Produtos · 007 Clientes · 008 Consulta de Estoque · 009 Fornecedores · 010 Implantação Inicial · 011 Compras e Recebimentos · 012 Estoque · 013 Vendas · 014 Contas a Receber · 015 Formas de Pagamento e Taxas · 016 Despesas e Categorias · 017 Dashboard Gerencial/Financeiro · 018 Autenticação e Autorização · 019 Configurações e Categorias.

## **1.4 Situação atual do produto**

> *O MVP operacional e gerencial está implementado de ponta a ponta. A etapa seguinte não é abertura de novos módulos, mas correção de consistência financeira e refinamento dos fluxos de maior frequência. As próximas features devem preservar os contratos existentes sempre que possível, manter regras críticas no backend e ser pequenas o suficiente para validação isolada.*

## **1.5 Lacunas e inconsistências atuais confirmadas em código**

- **G5 — Contexto financeiro divergente:** a listagem principal de Contas a Receber fornece `FormaPagamento` ao modal, mas o detalhe por cliente não fornece. Cartão de crédito acessado por `Clientes → Ver contas → Pagamento` cai no formulário legado.
- **G6 — Configuração de taxas incoerente:** a interface permite editar taxa para Dinheiro, PIX, Crédito e Fiado, embora apenas Débito utilize configuração automática na venda. A taxa de Crédito é apurada pelo valor líquido no recebimento e as demais são ignoradas.
- **G7 — Identificadores técnicos expostos:** GUIDs aparecem na lista/detalhe de Fornecedor e nos detalhes de Cliente e Produto, sem utilidade operacional.
- **G8 — Fornecedor sem telefone:** domínio, DTOs, API e frontend de Fornecedor possuem apenas nome; exibir telefone exige alteração full stack e migration nullable.
- **G9 — Cadastros auxiliares interrompem fluxos:** Compra e Produto não permitem criar suas referências no próprio formulário; Venda abre o cadastro oficial de Cliente em outra aba.
- **G10 — Inclusão de itens da Venda visualmente pesada:** cada item mantém um card aberto. O resumo não lista nome e valor de cada produto.
- **G11 — Consolidação ambígua de produto duplicado:** a implementação atual soma quantidades, mas pode descartar silenciosamente preço, desconto e acréscimo do segundo item.
- **G12 — Navegação de retorno fixa:** páginas de criação, edição e detalhe apontam para uma rota pai predeterminada, em vez de considerar a origem real do usuário.
- **G13 (remanescente):** Despesas continuam sem update/delete e Produtos/Fornecedores sem inativação; estes itens permanecem fora de F020–F022.

---

# **2. Features do produto**

> *F008–F019 estão concluídas e seus textos abaixo registram o escopo histórico original. F020–F023 são features aprovadas e deverão manter specs, planos e tasks independentes. Para taxas e pagamentos, as decisões da F020 substituem qualquer premissa anterior incompatível das F015/F019.*
> 

---

## **F008 — Consulta de Estoque (backend)**

- **Objetivo:** Expor, via API agregada, o saldo atual por produto e o histórico de movimentações, sem violar "estoque por movimentações".
- **Escopo exato:** Novo `EstoqueController` consumindo um read repository especializado que agrega `EstoqueMovimentacao` (entradas − saídas) com filtros.
- **O que entra:** `GET /api/estoque` (lista produtos com saldo calculado); `GET /api/estoque/{produtoId}/movimentacoes` (histórico com tipo, quantidade, origem compra/venda, custo, data); query agregada com filtros/limite; DTOs de resposta.
- **O que fica fora:** Ajuste manual de saldo, reserva, multi-depósito, transferências, inventário cíclico.
- **Dependências:** Nenhuma (entidades e `IEstoqueConsultaRepository` já existem).
- **Prioridade:** Alta (fundação para F012 e refinamentos de Produto).
- **Risco técnico:** Baixo. Atenção a performance (agregação no banco, não em memória — Princípio VII).
- **Ordem sugerida:** 1º.
- **Critérios de aceite:** Saldo calculado = entradas − saídas; nenhum campo fixo de saldo introduzido; consulta agregada com filtros; resposta via DTO; controller sem regra de negócio; build/migrations inalteradas (sem nova migration).
- **Impacto:** `src/.../Api/Controllers/EstoqueController.cs` (novo), `Application/Queries` + `Handlers` (novo), `Application/DTOs` (novo), `Infra.Data/Repositories` (read repo especializado), `Infra.IoC/DependencyInjection.cs`.

---

## **F009 — Gestão de Fornecedores (frontend)**

- **Objetivo:** Permitir cadastrar/editar/consultar fornecedores, pré-requisito para Compras.
- **Escopo exato:** Módulo de frontend espelhando o padrão de Produtos (006), consumindo endpoints já existentes; `services/suppliers.ts` já existe.
- **O que entra:** Rotas `/fornecedores`, `/fornecedores/novo`, `/fornecedores/[id]`, `/fornecedores/[id]/editar`; lista com busca local; formulário; estados; item de navegação.
- **O que fica fora:** Histórico de compras por fornecedor, métricas, inativação (backend não tem `inativar` de fornecedor).
- **Dependências:** Nenhuma (backend pronto).
- **Prioridade:** Alta.
- **Risco técnico:** Muito baixo (replica 006).
- **Ordem sugerida:** 2º.
- **Critérios de aceite:** CRUD funcional contra `/api/fornecedores`; responsivo (mobile/tablet/desktop); Dark Only; `lint`/`typecheck`/`build` ok; sem cálculo de regra no frontend.
- **Impacto:** `frontend/src/app/fornecedores/**` (novo), `components/fornecedores/**` (novo), `hooks/use-suppliers.ts` (estender), `services/suppliers.ts`, `types/`, `config/navigation.ts` + `routes.ts`.

---

## **F010 — Implantação Inicial (frontend)**

- **Objetivo:** Tela guiada para semear o sistema com dados reais da Amani: inventário inicial, saldo inicial de caixa e contas a receber iniciais — passo zero para o ERP refletir a realidade.
- **Escopo exato:** Fluxo (wizard/abas) em Configurações consumindo `POST /api/implantacao/*`.
- **O que entra:** Inventário inicial (entrada rastreável de estoque por produto); saldo inicial de caixa; contas a receber iniciais por cliente; confirmação e feedback de resultado.
- **O que fica fora:** Reabertura/edição em massa de implantação, importação de planilha (pós-MVP), recálculo de custo médio no frontend.
- **Dependências:** F009 (fornecedor/produtos) recomendável; produtos e clientes já existem.
- **Prioridade:** Alta (sem dados iniciais, estoque/financeiro não têm valor real).
- **Risco técnico:** Baixo–médio (UX de evitar duplo lançamento de inventário).
- **Ordem sugerida:** 3º.
- **Critérios de aceite:** Inventário inicial gera movimentação de entrada rastreável; caixa e contas iniciais registrados; mensagens de erro do backend exibidas; nenhuma regra recalculada no cliente; responsivo.
- **Impacto:** `frontend/src/app/configuracoes/**` ou `app/implantacao/**` (novo), `components/implantacao/**` (novo), `services/` + `hooks/` + `types/` (novos), navegação.

---

## **F011 — Compras e Recebimentos (frontend)**

- **Objetivo:** Operar o ciclo de compra: registrar compra (mercadoria em trânsito), acompanhar pendências e registrar recebimento parcial e perdas — coração da entrada de estoque.
- **Escopo exato:** Frontend sobre `CompraController` (criar, `em-transito`, `produtos-pendentes`, `recebimentos`, `perdas`, listar).
- **O que entra:** `/compras` (lista + filtros de data/fornecedor), `/compras/nova` (itens, custo unitário, desconto/acréscimo), `/compras/[id]` (detalhe + trânsito), ação de **registrar recebimento** (parcial) e **registrar perda** (motivo Perda/Extravio/Avaria), visão de produtos pendentes.
- **O que fica fora:** Cancelamento de compra (não há endpoint), edição de compra, geração automática de estoque na criação (constitucionalmente proibido — só recebimento gera entrada).
- **Dependências:** F009 (fornecedores). Recebimento alimenta F012 (estoque).
- **Prioridade:** Alta.
- **Risco técnico:** Médio (UX de recebimento parcial; respeitar quantidade pendente; sem recálculo no cliente).
- **Ordem sugerida:** 4º.
- **Critérios de aceite:** Compra criada fica em trânsito sem gerar estoque; recebimento confirmado gera entrada; perda não gera estoque; quantidades validadas pelo backend; erros exibidos; responsivo.
- **Impacto:** `frontend/src/app/compras/**` (substituir placeholder), `components/compras/**` (novo), `services/purchases.ts` + `hooks/use-purchases.ts` + `types/` (novos), navegação.

---

## **F012 — Estoque (frontend)**

- **Objetivo:** Visualizar saldo atual e histórico de movimentações por produto, além de itens pendentes de recebimento.
- **Escopo exato:** Frontend sobre F008 (`/api/estoque`) e `produtos-pendentes`.
- **O que entra:** `/estoque` (lista de produtos com saldo, busca, filtro), detalhe de movimentações por produto (entradas/saídas/origem), aba/visão de pendentes de recebimento.
- **O que fica fora:** Ajuste manual de saldo, transferência, alerta de estoque mínimo (pode entrar via dashboard), edição de movimentações.
- **Dependências:** **F008** (obrigatória), F011 (gera movimentações reais).
- **Prioridade:** Alta.
- **Risco técnico:** Baixo (somente leitura).
- **Ordem sugerida:** 5º (após F008/F011).
- **Critérios de aceite:** Saldo exibido vem do backend (sem cálculo no cliente); histórico mostra origem; estados loading/erro/vazio; responsivo.
- **Impacto:** `frontend/src/app/estoque/**` (substituir placeholder), `components/estoque/**` (novo), `services/stock.ts` + `hooks/` + `types/` (novos).

---

## **F013 — Vendas (frontend)**

- **Objetivo:** Registrar vendas com validação de estoque e visualização de lucro (custo médio), listar e cancelar.
- **Escopo exato:** Frontend sobre `VendasController` (criar, obter, listar, `cancelar`).
- **O que entra:** `/vendas` (lista + filtros data/cliente), `/vendas/nova` (cliente, itens com preço/quantidade/desconto/acréscimo), `/vendas/[id]` (detalhe com lucro retornado pelo backend), ação **cancelar venda**.
- **O que fica fora:** Recálculo de custo médio/lucro no frontend, edição de venda, devolução parcial (pós-MVP), emissão fiscal.
- **Dependências:** Produtos, Clientes (prontos) e estoque com saldo (F010/F011/F012). Lucro/custo médio vêm do backend.
- **Prioridade:** Alta.
- **Risco técnico:** Médio (mensagem de "estoque insuficiente" precisa ser bem exposta; venda exige saldo prévio — daí depender de implantação/compras).
- **Ordem sugerida:** 6º.
- **Critérios de aceite:** Venda gera saída de estoque; bloqueio quando saldo insuficiente (mensagem clara); lucro exibido vem do backend; cancelamento funciona; responsivo.
- **Impacto:** `frontend/src/app/vendas/**` (substituir placeholder), `components/vendas/**` (novo), `services/sales.ts` + `hooks/` + `types/` (novos).

---

## **F014 — Financeiro: Contas a Receber (frontend)**

- **Objetivo:** Gerir recebíveis: criar, listar, registrar pagamentos, ver por cliente, editar e excluir.
- **Escopo exato:** Frontend sobre `ContasReceberController` (completo).
- **O que entra:** `/financeiro/contas-receber` (lista + visão por cliente), criar, registrar pagamento, editar, excluir, detalhe por cliente.
- **O que fica fora:** Contas a pagar (não há entidade), conciliação bancária, juros/multa automáticos.
- **Dependências:** Clientes (pronto). Vendas a prazo idealmente geram recebíveis (verificar acoplamento — atualmente conta a receber é criada manualmente).
- **Prioridade:** Média-alta (gestão).
- **Risco técnico:** Baixo–médio (datas em UTC, como já tratado no controller).
- **Ordem sugerida:** 7º.
- **Critérios de aceite:** CRUD + pagamento funcionais; saldo/valores vêm do backend; histórico preservado (exclusão segue regra do backend); responsivo.
- **Impacto:** `frontend/src/app/financeiro/**` (substituir placeholder), `components/financeiro/**` (novo), `services/receivables.ts` + `hooks/` + `types/` (novos).

---

## **F015 — Formas de Pagamento na Venda + Taxas de Operadora (backend + frontend)**

- **Objetivo:** Integrar a forma de pagamento ao momento da venda, automatizando o roteamento financeiro correto e registrando taxas de operadora de cartão como despesa.
- **Contexto:** Hoje todas as vendas geram uma conta a receber pendente independentemente de como o cliente paga. O operador precisa ir ao módulo Financeiro para registrar o recebimento manualmente. Isso é ineficiente — o dinheiro já entrou, mas o sistema não sabe.
- **Escopo exato — Backend:**
  - Adicionar campo `FormaPagamento` (enum: `Dinheiro`, `PIX`, `CartaoDebito`, `CartaoCredito`, `Fiado`) à entidade `Venda`; migration obrigatória.
  - Nova entidade `ConfiguracaoFormaPagamento` `{ FormaPagamento, PercentualTaxa }` com dados iniciais de taxas padrão de mercado; migration obrigatória.
  - Endpoints `GET /api/configuracoes/formas-pagamento` e `PUT /api/configuracoes/formas-pagamento/{formaPagamento}` para ler e editar taxas; taxa editável também por transação.
  - Modificar `CriarVendaCommandHandler` com roteamento por forma de pagamento:
    - **Dinheiro / PIX** → cria `ContaReceber` e registra pagamento imediatamente (status `Pago`, valor cheio).
    - **Cartão de Débito** → cria `ContaReceber`, registra pagamento imediato com `ValorLiquido = ValorVenda × (1 − TaxaDebito)`; diferença gera registro em `DespesaOperadora`.
    - **Cartão de Crédito** → cria `ContaReceber` pendente (D+1); ao registrar recebimento, usuário informa valor efetivo; diferença gera `DespesaOperadora`.
    - **Fiado** → cria `ContaReceber` pendente sem taxa; valor cheio.
  - Nova entidade `DespesaOperadora` `{ Id, VendaId, FormaPagamento, ValorBruto, ValorLiquido, PercentualTaxa, DataRegistro }`; migration obrigatória.
  - Estender `RegistrarPagamentoCommand` com campo `Desconto` (decimal, opcional, default 0); backend valida `Valor + Desconto <= Saldo`.
  - Endpoint `GET /api/despesas-operadora` para listar com filtros de data/forma.
- **Escopo exato — Frontend:**
  - Modal pós-venda obrigatório: após confirmar venda, modal abre com seleção de forma de pagamento, exibe taxa configurada e valor líquido estimado para cartões; permite override da taxa por transação.
  - Para Dinheiro/PIX/Débito: feedback de "recebido imediatamente"; para Crédito/Fiado: informa que conta a receber foi gerada.
  - Campo de **desconto** no modal de pagamento de Contas a Receber.
  - Tela de configuração de taxas em `/configuracoes/formas-pagamento`.
  - Visão simples de despesas de operadora em `/financeiro/despesas-operadora` (lista com data, forma, valor bruto, taxa, valor líquido).
- **O que fica fora:** Parcelamento de cartão de crédito, split de pagamento (duas formas numa venda), estorno/cancelamento de pagamento com devolução, conciliação bancária automática.
- **Dependências:** F013 (Vendas — front e back prontos), F014 (Contas a Receber — front e back prontos).
- **Prioridade:** Alta (melhoria crítica de UX operacional; elimina passo manual para ~80% das vendas).
- **Risco técnico:** Médio-alto (toca `Venda`, `ContaReceber`, nova entidade de configuração e nova entidade de despesa; 3 migrations; handler de venda muda comportamento).
- **Ordem sugerida:** 8º (próxima feature).
- **Critérios de aceite:** Modal obrigatório pós-venda; Dinheiro/PIX/Débito fecham conta imediatamente; Crédito/Fiado geram conta pendente; taxa calculada pelo backend (sem fórmula no frontend); desconto aceito no pagamento; despesas de operadora registradas e visíveis; taxas configuráveis; `lint`/`typecheck`/`build` ok; migrations sem regressão.
- **Impacto:** Backend: `Domain/Entities` (Venda + FormaPagamento enum + DespesaOperadora + ConfiguracaoFormaPagamento), `Application/Commands|Queries|Handlers|DTOs` (estender + novos), `Infra.Data` (novos repositórios + 3 migrations), `Api/Controllers` (novos endpoints). Frontend: modal pós-venda em `components/vendas/`, campo desconto em `components/financeiro/receivable-payment-modal.tsx`, nova rota `/financeiro/despesas-operadora`, nova rota `/configuracoes/formas-pagamento`.

---

## **F016 — Financeiro: Despesas + Categorias de Despesa (backend + frontend)**

- **Objetivo:** Lançar e listar despesas operacionais por categoria.
- **Escopo exato:** Preencher **G2** no backend (endpoint de `CategoriaDespesa`) + frontend de despesas.
- **O que entra:** Backend: `CategoriasDespesaController` (criar/listar/`GET{id}`/`PUT`). Frontend: `/financeiro/despesas` (lista + filtros data/categoria), criar despesa, gerenciar categorias de despesa.
- **O que fica fora:** Update/delete de despesa (G4) salvo se decidido incluir; rateio, centros de custo, recorrência.
- **Dependências:** Backend G2 precede o frontend. F015 já registra automaticamente despesas de operadora de cartão (entidade `DespesaOperadora` separada).
- **Prioridade:** Média-alta (alimenta o dashboard financeiro).
- **Risco técnico:** Baixo (segue padrão MediatR + Fluent API existente).
- **Ordem sugerida:** 9º.
- **Critérios de aceite:** Criar categoria de despesa e despesa via API; controller sem regra; Fluent API; despesa aparece no dashboard financeiro; responsivo; **nova migration apenas se necessário** (entidade já existe).
- **Impacto:** Backend: `Api/Controllers/CategoriasDespesaController.cs` (novo), `Application/Commands|Queries|Handlers|DTOs` (novos), `Infra.IoC`. Frontend: `app/financeiro/despesas/**`, `components/financeiro/**`, `services/expenses.ts`, `hooks/`, `types/`.

---

## **F017 — Dashboard Gerencial e Financeiro (frontend)**

- **Objetivo:** Substituir o placeholder da home por um painel real (KPIs, rankings, alertas e gráficos) consumindo os endpoints prontos.
- **Escopo exato:** Frontend sobre `dashboard-gerencial` (consolidado/financeiro/operacional/rankings/alertas/graficos) e `dashboard-financeiro`.
- **O que entra:** Home com KPIs (faturamento, lucro, despesas, recebíveis), rankings (top produtos/clientes), alertas, gráficos (séries), filtros de período (mês/ano/intervalo).
- **O que fica fora:** Cálculo de métricas no frontend (proibido — Princípio VI/VII), exportação, drill-down avançado.
- **Dependências:** Dados gerados por F011/F013/F014/F015/F016 para serem significativos.
- **Prioridade:** Média (importante para gestão; depende de dados reais).
- **Risco técnico:** Médio (biblioteca de gráficos — avaliar leve, ex.: Recharts; justificar no plano conforme Princípio XII/Stack).
- **Ordem sugerida:** 10º.
- **Critérios de aceite:** Todos os números vêm do backend; filtros refazem consultas; responsivo; Dark Only; nenhuma fórmula no cliente.
- **Impacto:** `frontend/src/app/page.tsx` + `components/dashboard/**` (substituir placeholders), `services/dashboard.ts` + `hooks/` + `types/` (novos); possível nova dependência de gráfico (justificar).

---

## **F018 — Autenticação e Autorização (backend + frontend)**

- **Objetivo:** Proteger o ERP para uso real (login único/poucos usuários da Amani).
- **Escopo exato:** Autenticação JWT no backend + guarda de rotas/sessão no frontend.
- **O que entra:** Entidade/usuário, login (`POST /api/auth/login`), emissão/validação de token, `[Authorize]` nos controllers, tela de login e proteção de rotas no Next.js, logout.
- **O que fica fora (MVP):** Perfis/permissões granulares, recuperação de senha por e-mail, SSO, multi-tenant (pós-MVP).
- **Dependências:** Transversal; idealmente após os fluxos operacionais existirem.
- **Prioridade:** Média-alta (necessária para "entregável real" em produção).
- **Risco técnico:** Médio-alto (toca toda a stack; cuidado para não vazar invariantes; nova migration de usuário).
- **Ordem sugerida:** 11º.
- **Critérios de aceite:** Endpoints protegidos exigem token; login/logout funcionam; segredos fora do código; frontend redireciona não autenticado; build ok.
- **Impacto:** Backend: novo módulo Auth em `Domain/Application/Infra.Data/Api`, `Program.cs` (middleware), migration de usuário. Frontend: `app/login`, middleware de rota, `services/auth.ts`, `api-client.ts` (header Authorization).

---

## **F019 — Configurações e Categorias (refinamento, frontend)**

- **Status:** Concluída.
- **Objetivo:** Centralizar gestão de apoio: categorias de produto, categorias de despesa, taxas de formas de pagamento e preferências.
- **Escopo exato:** Página Configurações real com CRUD de categorias e gestão de taxas (endpoints prontos em F015 e F016).
- **O que entra:** Gestão de categorias de produto (`/api/categorias`) e de despesa (F016), taxas de operadora por forma de pagamento (F015), atalhos para implantação.
- **O que fica fora:** Temas (Dark é fixo), feature flags, integrações.
- **Dependências:** F015 (taxas de formas de pagamento), F016 (categorias de despesa).
- **Prioridade:** Baixa-média (refinamento).
- **Risco técnico:** Baixo.
- **Ordem sugerida:** 12º.
- **Critérios de aceite histórico:** CRUD de categorias funcional; configurações de taxa disponíveis; responsivo; sem regra financeira calculada no cliente.
- **Débito técnico identificado após conclusão:** a tela expõe edição de taxas para formas que não consomem essa configuração. A correção e a regra vigente estão formalizadas na F020.
- **Impacto:** `frontend/src/app/configuracoes/**` (substituir placeholder), `components/configuracoes/**`, `services/categories.ts` (estender).

---

## **F020 — Consistência de Pagamentos e Revisão de Taxas de Operadora (backend + frontend)**

- **Status:** Aprovada para especificação.
- **Prioridade:** Crítica; deve ser executada antes dos demais refinamentos por corrigir divergência em um fluxo financeiro já disponível aos usuários.
- **Objetivo:** Garantir que o registro de pagamento tenha o mesmo contrato, os mesmos campos e a mesma regra financeira independentemente do caminho de acesso, e tornar a configuração de taxas coerente com o comportamento efetivo do backend.
- **Problema confirmado:** a lista principal de Contas a Receber inclui `FormaPagamento` e abre o fluxo simplificado de Crédito. O detalhe por cliente não inclui esse dado e, por isso, abre o ramo legado do mesmo modal, com desconto, valor bruto liquidado e percentual manual.

### **Decisões de negócio aprovadas**

1. **Somente Cartão de Débito possui taxa configurável.**
2. Dinheiro, PIX e Fiado devem operar com taxa zero e não devem permitir edição de taxa.
3. Cartão de Crédito não usa taxa previamente configurada: a despesa é apurada no recebimento pela diferença entre o valor bruto integral e o valor líquido efetivamente creditado.
4. Pagamento de venda em Cartão de Crédito permite **apenas liquidação integral**; pagamento parcial fica fora do escopo.
5. O fluxo acessado por `Clientes → Ver contas → Pagamento` deve ser idêntico ao fluxo da lista principal de Contas a Receber.
6. Deve existir apenas um componente de pagamento e uma única regra de construção de payload por forma de pagamento.

### **Escopo funcional**

- Incluir `FormaPagamento` no DTO de detalhe da conta por cliente e preencher o valor a partir da venda vinculada.
- Repassar o contexto financeiro completo ao modal compartilhado em todos os pontos de entrada.
- Para Crédito, solicitar apenas o valor líquido recebido, exibir o valor bruto integral e a prévia da despesa de operadora.
- No backend, validar que o bruto liquidado corresponde a todo o saldo restante da conta de Crédito; rejeitar tentativa de liquidação parcial.
- Manter `Desconto = 0` no recebimento de Crédito e calcular a despesa como `saldo bruto integral − valor líquido recebido`.
- Derivar o percentual efetivo da taxa a partir dos valores bruto e líquido; percentual informado pelo frontend não deve ser necessário no fluxo aprovado.
- Para contas manuais ou formas sem operadora, manter pagamento simples com valor e desconto, sem campos de taxa de operadora.
- Exibir somente Débito como taxa editável na Configuração. Crédito deve aparecer, se necessário para compreensão, apenas como informação: “taxa apurada no recebimento”.
- Rejeitar no backend taxa diferente de zero para Dinheiro, PIX, Crédito e Fiado.
- Validar a taxa de Débito no intervalo `0 <= taxa < 100`.
- Normalizar configurações persistidas de formas não editáveis para zero. Como já existe Crédito com valor inicial de 3,49%, prever **migration exclusivamente de dados**, sem alteração de schema, caso a pesquisa da spec confirme banco já migrado em ambientes reais.
- Preservar a geração automática de pagamento e despesa de operadora no Débito.
- Invalidar consultas de contas, detalhe por cliente e despesas de operadora após pagamento bem-sucedido.

### **Fora do escopo**

- Pagamento parcial de Cartão de Crédito.
- Parcelamento de cartão.
- Conciliação bancária automática.
- Estorno de pagamento ou de despesa de operadora.
- Idempotência geral da API de pagamentos, salvo proteção local contra duplo clique já existente.
- Alteração das regras de Dinheiro, PIX, Débito e Fiado na criação da venda além da restrição de configuração de taxa.

### **Arquivos e contratos provavelmente impactados**

- Backend: `ContaReceberDetalheDto`, query/repository de detalhe por cliente, `RegistrarPagamentoCommandHandler`, configuração/handler de formas de pagamento e migration de normalização de dados.
- Frontend: `types/receivable.ts`, `receivable-client-detail.tsx`, `receivable-payment-modal.tsx`, `receivables-list.tsx`, `payment-fees-form.tsx`, hooks de recebíveis e configurações.
- Nenhuma nova entidade é prevista.

### **Riscos e controles**

- **Despesa excessiva por digitação incorreta:** mostrar bruto, líquido e diferença antes da confirmação; backend valida líquido positivo e não superior ao bruto.
- **Saldo residual indevido:** backend exige liquidação integral do bruto para Crédito.
- **Regra divergente entre telas:** todos os pontos de entrada devem fornecer o mesmo contexto e usar o mesmo modal.
- **Configuração sem efeito:** backend e frontend devem impedir taxa configurável fora do Débito.
- **Regressão no Débito:** validar que pagamento líquido imediato e despesa automática continuam transacionais.

### **Critérios mínimos de aceite**

- O mesmo recebível de Crédito apresenta exatamente o mesmo formulário pelos dois caminhos.
- Crédito aceita somente liquidação integral e gera uma despesa igual à diferença bruto − líquido.
- Dinheiro, PIX, Crédito e Fiado não aceitam taxa configurável.
- Débito continua usando a taxa padrão ou override permitido na venda, conforme contrato da F015.
- O histórico e o saldo são atualizados após o pagamento sem refresh manual.
- `dotnet build`, `npm run lint`, `npm run typecheck` e `npm run build` concluídos com sucesso.
- Validação manual dos cinco meios de pagamento e dos dois caminhos de acesso ao recebimento.

---

## **F021 — Cadastros Auxiliares, Fornecedores e Navegação Contextual (backend + frontend)**

- **Status:** Aprovada para especificação após F020.
- **Prioridade:** Alta para produtividade operacional.
- **Objetivo:** Reduzir interrupções nos cadastros de Compra e Produto, substituir identificadores técnicos por informação útil e padronizar o retorno à origem real do usuário.

### **Decisões de negócio aprovadas**

1. Fornecedor passa a possuir **telefone opcional**.
2. GUIDs devem ser removidos das telas operacionais de Fornecedor, Cliente e Produto.
3. Nova Compra deve permitir cadastrar Fornecedor em modal sem abandonar o rascunho.
4. Novo Produto deve permitir cadastrar Categoria e Fornecedor em modais.
5. O botão Voltar deve priorizar a origem interna real, com fallback seguro para a rota pai.
6. Os modais rápidos não substituem as telas oficiais de cadastro.

### **Escopo funcional — Fornecedor e identificadores**

- Adicionar `Telefone` nullable à entidade Fornecedor, DTOs de criação/atualização/consulta, serviço, mapeamento EF e contrato frontend.
- Criar migration de schema com coluna nullable para preservar fornecedores existentes.
- Aplicar trim, tamanho máximo e validação consistente no backend; não exigir unicidade do telefone.
- Incluir telefone nos formulários oficial e rápido.
- Substituir a coluna `Identificador` da listagem por `Telefone`, exibindo “Não informado” quando vazio.
- Remover GUID do cabeçalho e do card de detalhe do Fornecedor.
- Remover GUID dos cabeçalhos de detalhe de Cliente e Produto.
- Substituir fallbacks de GUID abreviado por mensagens operacionais, como “Cliente não encontrado” ou “Referência indisponível”.
- Manter IDs internamente em rotas, keys, payloads e relações; a remoção é apenas da apresentação ao usuário.

### **Escopo funcional — Cadastros rápidos**

- Criar modal compartilhado de Fornecedor, reutilizável em Nova Compra e Novo Produto.
- Criar modal simples de Categoria de Produto com o mesmo contrato de nome já usado em Configurações.
- Após salvar, inserir/atualizar o cache da entidade, atualizar o select e selecionar automaticamente o registro criado.
- Preservar todos os campos já preenchidos no formulário hospedeiro durante abertura, erro, cancelamento e sucesso do modal.
- Manter o formulário de Nova Compra acessível quando ainda não existe fornecedor; ausência de produto continua bloqueando a compra.
- Manter a ação de criar Categoria acessível quando ainda não existe categoria; a ausência inicial não pode esconder o próprio atalho de correção.
- Exibir erros reais retornados pela API dentro do modal.
- Evitar duplicação de validação: campos e normalização devem ser compartilhados com o cadastro oficial quando viável.

### **Escopo funcional — Navegação contextual**

- Criar componente compartilhado de retorno com origem interna e `fallbackHref` obrigatório.
- Registrar apenas caminhos internos do ERP; não permitir retorno fornecido por URL externa.
- Para links controlados entre módulos, aceitar origem explícita validada (`returnTo`) quando necessário.
- Em acesso direto, refresh ou ausência de histórico interno, usar o fallback sem retirar o usuário do ERP.
- Substituir os links fixos “Voltar” nas páginas de criação, edição e detalhe por esse padrão compartilhado.
- Não alterar ações de cancelar dentro de modais, que continuam fechando o modal.

### **Fora do escopo**

- Novos campos de fornecedor além de telefone.
- Inativação ou exclusão de fornecedor.
- Máscara dependente de país ou integração com WhatsApp.
- Cadastro rápido de Produto dentro da Compra.
- Cadastro rápido de Cliente na Venda, reservado para F022.
- Breadcrumbs completos ou redesign da navegação principal.

### **Arquivos e contratos provavelmente impactados**

- Backend: `Fornecedor`, `FornecedorDto`, `CriarFornecedorDto`, `AtualizarFornecedorDto`, `FornecedorService`, `FornecedorMapping` e nova migration.
- Frontend de Fornecedor: tipos, service, hooks, fields, form, tabela e detalhe.
- Compra: `purchase-form.tsx` e estados de referência vazia.
- Produto: página de criação, form, fields, hooks de Categoria/Fornecedor.
- Compartilhados: novos modais de cadastro rápido e componente/hook de navegação contextual.
- Rotas de criação, edição e detalhe que atualmente renderizam links fixos de retorno.

### **Riscos e controles**

- **Migration em dados existentes:** coluna nullable e sem default obrigatório.
- **Select desatualizado:** usar a resposta da mutation para selecionar imediatamente e sincronizar o cache.
- **Perda de rascunho:** modal não deve desmontar o formulário hospedeiro.
- **Retorno para fora do ERP:** somente histórico interno conhecido ou fallback validado.
- **Escopo global de navegação:** migrar e validar rota por rota, mantendo fallback explícito.

### **Critérios mínimos de aceite**

- Fornecedor existente sem telefone continua válido.
- Novo/editar fornecedor persiste e exibe telefone.
- Nenhum GUID de Fornecedor, Cliente ou Produto aparece nas telas operacionais mapeadas.
- Fornecedor criado na Compra fica selecionado sem perder itens ou valores já preenchidos.
- Categoria/Fornecedor criados no Produto ficam selecionados sem perder os demais campos.
- Botão Voltar retorna à origem interna quando disponível e ao fallback em acesso direto.
- `dotnet build`, `npm run lint`, `npm run typecheck` e `npm run build` concluídos com sucesso.
- Validação manual em smartphone, tablet e desktop.

---

## **F022 — Refinamento do Fluxo de Nova Venda (frontend, preservando API existente)**

- **Status:** Aprovada para especificação após F021.
- **Prioridade:** Alta para produtividade e clareza no principal fluxo comercial.
- **Objetivo:** Permitir cadastro rápido de Cliente e substituir múltiplos cards de item por um único compositor, mantendo o resumo como fonte visual dos itens incluídos e preservando cálculos, validações e payload atuais.

### **Decisões de negócio aprovadas**

1. Cadastro rápido de Cliente ocorre em modal dentro da Nova Venda.
2. O editor de item deve ser único e limpo após cada inclusão.
3. Produto já incluído deve ser **bloqueado**, não consolidado automaticamente.
4. Itens incluídos devem aparecer no resumo com nome e valor e permanecer editáveis/removíveis.
5. O contrato de criação de Venda e a validação oficial de estoque continuam no backend.

### **Escopo funcional — Cliente**

- Substituir o link para `/clientes/novo` em outra aba por ação “Cadastrar cliente” em modal.
- Reutilizar o contrato oficial: nome obrigatório, email e telefone opcionais.
- Atualizar cache/lista após criação e selecionar automaticamente o novo Cliente.
- Preservar data, ajustes gerais, itens e qualquer outro rascunho da venda.
- Manter a tela oficial de Cliente disponível na navegação normal.

### **Escopo funcional — Compositor de item**

- Separar estado do item em edição do array de itens confirmados.
- Renderizar um único formulário com Produto, Quantidade, Preço Unitário, Desconto e Acréscimo.
- Preencher o preço padrão ao selecionar o Produto, preservando a possibilidade de edição permitida atualmente.
- Validar o item isoladamente antes de incluí-lo.
- Ao clicar em “Incluir item”, adicionar o item ao resumo e reiniciar o editor com valores iniciais.
- Se o Produto já estiver no resumo, bloquear a inclusão e orientar o usuário a editar o item existente.
- Não executar a consolidação atual que soma quantidade e pode descartar preço/desconto/acréscimo.
- Permitir editar um item já incluído carregando-o de volta no compositor ou por interação equivalente claramente definida na spec.
- Permitir remover item do resumo com feedback imediato.

### **Escopo funcional — Resumo e envio**

- Exibir por item: nome do Produto, quantidade, preço unitário e valor líquido do item.
- Manter subtotal, desconto geral, acréscimo geral e total preenchido.
- Calcular no frontend somente a prévia visual já existente; backend permanece fonte oficial do total, estoque, custo médio e lucro.
- Validar a Venda somente com os itens confirmados; conteúdo incompleto no compositor não deve ser enviado silenciosamente.
- Preservar o payload de `CriarVendaDto` e o modal financeiro pós-venda.
- Manter mensagem consultiva de estoque no frontend e validação definitiva no backend.
- Após sucesso, limpar cliente, rascunho, compositor e resumo conforme comportamento atual.

### **Fora do escopo**

- Alterar regras de estoque, custo médio, lucro ou movimentações.
- Split de pagamento, parcelamento ou múltiplas formas na mesma venda.
- Produtos repetidos com preços diferentes.
- Edição da Venda após confirmação.
- Cadastro rápido de Produto durante a Venda.
- Alteração de contratos ou migrations no backend, salvo gap descoberto e aprovado durante a especificação.

### **Arquivos e contratos provavelmente impactados**

- `sale-form.tsx`, `sale-item-editor.tsx`, `sale-summary.tsx`, `sale-validation.ts` e tipos de draft da Venda.
- Hooks e componentes de Cliente para o modal rápido.
- Possível extração de componentes `quick-customer-dialog`, `sale-item-composer` e `sale-items-summary`.
- Services e endpoints de Venda não devem mudar no cenário aprovado.

### **Riscos e controles**

- **Divergência entre item em edição e itens confirmados:** estados separados e envio restrito ao resumo.
- **Perda de ajustes ao editar:** edição deve substituir explicitamente o item, nunca consolidar parcialmente.
- **Produto duplicado:** bloqueio antes de inserir no array.
- **Cálculo visual divergente:** reutilizar as mesmas funções puras de prévia e tratar o backend como resultado oficial.
- **Regressão no pagamento:** modal financeiro é aberto somente após validação completa do novo draft.
- **Estoque desatualizado:** alerta consultivo no frontend; rejeição oficial continua na API.

### **Critérios mínimos de aceite**

- Cliente criado no modal fica selecionado e o rascunho permanece intacto.
- Existe somente um editor de item visível.
- “Incluir item” valida, adiciona ao resumo e limpa o editor.
- Produto duplicado é bloqueado com mensagem clara.
- Resumo mostra nome, quantidade, preço e valor de cada item e permite editar/remover.
- Payload final contém exatamente os itens confirmados e mantém o contrato atual.
- Venda com estoque insuficiente continua sendo rejeitada pela API com mensagem compreensível.
- Fluxos de Dinheiro, PIX, Débito, Crédito e Fiado continuam acessíveis após montar a venda.
- `npm run lint`, `npm run typecheck` e `npm run build` concluídos com sucesso.
- Validação manual em smartphone, tablet e desktop.

---

## **Diretriz de testes aprovada para F020–F022**

- Não adicionar framework, dependência, projeto ou infraestrutura nova de testes automatizados nesta sequência de features.
- Não criar suíte Vitest, React Testing Library, Playwright ou projeto xUnit como parte de F020–F022.
- A validação obrigatória será composta por builds, lint, typecheck e roteiros manuais detalhados nas respectivas `quickstart.md`.
- A ausência de infraestrutura automatizada deve ser registrada nas specs e nos planos como decisão explícita, sem bloquear a implementação aprovada.
- Testes automatizados poderão ser propostos novamente em feature futura, mediante nova autorização.

---

## **F023 — Revisão do Dashboard Gerencial (backend + frontend)**

- **Status:** Especificação criada em 30/06/2026; pronta para planejamento.
- **Prioridade:** Alta para confiabilidade da gestão financeira e patrimonial.
- **Objetivo:** Evoluir o Dashboard existente, sem reescrita, para distinguir faturamento, entradas, saídas estimadas, lucro e caixa e para apresentar recebíveis, estoque valorizado e valor realista/potencial da operação.
- **Documento-base:** `docs/dashboard/relatorio-revisao-dashboard-gerencial.md`.

### **Decisões de negócio aprovadas**

1. Faturamento usa vendas por competência; entradas usam exclusivamente pagamentos efetivamente recebidos.
2. Saídas são a soma estimada de compras não canceladas e despesas registradas enquanto não houver contas a pagar.
3. Caixa final é caixa inicial acumulado mais entradas menos saídas do período.
4. O Dashboard mantém custo médio conservador, sem fallback para custo cadastral.
5. Mercadorias em trânsito não integram estoque disponível nem sua valorização.
6. Contratos e indicadores existentes evoluem por adição, sem remoções incompatíveis.
7. Despesas de operadora ficam fora das saídas até decisão financeira específica.

### **Escopo funcional**

- Destacar faturamento, entradas, saídas estimadas, caixa inicial/final e lucro bruto.
- Separar recebíveis vencidos e a vencer, preservando a posição total até a data de referência.
- Valorizar estoque disponível ao custo médio e ao preço de venda atual e apresentar lucro potencial.
- Apresentar valor total realista e potencial da operação.
- Manter cálculos gerenciais centralizados no backend e consultas agregadas.
- Reorganizar os indicadores para leitura Mobile First, reduzir alertas a um resumo e retirar rankings de maior/menor estoque da home.
- Substituir mensagens técnicas de gráficos vazios por mensagens operacionais.

### **Fora do escopo**

- Contas a pagar e fluxo de caixa baseado em pagamentos reais de compras.
- Inclusão de despesas de operadora nas saídas.
- Custo histórico congelado por item vendido e correção retroativa da divergência de lucro.
- Remoção de endpoints legados, novo gráfico Entradas versus Saídas, tela dedicada de alertas, exportação e drill-down.

### **Critérios mínimos de aceite**

- Indicadores financeiros conferem com as regras oficiais sem dupla contagem.
- Recebíveis vencidos mais a vencer recompõem o total em aberto.
- Estoque em trânsito e produtos sem custo calculável não inflam o valor ao custo.
- Valor realista usa estoque ao custo; valor potencial usa preço de venda atual.
- Rótulos distinguem competência, caixa, estimativa, snapshot e potencial.
- Falha ou vazio de uma seção não derruba as demais.
- Validação funcional em smartphone, tablet e desktop.

---

## **F024 — Apresentações Comerciais e Conversão Fracionada de Estoque**

- **Status:** Em implementação; projeto e tarefas de testes automatizados removidos por decisão explícita. Rollout condicionado aos gates manuais.
- **Prioridade:** Alta para operação de vendas e integridade de estoque em produção.
- **Problema de negócio:** Produtos comprados na unidade principal, como caixa, precisam ser vendidos como caixa, ampola ou dose sem criar produtos separados nem converter o histórico existente.
- **Decisão técnica:** Representar cada conversão por `FatorNumerador/FatorDenominador` e preservar a razão exata no snapshot da venda e na movimentação. Decimal calculado é projeção; não é a única fonte de saldo.
- **Documento-base:** `specs/024-apresentacoes-fracionadas/impact-analysis.md`.

### **Escopo incluído**

- Cadastro opt-in de apresentações por produto, com Caixa 1/1, Ampola 1/4 e Dose 1/24 como exemplo oficial.
- Venda por apresentação, snapshot imutável e saída convertida na unidade principal.
- Agregação, validação, cancelamento e conciliação por razão exata, inclusive entre operações separadas.
- Custo médio e lucro proporcionais à quantidade exata.
- Compatibilidade de produtos, vendas e movimentações legadas sem backfill.
- Adequação de estoque, listagens, relatórios e dashboard para quantidades equivalentes na unidade principal.

### **Fora desta versão**

- Caixa lacrada versus aberta e rastreio físico de embalagem.
- Compra, recebimento ou perda por apresentação.
- Conversão do estoque antigo para dose.
- Produtos separados por apresentação.
- Alteração ou recálculo de movimentações antigas.

### **Riscos e controles**

- **Resíduo decimal:** razão exata autoritativa; projeção decimal apenas para contrato/exibição.
- **Migration em produção:** colunas nullable, nenhum DML histórico e ensaio da ampliação de quantidade antes do rollout.
- **Rollback após venda fracionada:** desligamento lógico com schema mantido; não executar `Down` nem retornar a binário que suponha inteiro.
- **Regressão gerencial:** métricas de quantidade usam equivalente na unidade principal e passam por conciliação com legado.

### **Critérios mínimos de aceite**

- 4 vendas separadas de 1 ampola em 1/4 e 24 vendas separadas de 1 dose em 1/24 equivalem exatamente a 1 caixa.
- Vender e cancelar a mesma razão restaura exatamente o saldo anterior.
- Produto sem apresentações mantém compra, venda, saldo, custo e lucro anteriores.
- Nenhuma linha histórica é atualizada, convertida ou recalculada.
- Custo, lucro, dashboard e relatórios conciliam dados legados e fracionados.
- Migration e rollback lógico são ensaiados em cópia representativa de produção.

---

# **3. Roadmap recomendado por fases**

### **Fase 1 — Operação ponta a ponta (concluída)**

F008 Consulta de Estoque · F009 Fornecedores · F010 Implantação Inicial · F011 Compras e Recebimentos · F012 Estoque · F013 Vendas.

### **Fase 2 — Gestão e preparação para uso real (concluída)**

F014 Contas a Receber · F015 Formas de Pagamento e Taxas · F016 Despesas e Categorias · F017 Dashboard Gerencial/Financeiro · F018 Autenticação e Autorização.

### **Fase 3 — Configuração e refinamento inicial (F019 concluída)**

F019 centralizou Categorias de Produto, Categorias de Despesa, Taxas de Operadora e atalhos de Implantação na página de Configurações.

### **Fase 4 — Correção e refinamento operacional aprovado (próxima)**

Ordem obrigatória para reduzir risco e facilitar validação:

1. **F020 — Consistência de Pagamentos e Revisão de Taxas de Operadora**
   - Motivo da precedência: corrige comportamento financeiro divergente já exposto ao usuário.
   - Gate de saída: Crédito consistente nos dois caminhos, apenas Débito configurável e liquidação integral validada pelo backend.
2. **F021 — Cadastros Auxiliares, Fornecedores e Navegação Contextual**
   - Motivo da posição: cria componentes e padrões reutilizáveis sem alterar o contrato de Venda.
   - Gate de saída: telefone opcional migrado, GUIDs removidos, modais de Compra/Produto funcionais e retorno contextual padronizado.
3. **F022 — Refinamento do Fluxo de Nova Venda**
   - Motivo da posição: altera o componente de maior interação somente depois da estabilização financeira e dos padrões de cadastro rápido.
   - Gate de saída: Cliente rápido, compositor único, duplicidade bloqueada, resumo editável e payload preservado.

### **Fase 5 — Evolução gerencial aprovada**

1. **F023 — Revisão do Dashboard Gerencial**
   - Motivo da posição: consolida regras financeiras e patrimoniais sobre os fluxos operacionais e financeiros já existentes.
   - Gate de saída: indicadores conciliados, estoque valorizado sem trânsito, recebíveis segmentados, contratos compatíveis e experiência responsiva validada.

### **Fase 6 — Evolução operacional planejada/em análise**

1. **F024 — Apresentações Comerciais e Conversão Fracionada de Estoque**
   - Motivo da posição: resolve venda fracionada sem reescrever estoque produtivo e exige gate técnico específico de precisão/migration.
   - Gate de saída: razão exata validada, legado conciliado, rollback ensaiado e autorização explícita de implementação.

### **Fase 7 — Backlog pós-refinamento (não aprovado para execução nesta decisão)**

- Detalhe de Produto exibindo saldo e custo médio.
- Paginação e busca server-side nas listas.
- Update/delete de Despesas e inativação de Produto/Fornecedor.
- Relatórios exportáveis e drill-down.
- Contas a pagar e fluxo de caixa projetado.
- Parcelamento de Cartão de Crédito.
- Estorno/cancelamento de pagamento e conciliação bancária.
- Perfis e permissões granulares.
- Integrações com marketplaces e emissão fiscal.
- Devolução de Venda, multi-depósito e estoque mínimo.
- PWA/offline.
- Infraestrutura de testes automatizados, somente mediante nova autorização.

---

## **Observações de conformidade**

- **F020–F022 são features independentes:** cada uma deve possuir diretório Spec Kit próprio, spec, plan, research/data-model/contracts quando aplicáveis, tasks e quickstart.
- **Não agrupar as três em uma única feature:** a separação isola correção financeira, infraestrutura de UX/cadastros e refatoração da Venda.
- **Backend como fonte oficial:** taxa, liquidação, despesa de operadora, estoque, custo médio, lucro e validações críticas permanecem no backend.
- **Estoque por movimentações preservado:** nenhuma feature aprovada altera saldo fixo, custo médio ou geração de movimentações.
- **Migrations controladas:** F020 pode exigir migration somente de dados para zerar taxas não aplicáveis; F021 exige migration de schema nullable para telefone de Fornecedor; F022 não prevê migration.
- **Compatibilidade:** contratos existentes devem ser estendidos de forma retrocompatível quando possível. Alterações incompatíveis exigem justificativa explícita no plano.
- **Mobile First e Dark Theme:** todos os modais, resumos, tabelas e estados devem ser validados nos breakpoints já adotados.
- **Testes:** por decisão do responsável em 26/06/2026, não será adicionada infraestrutura automatizada em F020–F022; builds e roteiros manuais completos são obrigatórios.
- **F023 independente:** a revisão do Dashboard possui diretório Spec Kit próprio e não deve ser incorporada retroativamente à F017.
- **Analytics da F023:** indicadores devem ser calculados no backend por consultas agregadas; o frontend apenas apresenta resultados.
- **F024 planejada, não autorizada:** nenhuma implementação começa antes da aprovação explícita do relatório técnico, plano, tasks e estratégia de rollout.
- **Precisão da F024:** numerador/denominador são autoritativos; valores decimais são projeções e não podem decidir saldo isoladamente.

---

# **4. Registro da decisão de 26/06/2026**

Decisões aprovadas para orientar diretamente as próximas especificações:

| **Tema** | **Decisão aprovada** | **Feature** |
| --- | --- | --- |
| Organização | Dividir o trabalho em três features independentes | F020–F022 |
| Telefone do Fornecedor | Campo opcional | F021 |
| GUIDs na interface | Remover de Fornecedor, Cliente e Produto | F021 |
| Produto duplicado na Venda | Bloquear inclusão duplicada | F022 |
| Crédito em Contas a Receber | Somente liquidação integral | F020 |
| Taxa configurável | Somente Cartão de Débito | F020 |
| Infraestrutura automatizada de testes | Não autorizada para estas features | F020–F022 |

## **Registro da decisão de 30/06/2026**

| **Tema** | **Decisão aprovada** | **Feature** |
| --- | --- | --- |
| Dashboard | Evoluir por adição, sem reescrita ou quebra de contratos | F023 |
| Entradas | Usar exclusivamente pagamentos recebidos por data de pagamento | F023 |
| Saídas | Compras e despesas registradas, explicitamente como estimativa | F023 |
| Estoque valorizado | Excluir trânsito e não presumir custo ausente | F023 |
| Valor da operação | Exibir visões realista ao custo e potencial ao preço de venda | F023 |
| Despesas de operadora | Manter fora das saídas até validação financeira específica | F023 |

## **Registro da decisão de precisão da F024 em 30/06/2026**

| **Tema** | **Decisão aprovada para planejamento** | **Feature** |
| --- | --- | --- |
| Conversão | Persistir numerador e denominador positivos, com fator ≤ 1 | F024 |
| Exatidão | Razão exata é fonte de saldo, cancelamento e conciliação | F024 |
| Snapshot | Preservar apresentação, numerador, denominador, fator calculado e quantidade convertida | F024 |
| Legado | Interpretar quantidade histórica como denominador 1, sem backfill | F024 |
| Compra | Manter compra, recebimento e perda na unidade principal | F024 |
| Rollback | Desabilitar logicamente e manter schema após a primeira venda fracionada | F024 |

## **Próximo passo previsto**

A documentação da **F024 — Apresentações Comerciais e Conversão Fracionada de Estoque** está em análise com representação racional definida. O próximo passo é revisar `spec.md`, `impact-analysis.md`, `plan.md` e `tasks.md`. Nenhuma implementação da F024 deve começar sem autorização explícita posterior a essa revisão.
