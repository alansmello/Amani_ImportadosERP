<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- Template principle 1 -> I. Arquitetura e Separacao de Responsabilidades
- Template principle 2 -> II. Estoque por Movimentacoes
- Template principle 3 -> III. Compras, Vendas, Custos e Lucro
- Template principle 4 -> IV. Contratos de API e DTOs
- Template principle 5 -> V. Persistencia, Historico e Mapeamentos
Added sections:
- Stack Oficial
- Fluxo de Desenvolvimento
- VI. Backend como Fonte das Regras de Negocio
- VII. Simplicidade Antes de Sofisticacao
Removed sections:
- Placeholder section 2
- Placeholder section 3
Templates requiring updates:
- pending: .specify/templates/plan-template.md (Constitution Check remains generic)
- pending: .specify/templates/spec-template.md (does not yet require ERP-specific constraints)
- pending: .specify/templates/tasks-template.md (does not yet enforce ERP-specific task categories)
- not present: .specify/templates/commands/*.md
Hook status:
- pending: before_constitution speckit.git.initialize blocked by Git dubious ownership
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

Estoque MUST ser controlado exclusivamente por movimentacoes. O sistema MUST NOT
ter campo fixo de saldo de estoque em Produto ou em qualquer outra entidade de
cadastro. O saldo disponivel MUST ser calculado por entradas menos saidas, usando
o historico de EstoqueMovimentacao.

Rationale: estoque por historico preserva rastreabilidade, auditoria e evita
ajustes silenciosos de saldo.

### III. Compras, Vendas, Custos e Lucro

Toda compra registrada MUST gerar entrada de estoque para cada item comprado.
Toda venda registrada MUST gerar saida de estoque para cada item vendido. Vendas
MUST validar estoque disponivel antes da confirmacao. Lucro MUST ser calculado
com custo medio do produto, derivado das entradas historicas, e nao por valor
manual isolado.

Rationale: compras e vendas sao os eventos operacionais que alteram estoque,
custo e lucratividade.

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
operacional MUST NOT ser perdido: compras, vendas, movimentacoes de estoque,
despesas, pagamentos e eventos relevantes MUST ser preservados ou compensados
por novos registros, nunca apagados como forma de corrigir estado operacional.

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
estoque por movimentacoes, DTOs, ausencia de regra de negocio em controllers,
Fluent API, Repository Pattern e preservacao de historico operacional.

Tarefas futuras MUST separar trabalho de Domain, Application, Infra.Data, API e
Frontend quando a funcionalidade atravessar essas camadas. Mudancas que afetem
compras, vendas, estoque, custo medio, lucro ou financeiro MUST incluir cenarios
de validacao para os fluxos operacionais afetados.

## Governance

Esta Constituicao prevalece sobre especificacoes, planos, tarefas e decisoes
tecnicas conflitantes. Em caso de conflito, a especificacao ou plano MUST ser
ajustado antes da implementacao.

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

**Version**: 1.0.0 | **Ratified**: 2026-06-04 | **Last Amended**: 2026-06-04
