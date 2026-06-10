# Quickstart: Configuracao Inicial do Frontend Amani ERP

Este guia valida a Feature 005 apos a implementacao. Ele assume que o projeto frontend foi criado em `frontend/`.

## Prerequisites

- Node.js LTS instalado.
- Dependencias do frontend instaladas.
- Branch `005-frontend-base` ativa.

## Setup

```powershell
cd frontend
npm install
```

## Validation Commands

```powershell
npm run lint
npm run typecheck
npm run build
npm run dev
```

Expected outcomes:

- Lint sem erros.
- Typecheck sem erros.
- Build de producao concluido.
- Dev server abre a aplicacao sem depender do backend.

Implementation status for Feature 005:

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed and generated all expected App Router routes.
- `npm run dev`: passed for route validation at `http://127.0.0.1:3000`.
- In this Codex shell, `npm` is not available on the default PATH; commands were executed through the approved Windows Node/npm environment.

## Manual Responsive Validation

Abrir a aplicacao em tres classes de viewport:

- Smartphone: 390 x 844 ou equivalente.
- Tablet: 768 x 1024 ou equivalente.
- Desktop: 1440 x 900 ou equivalente.

Expected outcomes:

- Smartphone usa bottom navigation com Dashboard, Vendas, Estoque, Compras e Mais.
- Desktop usa sidebar persistente com todos os modulos.
- Tablet nao apresenta navegacao duplicada ou sobreposicao.
- Nenhum viewport apresenta rolagem horizontal no shell principal.
- Textos e icones cabem nos containers.

## Navigation Validation

Validar as rotas:

- `/`
- `/clientes`
- `/produtos`
- `/compras`
- `/vendas`
- `/estoque`
- `/financeiro`
- `/configuracoes`

Expected outcomes:

- Cada rota carrega sem erro.
- Item ativo da navegacao fica visualmente indicado.
- Rotas ainda nao funcionais mostram placeholder claro.
- Nenhuma rota oferece criacao, edicao, exclusao, autenticacao ou integracao externa.

## Visual Identity Validation

Expected outcomes:

- Tema claro nao aparece em nenhum momento.
- Fundo global usa a identidade escura Amani.
- Componentes usam tokens documentados no contrato.
- Botoes, cards, badges, estados vazios, loading e erro seguem linguagem visual consistente.
- Foco e hover sao visiveis em controles interativos.

## Dashboard Placeholder Validation

Expected outcomes:

- Dashboard inicial exibe estrutura futura de indicadores e atalhos.
- Nao ha metricas reais, valores financeiros reais, rankings reais ou graficos reais.
- Cards se reorganizam corretamente entre smartphone, tablet e desktop.
- Atalhos levam apenas a rotas placeholder ou destinos estruturais.

## Backend Readiness Validation

Expected outcomes:

- Existe camada base de API client e QueryClient.
- Estados de loading, erro e vazio usam componentes compartilhados.
- A aplicacao inicial carrega mesmo com backend indisponivel.
- Nenhuma regra critica de estoque, custo, lucro, financeiro ou dashboard e calculada no frontend.

## Implementation Validation Notes

- Contract routes `/`, `/clientes`, `/produtos`, `/compras`, `/vendas`, `/estoque`, `/financeiro`, and `/configuracoes` returned HTTP 200 from the dev server.
- Responsive validation was reviewed against implemented breakpoints and layout classes: mobile bottom navigation is hidden at desktop, desktop sidebar is hidden below desktop, `PageContainer` uses `1440px` max width, and dashboard grids progress from single-column mobile to tablet/desktop grids.
- No intentional naming deviations were found between the implemented components/routes and `contracts/frontend-foundation-contract.md`.

## Reference Artifacts

- Plano: [plan.md](./plan.md)
- Modelo conceitual: [data-model.md](./data-model.md)
- Contrato frontend: [contracts/frontend-foundation-contract.md](./contracts/frontend-foundation-contract.md)
