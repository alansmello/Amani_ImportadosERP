# Data Model: Autenticacao e Autorizacao

## Usuario

Representa uma pessoa autorizada a acessar o ERP.

### Fields

- `Id`: identificador unico.
- `Login`: identificador unico usado na entrada; normalizado para comparacao.
- `NomeExibicao`: nome mostrado no shell e auditoria.
- `SenhaHash`: senha protegida, nunca texto puro.
- `Ativo`: indica se o usuario pode autenticar.
- `OrigemProvisionamento`: valor textual curto indicando criacao administrativa.
- `CriadoEm`: data/hora de criacao.
- `AtualizadoEm`: data/hora da ultima alteracao relevante.
- `UltimoLoginEm`: data/hora do ultimo login bem-sucedido, opcional.

### Validation Rules

- `Login` e obrigatorio, unico e comparado de forma case-insensitive.
- `NomeExibicao` e obrigatorio.
- `SenhaHash` e obrigatorio e nao pode conter senha em texto puro.
- Usuario inativo nunca autentica.
- Credenciais de provisionamento nao podem ser armazenadas em arquivos
  versionados.

### Relationships

- Um `Usuario` pode ter varios `EventoAutenticacao`.

### Lifecycle

1. Provisionado administrativamente.
2. Ativo e apto a login.
3. Pode ser inativado por procedimento administrativo futuro.
4. Inativo permanece no historico, mas nao gera sessao.

## Sessao de Acesso

Representa a validade temporaria de acesso emitida apos login bem-sucedido.

### Fields

- `UsuarioId`: usuario autenticado.
- `Login`: identificador do usuario autenticado.
- `NomeExibicao`: nome retornado ao frontend.
- `EmitidaEm`: data/hora de emissao.
- `ExpiraEm`: data/hora maxima, 8 horas apos emissao.
- `InatividadeExpiraEm`: data/hora limite considerando 60 minutos de
  inatividade.

### Validation Rules

- A sessao expira apos 8 horas de duracao total.
- A sessao expira apos 60 minutos sem atividade.
- Sessao expirada ou invalida nao permite acessar recursos protegidos.

### Persistence

- A sessao e comprovante temporario. Nao precisa de tabela propria no MVP se a
  validade puder ser verificada por token assinado e estado local do frontend.

## EventoAutenticacao

Registro minimo de auditoria de tentativas de entrada e saida.

### Fields

- `Id`: identificador unico.
- `UsuarioId`: usuario relacionado quando conhecido, opcional para falha de
  usuario inexistente.
- `LoginInformado`: identificador informado, normalizado ou mascarado conforme
  politica de privacidade.
- `Resultado`: sucesso, credenciais invalidas, usuario inativo, logout ou
  sessao expirada.
- `MensagemSegura`: descricao interna curta, sem senha.
- `CriadoEm`: data/hora do evento.

### Validation Rules

- Senhas nunca sao registradas.
- Falhas de usuario inexistente e senha invalida devem resultar na mesma
  mensagem externa generica.
- Eventos sao append-only para preservar auditoria.

## State Transitions

```text
Usuario ativo + credenciais validas
  -> Login bem-sucedido
  -> Sessao emitida
  -> Uso protegido
  -> Logout OU expiracao 8h OU expiracao 60min inatividade
  -> Novo login exigido

Usuario inexistente/inativo/credenciais invalidas
  -> Login negado
  -> Evento de falha
  -> Nenhuma sessao emitida
```
