# Quickstart: Autenticacao e Autorizacao

## Prerequisites

- PostgreSQL configurado como nas features anteriores.
- Chave JWT e credenciais de provisionamento configuradas fora do repositorio
  por variaveis de ambiente ou user-secrets.
- Pelo menos um usuario provisionado por procedimento administrativo controlado.

## Administrative Provisioning

O primeiro usuario autorizado e criado na inicializacao da API quando as
configuracoes abaixo existem. Se o usuario ja existir, nada e alterado.

```powershell
dotnet user-secrets set "Jwt:SigningKey" "<chave forte com pelo menos 32 caracteres>" --project src/Amani.ImportadosERP.Api
dotnet user-secrets set "Auth:Provisioning:AdminLogin" "admin@amani" --project src/Amani.ImportadosERP.Api
dotnet user-secrets set "Auth:Provisioning:AdminPassword" "<senha forte>" --project src/Amani.ImportadosERP.Api
dotnet user-secrets set "Auth:Provisioning:AdminName" "Administrador Amani" --project src/Amani.ImportadosERP.Api
```

Alternativamente, use variaveis de ambiente equivalentes:

```text
Jwt__SigningKey
Auth__Provisioning__AdminLogin
Auth__Provisioning__AdminPassword
Auth__Provisioning__AdminName
```

## Backend Validation

1. Build:

   ```powershell
   dotnet build Amani_ImportadosERP.sln
   ```

2. Aplicar migration de autenticacao no ambiente de validacao:

   ```powershell
   dotnet ef database update --project src/Amani.ImportadosERP.Infra.Data --startup-project src/Amani.ImportadosERP.Api
   ```

3. Login com usuario ativo:

   ```http
   POST /api/auth/login
   Content-Type: application/json

   { "login": "<usuario>", "senha": "<senha>" }
   ```

   Expected: `200 OK`, `accessToken`, `expiresAt`, `idleExpiresAt` e usuario sem
   senha.

4. Login invalido:

   ```http
   POST /api/auth/login
   Content-Type: application/json

   { "login": "invalido", "senha": "invalida" }
   ```

   Expected: `401 Unauthorized` com mensagem generica.

5. Recurso protegido sem token:

   ```http
   GET /api/clientes
   ```

   Expected: `401 Unauthorized` e nenhum dado de negocio.

6. Recurso protegido com token:

   ```http
   GET /api/clientes
   Authorization: Bearer <accessToken>
   ```

   Expected: resposta normal do endpoint.

7. Recurso publico de saude:

   ```http
   GET /api/health
   ```

   Expected: `200 OK` sem token.

8. Logout autenticado:

   ```http
   POST /api/auth/logout
   Authorization: Bearer <accessToken>
   ```

   Expected: `204 No Content`.

9. Validar expiracao:

   - Token com mais de 8 horas deve ser rejeitado.
   - Sessao sem atividade por 60 minutos deve exigir novo login.

## Frontend Validation

1. Instalar dependencias se necessario e validar:

   ```powershell
   cd frontend
   npm run lint
   npm run typecheck
   npm run build
   ```

2. Abrir `/login` em 360px, tablet e desktop.

   Expected: formulario legivel, Dark Theme, sem AppShell operacional.

3. Abrir `/clientes` sem login.

   Expected: redirecionamento para `/login`.

4. Fazer login valido.

   Expected: redirecionamento para `/`, navegacao operacional visivel e chamadas
   usando autorizacao. O cookie local `amani-erp-authenticated` deve existir
   enquanto a sessao local estiver valida.

5. Fazer logout.

   Expected: voltar para `/login`; tentar voltar a rota protegida exige novo
   login; cache de consultas operacionais limpo.

6. Simular `401` em uma chamada autenticada.

   Expected: estado local limpo, query cache sensivel limpo/invalido e
   redirecionamento para `/login`.

## Secret Hygiene Checks

- Verificar que chave JWT, senha inicial e qualquer credencial de provisionamento
  nao aparecem em arquivos versionados.
- Confirmar que `appsettings*.json` versionados contem apenas placeholders ou
  configuracao nao sensivel.
