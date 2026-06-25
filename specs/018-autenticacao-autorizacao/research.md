# Research: Autenticacao e Autorizacao

## Decision: JWT Bearer como mecanismo de acesso da API

**Rationale**: A feature exige API protegida e frontend Next.js consumindo
endpoints existentes. JWT Bearer e nativo no ASP.NET Core, funciona bem com
clientes web, permite aplicar `[Authorize]`/politicas globais e nao exige
servidor externo de identidade para poucos usuarios internos.

**Alternatives considered**:
- Cookies de servidor: simplificam browser, mas exigem cuidado maior com CSRF e
  proxy/cross-origin no monorepo.
- ASP.NET Core Identity completo: robusto, mas antecipa gestao de usuarios,
  perfis e fluxos fora do MVP.
- SSO/OAuth externo: fora do escopo explicitamente definido.

## Decision: Sessao com expiracao absoluta de 8 horas e inatividade de 60 minutos

**Rationale**: Decisao esclarecida na spec. A duracao cobre um dia operacional
sem logins repetitivos e reduz risco em dispositivos compartilhados. A regra de
inatividade deve ser aplicada pelo backend no token/claims e pelo frontend no
estado local para redirecionamento rapido.

**Alternatives considered**:
- 4 horas/30 minutos: mais restritivo, mas pode interromper uso operacional.
- 24 horas/120 minutos: mais conveniente, mas aumenta janela de risco.
- Sem inatividade: simplifica, mas conflita com seguranca minima de producao.

## Decision: Provisionamento administrativo controlado, sem tela de usuarios

**Rationale**: O MVP atende poucos usuarios da Amani. Um procedimento
administrativo documentado evita criar CRUD de usuario, permissoes e validacoes
de gestao que nao fazem parte do escopo. Credenciais iniciais devem vir de
entrada operacional segura, ambiente ou comando/script local, nunca de arquivo
versionado.

**Alternatives considered**:
- Tela protegida de gestao de usuarios: util futuramente, mas aumenta escopo.
- Usuario unico compartilhado: reduz rastreabilidade e auditoria.
- Arquivo de configuracao: fragil para senha, rotacao e auditoria.

## Decision: Hash de senha por servico de Application/Infra usando primitivas seguras do .NET

**Rationale**: A constituicao proibe regra em controller e exige clareza. Um
`IPasswordHasher` permite manter o contrato na Application e a implementacao em
Infra/IoC. O plano deve usar algoritmo adaptativo/salgado suportado pelo .NET ou
biblioteca consolidada, sem armazenar senha em texto puro.

**Alternatives considered**:
- Hash manual simples: inseguro e inaceitavel.
- ASP.NET Identity PasswordHasher isolado: aceitavel se a dependencia for
  adicionada sem trazer todo o modelo Identity.
- BCrypt/Argon2 via pacote externo: bom tecnicamente, mas exige nova dependencia;
  justificar se escolhido em tarefas.

## Decision: Protecao transversal com excecoes explicitas

**Rationale**: A spec define que somente login e saude tecnica ficam publicos.
Aplicar autorizacao global ou `[Authorize]` consistente evita esquecer
controllers existentes. Excecoes devem ser marcadas explicitamente com
`[AllowAnonymous]`.

**Alternatives considered**:
- Adicionar `[Authorize]` manual em cada action: claro, mas mais sujeito a
  omissoes.
- Proteger apenas frontend: insuficiente, pois API continuaria exposta.
- Manter Swagger publico em producao: fora da regra de superficie publica.

## Decision: Frontend armazena e injeta o acesso por service dedicado

**Rationale**: O frontend ja centraliza chamadas em `frontend/src/services`.
Criar `services/auth.ts`, `hooks/use-auth.ts` e estender `api-client.ts` preserva
o padrao local. O middleware/guard evita renderizar areas protegidas sem estado
de acesso, enquanto o tratamento de 401 corrige expiracao ou token invalido.

**Alternatives considered**:
- Chamar fetch diretamente nos componentes: quebra o padrao existente.
- Guardar autenticacao em cada pagina: duplicado e propenso a falhas.
- Recalcular validade apenas no frontend: insuficiente; backend continua fonte
  da validade real.

## Decision: Auditoria minima de autenticacao

**Rationale**: A spec exige registrar tentativas bem-sucedidas e negadas sem
senha. Registrar usuario quando conhecido, identificador informado normalizado,
resultado, data/hora e metadados minimos permite suporte e rastreabilidade sem
expor segredos.

**Alternatives considered**:
- Sem auditoria: falha FR-013.
- Auditoria completa com IP/user agent detalhados e relatorios: pode ser futuro,
  mas nao e necessario para o MVP.
