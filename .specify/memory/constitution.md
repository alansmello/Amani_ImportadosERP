<!--
Sync Impact Report
Version change: 1.0.0 -> 2.0.0
Modified principles:
- III. Compras, Vendas, Custos e Lucro -> III. Compras, Recebimentos, Vendas, Custos e Lucro
Added sections:
- None
Removed sections:
- None
Templates requiring updates:
- updated: .specify/templates/plan-template.md (Constitution Check now lists ERP-specific gates, including purchases in transit)
- reviewed: .specify/templates/spec-template.md (no change required; requirements/scenarios already capture feature-specific constraints)
- updated: .specify/templates/tasks-template.md (tasks now require constitution-driven validation tasks)
- not present: .specify/templates/commands/*.md
Runtime guidance requiring updates:
- reviewed: README.md (no outdated purchase/stock rule found)
- reviewed: AGENTS.md (points to current Spec Kit plan only; no constitutional rule duplicated)
Governance change:
- Feature 003 changes the previous purchase rule: purchase registration no longer creates stock entry automatically.
Follow-up TODOs:
- None
-->

# Amani ERP Constitution

## Core Principles

### I. Arquitetura e Separacao de Responsabilidades

O Amani ERP MUST seguir Clean Architecture com separacao clara entre API,
Application, Domain, Infra.Data e Infra.IoC. Controllers MUST NOT conter regra de
negocio; eles apenas recebem requisicoes, validam contratos basicos, delegam para
a camada Application e retornam respostas. Regras de negocio MUST ficar no
Backend, principalmente nas camadas Application e Domain.

Rationale: o ERP precisa crescer sem acoplamento entre interface, persistencia e
regras operacionais.

### II. Estoque por Movimentacoes

Estoque MUST ser controlado exclusivamente por movimentacoes historicas. O
sistema MUST NOT ter campo fixo de saldo de estoque em Produto, Item de Compra
ou qualquer outra entidade de cadastro ou operacao. O saldo disponivel MUST ser
calculado por entradas menos saidas, usando o historico de movimentacoes de
estoque.

Inventario inicial MUST ser registrado como movimentacao valida de entrada com
origem rastreavel. Recebimentos fisicos confirmados de compras MUST gerar
movimentacoes de entrada. Vendas confirmadas MUST gerar movimentacoes de saida.
Perdas, extravios e avarias MUST NOT gerar entrada de estoque.

Rationale: estoque por historico preserva rastreabilidade, auditoria e evita
ajustes silenciosos de saldo.

### III. Compras, Recebimentos, Vendas, Custos e Lucro

Compra registrada MUST NOT gerar entrada automatica de estoque. Compra registra a
intencao ou aquisicao comercial de produtos, e seus itens MUST permanecer como
mercadorias em transito ate que haja confirmacao de recebimento fisico.

Recebimento de compra MUST ser registrado por item de compra e MAY ser parcial.
Somente a quantidade fisicamente recebida e confirmada MUST gerar movimentacao de
entrada de estoque. Perdas, extravios e avarias de itens comprados MUST ser
rastreaveis como prejuizo operacional e MUST NOT gerar estoque.

Toda venda registrada MUST gerar saida de estoque para cada item vendido. Vendas
MUST validar estoque fisicamente disponivel antes da confirmacao. Lucro MUST ser
calculado com custo medio do produto, derivado apenas de entradas reais em
estoque, incluindo inventario inicial e recebimentos fisicos confirmados, e nao
por valor manual isolado.

Rationale: compras representam aquisicao comercial, recebimentos representam
entrada fisica, vendas representam saida fisica, e custo medio so e confiavel
quando deriva de entradas reais e rastreaveis.

### IV. Contratos de API e DTOs

DTOs MUST ser usados para entrada e saida de dados em APIs e casos de uso.
Entidades de dominio MUST NOT ser expostas como contrato externo quando houver
risco de acoplamento ou vazamento de invariantes. AutoMapper MUST NOT ser usado;
mapeamentos MUST ser explicitos para manter clareza e controle sobre os dados.

Rationale: contratos explicitos reduzem ambiguidade e tornam as regras de
entrada e saida verificaveis.

### V. Persistencia, Historico e Mapeamentos

Entity Framework Core MUST usar Fluent API para mapeamentos. Repository Pattern
MUST mediar o acesso a dados entre Application e Infra.Data. Historico
operacional MUST NOT ser perdido: compras, recebimentos, perdas, vendas,
movimentacoes de estoque, despesas, pagamentos e eventos relevantes MUST ser
preservados ou compensados por novos registros, nunca apagados como forma de
corrigir estado operacional.

Rationale: o ERP depende de trilha historica para auditoria, custo medio,
financeiro e dashboards confiaveis.

### VI. Backend como Fonte das Regras de Negocio

O backend MUST centralizar todas as regras de negocio, validacoes operacionais,
calculos de estoque, custo medio, lucro e consistencia financeira. Frontend
React/Next.js MAY validar formularios para melhorar a experiencia do usuario,
mas MUST NOT ser a fonte de verdade para regras do ERP.

Rationale: regras no backend mantem consistencia entre API, frontend e futuras
integracoes com marketplaces.

### VII. Simplicidade Antes de Sofisticacao

Solucoes MUST priorizar simplicidade, legibilidade e manutencao antes de
sofisticacao tecnica. Novas abstracoes, padroes ou dependencias MUST existir
apenas quando resolverem complexidade real ou protegerem uma regra importante do
ERP. Funcionalidades futuras MUST NOT antecipar complexidade que nao seja
necessaria para o fluxo atual.

Rationale: o projeto deve evoluir para ERP completo sem perder clareza nem
velocidade de entrega.

## Stack Oficial

O backend oficial MUST usar .NET 8, ASP.NET Core, Entity Framework Core e
PostgreSQL. O frontend oficial MUST usar React e Next.js. A arquitetura oficial
MUST seguir Clean Architecture, DDD Lite e Repository Pattern.

Qualquer tecnologia adicional MUST ser justificada no plano da funcionalidade,
incluindo o problema resolvido, alternativas consideradas e impacto sobre
manutencao.

## Fluxo de Desenvolvimento

Toda nova especificacao MUST declarar como preserva os principios desta
Constituicao. Planos de implementacao MUST incluir uma verificacao explicita para
estoque por movimentacoes, mercadorias em transito quando compras forem afetadas,
inventario inicial quando saldo inicial for afetado, vendas com validacao de
estoque fisico, custo medio por entradas reais, DTOs, ausencia de regra de
negocio em controllers, Fluent API, Repository Pattern e preservacao de
historico operacional.

Tarefas futuras MUST separar trabalho de Domain, Application, Infra.Data, API e
Frontend quando a funcionalidade atravessar essas camadas. Mudancas que afetem
compras, recebimentos, perdas, vendas, estoque, custo medio, lucro ou financeiro
MUST incluir cenarios de validacao para os fluxos operacionais afetados.

## Governance

Esta Constituicao prevalece sobre especificacoes, planos, tarefas e decisoes
tecnicas conflitantes. Em caso de conflito, a especificacao ou plano MUST ser
ajustado antes da implementacao.

A versao 2.0.0 registra uma mudanca de governanca da regra anterior de compras:
compra registrada deixou de ser evento automatico de entrada de estoque. A regra
constitucional vigente e que compra cria mercadoria em transito, e somente
recebimento fisico confirmado cria entrada de estoque.

Alteracoes nesta Constituicao MUST ser documentadas com:

- motivo da alteracao;
- impacto nos principios existentes;
- impacto nos templates Spec Kit;
- versao nova conforme semver;
- data de alteracao em formato ISO 8601.

Versionamento:

- MAJOR: remocao ou redefinicao incompatavel de principio obrigatorio;
- MINOR: novo principio, nova secao obrigatoria ou expansao material de regra;
- PATCH: ajustes de texto, clarificacoes ou correcoes sem mudanca semantica.

Toda revisao de funcionalidade MUST verificar conformidade com esta Constituicao.
Violacoes so podem ser aceitas quando documentadas no plano com justificativa,
alternativa mais simples rejeitada e risco operacional conhecido.

**Version**: 2.0.0 | **Ratified**: 2026-06-04 | **Last Amended**: 2026-06-07
