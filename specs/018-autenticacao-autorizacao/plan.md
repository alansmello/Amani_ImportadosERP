# Implementation Plan: Autenticacao e Autorizacao

**Branch**: `018-autenticacao-autorizacao` | **Date**: 2026-06-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/018-autenticacao-autorizacao/spec.md`

## Summary

Proteger o Amani ERP para uso real com autenticacao de usuarios internos,
emissao e validacao de sessao JWT, bloqueio transversal dos endpoints e rotas
operacionais, tela de login, logout e expiracao de sessao em 8 horas ou apos 60
minutos de inatividade. O MVP nao inclui perfis granulares, tela de gestao de
usuarios, recuperacao de senha, SSO ou multi-tenant.

## Technical Context

**Language/Version**: Backend .NET 8 / ASP.NET Core 8; frontend TypeScript 5.7,
React 19 e Next.js 15.

**Primary Dependencies**: Backend existente com EF Core 8, Npgsql, MediatR,
Swashbuckle e Clean Architecture. Adicionar autenticacao JWT Bearer no ASP.NET
Core e servicos de hash/token sem AutoMapper. Frontend usa services/hooks
locais, TanStack Query, Design System existente e middleware/layout do Next.js.

**Storage**: PostgreSQL via EF Core. Nova tabela de usuarios e, se mantido
persistente, eventos de autenticacao. Segredos via configuracao ambiente/user
secrets, nunca versionados.

**Testing**: `dotnet build Amani_ImportadosERP.sln`; testes manuais/contratuais
via API para login, 401 sem token e acesso com token; `npm run lint`,
`npm run typecheck`, `npm run build` no frontend; validacao manual Mobile First
descrita em [quickstart.md](./quickstart.md).

**Target Platform**: ERP web oficial da Amani em smartphone, tablet e desktop,
com API ASP.NET Core e frontend Next.js.

**Project Type**: Aplicacao web full stack em monorepo, com backend API e
frontend operacional.

**Performance Goals**: Login validado em ate 30 segundos para usuario real;
validacao de acesso deve ser imperceptivel para navegacao operacional; bloqueio
sem token deve ocorrer antes de retornar dados de negocio.

**Constraints**: Apenas login e saude tecnica permanecem publicos. Sessao expira
apos 8 horas ou 60 minutos de inatividade. Credenciais iniciais e chave JWT fora
do codigo. Sem tela de gestao de usuarios no MVP. Dark Theme, Design System e
Mobile First obrigatorios.

**Idle Session Strategy**: Para o MVP, o backend e a fonte da expiracao absoluta
de 8 horas e emite metadados de inatividade. O frontend controla a expiracao por
60 minutos sem atividade no estado local, limpa a sessao antes de novas
operacoes e trata qualquer `401` do backend como invalidacao definitiva da
sessao. Esta decisao evita estado de sessao persistente no servidor sem abrir mao
da expiracao operacional exigida.

**Scale/Scope**: Poucos usuarios internos da Amani. Protecao transversal de todos
os controllers existentes, novo modulo Auth no backend e rotas/sessao no
frontend.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Arquitetura e responsabilidades**: PASS. Controller de auth sera fino;
  regras ficam em Application/Domain; persistencia em Infra.Data.
- **Estoque por movimentacoes**: PASS. Feature nao altera estoque nem saldo.
- **Compras e mercadorias em transito**: PASS. Feature nao altera compras,
  recebimentos ou transito.
- **Recebimentos, perdas e rastreabilidade**: PASS. Feature nao altera eventos
  operacionais desses fluxos.
- **Vendas, custo medio e inventario inicial**: PASS. Feature nao altera venda,
  custo medio ou inventario.
- **Contratos de API e DTOs**: PASS. Login e sessao usam DTOs explicitos;
  entidade Usuario nao sera exposta como contrato externo.
- **Persistencia e mapeamentos**: PASS. Usuario e evento de autenticacao usam
  Fluent API e repository; historico de auditoria nao armazena senhas.
- **Backend como fonte das regras**: PASS. Validacao de credenciais, emissao e
  expiracao de acesso ficam no backend; frontend apenas guarda estado e envia
  credencial de acesso.
- **Analytics e escalabilidade**: PASS. Sem dashboard/relatorio novo; auditoria
  de login e consultada pontualmente, sem carregar historico operacional.
- **Mobile First**: PASS. Tela de login, redirecionamento e logout serao
  validados em smartphone, tablet e desktop.
- **Experiencia operacional**: PASS. Login simples, manutencao de sessao durante
  navegacao e logout acessivel no shell.
- **Priorizacao do produto**: PASS. Entrega protecao para producao sem antecipar
  perfis, SSO ou multi-tenant.
- **Identidade visual**: PASS. Tela de login e estados seguem Dark Theme e UI
  local.
- **Simplicidade antes de sofisticacao**: PASS. JWT Bearer e procedimento
  administrativo de usuarios atendem o MVP sem dependencia externa de identidade.

## Project Structure

### Documentation (this feature)

```text
specs/018-autenticacao-autorizacao/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- api-auth.md
|   `-- frontend-auth-flow.md
|-- checklists/
|   `-- requirements.md
`-- spec.md
```

### Source Code (repository root)

```text
src/Amani.ImportadosERP.Domain/
|-- Entities/
|   |-- Usuario.cs
|   `-- EventoAutenticacao.cs
`-- Enums/
    `-- ResultadoAutenticacao.cs

src/Amani.ImportadosERP.Application/
|-- DTOs/Auth/
|   |-- LoginRequestDto.cs
|   |-- LoginResponseDto.cs
|   `-- UsuarioAutenticadoDto.cs
|-- Interfaces/
|   |-- IUsuarioRepository.cs
|   |-- IEventoAutenticacaoRepository.cs
|   |-- IPasswordHasher.cs
|   `-- IJwtTokenService.cs
|-- Commands/Auth/
|   `-- LoginCommand.cs
|-- Commands/Handlers/
|   `-- LoginCommandHandler.cs
`-- Services/
    `-- AuthService.cs

src/Amani.ImportadosERP.Infra.Data/
|-- EntityConfigurations/
|   |-- UsuarioConfiguration.cs
|   `-- EventoAutenticacaoConfiguration.cs
|-- Repositories/
|   |-- UsuarioRepository.cs
|   `-- EventoAutenticacaoRepository.cs
`-- Migrations/
    `-- <nova migration de usuarios/auth>

src/Amani.ImportadosERP.Infra.IoC/
`-- DependencyInjection.cs

src/Amani.ImportadosERP.Api/
|-- Controllers/
|   `-- AuthController.cs
|-- Program.cs
`-- appsettings*.json

frontend/src/
|-- app/
|   `-- login/
|       `-- page.tsx
|-- components/
|   `-- auth/
|       |-- login-form.tsx
|       `-- auth-route-state.tsx
|-- hooks/
|   `-- use-auth.ts
|-- services/
|   |-- auth.ts
|   `-- api-client.ts
|-- types/
|   `-- auth.ts
|-- middleware.ts
`-- config/
    `-- routes.ts
```

**Structure Decision**: Manter a separacao atual do monorepo. Backend segue
Domain/Application/Infra.Data/Infra.IoC/Api; frontend segue app/components/hooks
/services/types/config. O cliente HTTP existente em `frontend/src/services`
recebe o header de autorizacao, e a protecao visual fica em rota dedicada de
login, middleware e shell sem mover os modulos operacionais.

## Phase 0 Research Summary

Ver [research.md](./research.md). Todas as decisoes foram resolvidas sem
marcadores pendentes.

## Phase 1 Design Summary

- Data model: [data-model.md](./data-model.md)
- API contract: [contracts/api-auth.md](./contracts/api-auth.md)
- Frontend flow contract: [contracts/frontend-auth-flow.md](./contracts/frontend-auth-flow.md)
- Validation guide: [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

- **Arquitetura e responsabilidades**: PASS. AuthController delega para
  Application; Infra.Data apenas persiste Usuario/EventoAutenticacao.
- **Estoque por movimentacoes**: PASS. Sem mudanca em estoque.
- **Compras e mercadorias em transito**: PASS. Sem mudanca em compras.
- **Recebimentos, perdas e rastreabilidade**: PASS. Sem mudanca nesses fluxos.
- **Vendas, custo medio e inventario inicial**: PASS. Sem mudanca nesses fluxos.
- **Contratos de API e DTOs**: PASS. Contratos documentam DTOs de login e erro;
  entidade Usuario nao e retornada diretamente.
- **Persistencia e mapeamentos**: PASS. Data model exige Fluent API, indice unico
  de login e hash protegido.
- **Backend como fonte das regras**: PASS. Expiracao, validade e rejeicao de
  credenciais sao decisao backend.
- **Analytics e escalabilidade**: PASS. Auditoria minima de auth, sem relatorio
  analitico nesta feature.
- **Mobile First**: PASS. Quickstart inclui 360px, tablet e desktop.
- **Experiencia operacional**: PASS. Fluxo de login/logout simples e retorno a
  area operacional.
- **Priorizacao do produto**: PASS. Escopo limita gestao de usuario e recursos
  avancados.
- **Identidade visual**: PASS. Contrato frontend exige Dark Theme e Design System.
- **Simplicidade antes de sofisticacao**: PASS. Sem Identity Server, SSO,
  refresh token persistente ou permissoes granulares no MVP.

## Validation and Regression Scope

- Login com usuario ativo retorna sessao valida e dados minimos do usuario.
- Credenciais invalidas, usuario inexistente e usuario inativo retornam mensagem
  generica.
- Todos os controllers operacionais exigem sessao valida; somente login e saude
  tecnica ficam publicos.
- Sessao expira por 8 horas de duracao ou 60 minutos de inatividade.
- Logout limpa sessao local e impede nova navegacao protegida sem login.
- `apiClient` envia autorizacao em chamadas autenticadas e trata 401
  redirecionando para login.
- Tela de login funciona em smartphone, tablet e desktop, sem AppShell
  operacional antes da autenticacao.
- Segredos e credenciais iniciais nao aparecem em arquivos versionados.
- `dotnet build`, `npm run lint`, `npm run typecheck` e `npm run build` passam.

## Required Future Task Coverage

O `/speckit-tasks` deve gerar tarefas explicitas para:

- adicionar pacote/configuracao JWT Bearer no backend;
- criar entidades `Usuario` e `EventoAutenticacao` com Fluent API e migration;
- criar repositories, interfaces e servicos de hash/token;
- criar DTOs e fluxo Application para login;
- criar `AuthController` com `POST /api/auth/login`;
- adicionar `[Authorize]` de forma transversal nos controllers operacionais ou
  politica global equivalente;
- manter publico apenas login e saude tecnica;
- documentar/prover procedimento administrativo para primeiro usuario sem
  credenciais versionadas;
- implementar mecanismo real de provisionamento administrativo do primeiro
  usuario lendo credenciais de ambiente/user-secrets;
- implementar estrategia de expiracao por inatividade no frontend e validacao de
  expiracao absoluta no backend;
- atualizar `apiClient` para enviar autorizacao e tratar 401;
- criar `services/auth.ts`, `hooks/use-auth.ts`, tipos e pagina `/login`;
- ajustar shell/middleware para proteger rotas e esconder navegacao operacional
  antes da autenticacao;
- adicionar logout no shell desktop/mobile;
- validar expiracao, inatividade, login invalido, logout e builds.

## Complexity Tracking

No constitution violations.
