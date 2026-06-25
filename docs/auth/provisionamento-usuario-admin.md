# Provisionamento do Usuario Administrativo Inicial

O primeiro usuario do ERP deve ser criado por configuracao operacional, sem
credenciais versionadas no repositorio.

## Variaveis de configuracao

Configure os valores abaixo por variaveis de ambiente, user-secrets ou mecanismo
equivalente do ambiente:

```text
Jwt__SigningKey
Auth__Provisioning__AdminLogin
Auth__Provisioning__AdminPassword
Auth__Provisioning__AdminName
```

`Jwt__SigningKey`, `AdminLogin` e `AdminPassword` sao obrigatorios para testes
praticos de login. `AdminName` e opcional; se ausente, o login sera usado como
nome de exibicao.

## Comportamento

- A rotina executa na inicializacao da API.
- Se `AdminLogin` ou `AdminPassword` nao estiverem configurados, nada e criado.
- Se o login ja existir, nada e alterado.
- A senha e armazenada apenas como hash.
- A chave JWT deve ser uma string forte, com pelo menos 32 caracteres.
- Nenhuma senha ou chave JWT deve ser adicionada a `appsettings*.json`
  versionado.

## Exemplo local com user-secrets

```powershell
dotnet user-secrets set "Jwt:SigningKey" "<chave forte com pelo menos 32 caracteres>" --project src/Amani.ImportadosERP.Api
dotnet user-secrets set "Auth:Provisioning:AdminLogin" "admin@amani" --project src/Amani.ImportadosERP.Api
dotnet user-secrets set "Auth:Provisioning:AdminPassword" "<senha forte>" --project src/Amani.ImportadosERP.Api
dotnet user-secrets set "Auth:Provisioning:AdminName" "Administrador Amani" --project src/Amani.ImportadosERP.Api
```

Depois de configurar os segredos, aplique as migrations e inicie a API. O
usuario sera criado automaticamente na primeira inicializacao em que o login
ainda nao existir.
