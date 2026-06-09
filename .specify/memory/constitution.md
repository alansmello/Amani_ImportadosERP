<!--
Sync Impact Report
Version change: 2.0.0 -> 2.1.0
Modified principles:
- VI. Backend como Fonte das Regras de Negocio -> VI. Backend como Fonte das Regras de Negocio
- VII. Simplicidade Antes de Sofisticacao -> XII. Simplicidade Antes de Sofisticacao
Added sections:
- VII. Analytics e Escalabilidade
- VIII. Mobile First
- IX. Experiencia Operacional
- X. Priorizacao do Produto
- XI. Identidade Visual
Removed sections:
- None
Templates requiring updates:
- updated: .specify/templates/plan-template.md (Constitution Check includes analytics, mobile, UX, product priority, and visual identity gates)
- updated: .specify/templates/spec-template.md (assumptions now preserve Mobile First instead of treating mobile as optional by default)
- updated: .specify/templates/tasks-template.md (foundational and regression tasks include analytics, mobile, UX, priority, and design-system validation)
- not present: .specify/templates/commands/*.md
Runtime guidance requiring updates:
- reviewed: README.md (no constitutional rule duplicated; no change required)
- reviewed: AGENTS.md (points to current Spec Kit plan only; no change required)
Governance change:
- Minor version bump because new principles and mandatory planning checks were added without removing or redefining existing principles incompatibly.
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
calculos de estoque, custo medio, lucro e consistencia financeira. Formulas
gerenciais, rankings, indicadores, alertas, metricas e calculos de dashboards
MUST pertencer ao backend.

Dashboards, frontends, aplicacoes moveis e futuras integracoes MUST consumir os
resultados calculados pelo backend. Frontend React/Next.js MAY validar
formularios para melhorar a experiencia do usuario, mas MUST NOT recalcular
metricas criticas do ERP nem ser a fonte de verdade para regras gerenciais.

Rationale: regras no backend mantem consistencia entre Dashboard, API, frontend,
aplicacoes moveis e futuras integracoes com marketplaces.

### VII. Analytics e Escalabilidade

Dashboards e relatorios MUST utilizar consultas agregadas sempre que a informacao
puder ser calculada na persistencia ou em consultas especializadas. Dashboards
MUST usar repositories especializados de leitura quando cruzarem historico,
rankings, series temporais, alertas ou metricas consolidadas.

Metricas MUST NOT depender do carregamento integral do historico operacional ou
financeiro em memoria. Solucoes analiticas MUST privilegiar escalabilidade desde
o inicio, usando filtros, limites, agregacoes e contratos de resposta adequados
ao volume de dados esperado.

Rationale: relatorios e dashboards crescem com o negocio; consultas agregadas
evitam degradacao de performance e preservam a operacao diaria do ERP.

### VIII. Mobile First

O frontend oficial MUST ser concebido com abordagem Mobile First. Toda
funcionalidade de interface MUST funcionar adequadamente em smartphone, tablet e
desktop, respeitando responsividade como requisito obrigatorio.

A experiencia mobile MUST ser tratada como critica para a operacao do negocio,
especialmente em viagens, compras, vendas e acompanhamento operacional. Planos
de frontend MUST declarar como a funcionalidade sera validada em telas moveis e
desktop.

Rationale: os usuarios principais operam o ERP frequentemente fora de uma mesa de
trabalho, e a interface precisa sustentar esse fluxo real.

### IX. Experiencia Operacional

O sistema MUST priorizar rapidez operacional em fluxos de uso frequente.
Funcionalidades recorrentes MUST exigir o menor numero razoavel de interacoes,
sem sacrificar validacoes obrigatorias, rastreabilidade ou seguranca dos dados.

Simplicidade operacional MUST prevalecer sobre complexidade visual. Telas,
formularios e dashboards MUST ser otimizados para uso diario, leitura rapida,
decisao objetiva e continuidade do trabalho.

Rationale: o ERP existe para acelerar a operacao diaria; interfaces lentas ou
visualmente complexas reduzem confiabilidade e adesao.

### X. Priorizacao do Produto

Funcionalidades operacionais MUST ter prioridade sobre funcionalidades
analiticas, integracoes externas e recursos avancados quando houver conflito de
escopo, prazo ou capacidade. O sistema MUST buscar utilizacao em producao o mais
cedo possivel, preservando os principios constitucionais.

A priorizacao futura MUST favorecer compras, recebimentos, estoque, vendas e
controle financeiro antes de recursos avancados. Recursos analiticos,
integracoes e automacoes SHOULD ser planejados quando reforcarem esses fluxos ou
quando os fluxos operacionais essenciais ja estiverem utilizaveis.

Rationale: o valor inicial do ERP depende de operar o negocio com seguranca antes
de ampliar sofisticacao analitica ou integracoes.

### XI. Identidade Visual

O Amani ERP MUST possuir uma identidade visual oficial para o frontend. O
frontend MUST seguir um Design System unico e consistente entre telas,
componentes, estados, responsividade e interacoes.

O Dark Theme MUST ser a identidade visual principal. A experiencia visual MUST
transmitir imagem de SaaS moderno, profissional e premium. Codigos de cor,
tokens e detalhes visuais especificos MUST ficar no Design System oficial, nao
nesta Constituicao.

Rationale: uma identidade consistente aumenta confianca, reduz retrabalho e
mantem o produto coeso conforme novas telas forem adicionadas.

### XII. Simplicidade Antes de Sofisticacao

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
negocio em controllers, Fluent API, Repository Pattern, preservacao de historico
operacional, backend como fonte de metricas criticas, analytics por consultas
agregadas, Mobile First, experiencia operacional, priorizacao de produto,
identidade visual e simplicidade.

Tarefas futuras MUST separar trabalho de Domain, Application, Infra.Data, API e
Frontend quando a funcionalidade atravessar essas camadas. Mudancas que afetem
compras, recebimentos, perdas, vendas, estoque, custo medio, lucro, financeiro,
dashboards, relatorios, frontend ou fluxos operacionais MUST incluir cenarios de
validacao para os fluxos afetados.

## Governance

Esta Constituicao prevalece sobre especificacoes, planos, tarefas e decisoes
tecnicas conflitantes. Em caso de conflito, a especificacao ou plano MUST ser
ajustado antes da implementacao.

A versao 2.0.0 registrou uma mudanca de governanca da regra anterior de compras:
compra registrada deixou de ser evento automatico de entrada de estoque. A regra
constitucional vigente e que compra cria mercadoria em transito, e somente
recebimento fisico confirmado cria entrada de estoque.

A versao 2.1.0 expande a governanca para dashboards, analytics, Mobile First,
experiencia operacional, priorizacao de produto e identidade visual oficial, sem
alteracao incompatavel dos principios existentes.

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

**Version**: 2.1.0 | **Ratified**: 2026-06-04 | **Last Amended**: 2026-06-09
