# Frontend Contract: Auth Flow

## Routes

- `/login`: publica; renderiza formulario de login sem navegacao operacional.
- Todas as demais rotas em `frontend/src/config/routes.ts`: protegidas.

## Auth State

O frontend deve manter:

- `accessToken`
- `expiresAt`
- `idleExpiresAt`
- cookie local `amani-erp-authenticated` sem segredo, usado apenas para o
  middleware decidir redirecionamento de rota
- `usuario.id`
- `usuario.login`
- `usuario.nomeExibicao`

O estado deve ser limpo em logout, expiracao local ou resposta `401` da API.

## Login Flow

1. Usuario abre `/login`.
2. Informa login e senha.
3. `services/auth.ts` chama `POST /api/auth/login`.
4. Em sucesso, o estado de autenticacao e salvo e o usuario e enviado para `/`.
5. Em erro `401`, exibir mensagem generica de credenciais nao aceitas.
6. Em erro de transporte, exibir estado de falha temporaria e permitir nova
   tentativa.

## Protected Navigation Flow

1. Usuario tenta abrir rota protegida sem acesso local valido.
2. Middleware/guard redireciona para `/login`.
3. Usuario autenticado navega normalmente.
4. `apiClient` adiciona `Authorization: Bearer <token>` em chamadas protegidas.
5. `apiClient` renova localmente `idleExpiresAt` em atividade valida.
6. Ao receber `401`, limpar estado, limpar cache sensivel e redirecionar para
   `/login`.

## Logout Flow

1. Usuario aciona logout no shell.
2. Frontend chama `POST /api/auth/logout` quando houver token valido.
3. Estado local e cookie local sao limpos mesmo se a chamada remota falhar.
4. Query cache sensivel e invalidado/limpo.
5. Usuario e redirecionado para `/login`.
6. Botao voltar ou URL protegida exige novo login.

## UI Requirements

- Dark Theme obrigatorio.
- Layout mobile-first para 360px, tablet e desktop.
- Login deve usar componentes/tokens do Design System local.
- Mensagens nao devem revelar se usuario existe, esta inativo ou senha falhou.
- AppShell operacional nao deve aparecer para usuario nao autenticado.
