# API Contract: Autenticacao e Autorizacao

Base path: `/api`

## Public Endpoints

### POST `/api/auth/login`

Autentica usuario interno e emite sessao de acesso.

#### Request

```json
{
  "login": "usuario@amani",
  "senha": "string"
}
```

#### Success: `200 OK`

```json
{
  "accessToken": "jwt-token",
  "tokenType": "Bearer",
  "expiresAt": "2026-06-25T22:00:00Z",
  "idleExpiresAt": "2026-06-25T15:00:00Z",
  "usuario": {
    "id": "00000000-0000-0000-0000-000000000000",
    "login": "usuario@amani",
    "nomeExibicao": "Usuario Amani"
  }
}
```

#### Errors

- `400 Bad Request`: campos obrigatorios ausentes ou formato invalido.
- `401 Unauthorized`: credenciais nao aceitas, usuario inexistente ou usuario
  inativo. A mensagem externa deve ser generica.

Example error:

```json
{
  "error": "Credenciais nao aceitas."
}
```

### GET `/api/health`

Recurso tecnico publico para verificar saude basica da API.

#### Success: `200 OK`

```json
{
  "status": "Healthy"
}
```

## Protected Auth Endpoints

### POST `/api/auth/logout`

Registra evento de logout quando chamado com sessao valida. O frontend deve
limpar a sessao local mesmo se esta chamada falhar.

#### Request

```http
Authorization: Bearer <accessToken>
```

#### Success: `204 No Content`

## Protected Resources

Todos os endpoints fora de `/api/auth/login` e `/api/health` exigem header de
autorizacao valido. A API aplica politica global de autenticacao com excecoes
publicas explicitas.

```http
Authorization: Bearer <accessToken>
```

### Missing, expired or invalid access

```http
HTTP/1.1 401 Unauthorized
```

Resposta pode usar corpo vazio ou mensagem generica, mas nao deve retornar dados
de negocio.

## Expiration Rules

- `expiresAt`: no maximo 8 horas apos emissao.
- `idleExpiresAt`: no maximo 60 minutos apos ultima atividade reconhecida pelo
  frontend.
- A API e a fonte de verdade para validade criptografica e expiracao absoluta do
  token; o frontend antecipa expiracao por inatividade e limpa sessao local.

## Authorization Scope

MVP usa apenas usuario autenticado. Nao ha perfis, permissoes granulares,
multi-tenant ou SSO.

## Security Requirements

- Senhas nunca trafegam em respostas.
- Senhas nunca sao registradas em eventos ou logs.
- Chave de assinatura e credenciais iniciais ficam fora do codigo versionado.
- Swagger pode continuar em desenvolvimento, mas nao entra na superficie publica
  de producao.
