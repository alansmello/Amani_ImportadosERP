# Feature Specification: Gestao de Fornecedores no Frontend

**Feature Branch**: `009-gestao-fornecedores`

**Created**: 2026-06-14

**Status**: Draft

**Input**: User description: "F009 - Gestao de Fornecedores (frontend). Objetivo: Permitir cadastrar/editar/consultar fornecedores, pre-requisito para Compras. Escopo exato: Modulo de frontend espelhando o padrao de Produtos (006), consumindo endpoints ja existentes; services/suppliers.ts ja existe. O que entra: Rotas /fornecedores, /fornecedores/novo, /fornecedores/[id], /fornecedores/[id]/editar; lista com busca local; formulario; estados; item de navegacao. O que fica fora: Historico de compras por fornecedor, metricas, inativacao (backend nao tem inativar de fornecedor). Dependencias: Nenhuma (backend pronto). Prioridade: Alta. Risco tecnico: Muito baixo (replica 006). Ordem sugerida: 2o. Criterios de aceite: CRUD funcional contra /api/fornecedores; responsivo (mobile/tablet/desktop); Dark Only; lint/typecheck/build ok; sem calculo de regra no frontend. Impacto: frontend/src/app/fornecedores/** (novo), components/fornecedores/** (novo), hooks/use-suppliers.ts (estender), services/suppliers.ts, types/, config/navigation.ts + routes.ts."

## Governance Note

Esta feature cria a experiencia operacional de manutencao de fornecedores no
frontend, pre-requisito para o fluxo de Compras. Ela deve preservar a Constituicao:
frontend nao calcula regra de negocio, nao cria metricas gerenciais, nao inventa
historico e nao substitui a fonte oficial das validacoes. A experiencia deve seguir
Mobile First, Dark Only, identidade visual existente, simplicidade operacional e
continuidade com o modulo de Produtos ja validado.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar fornecedores (Priority: P1)

Como usuario operacional do Amani ERP, quero acessar a area de fornecedores e
visualizar os fornecedores cadastrados para localizar rapidamente uma empresa ou
pessoa fornecedora antes de registrar compras ou atualizar seus dados.

**Why this priority**: A listagem e a porta de entrada do modulo, entrega valor
imediato e prepara o usuario para os fluxos de cadastro, consulta individual e
edicao.

**Independent Test**: Pode ser testada acessando a area de fornecedores com
fornecedores existentes, validando que registros reais aparecem, que a busca reduz
a lista exibida e que cada fornecedor permite abrir seus detalhes.

**Acceptance Scenarios**:

1. **Given** que existem fornecedores cadastrados, **When** o usuario acessa a area de fornecedores, **Then** o sistema exibe uma listagem responsiva com dados principais e acoes disponiveis.
2. **Given** que a lista de fornecedores esta carregada, **When** o usuario informa um termo de busca, **Then** o sistema exibe apenas fornecedores compativeis com o termo sem criar dados ficticios.
3. **Given** que nao existem fornecedores cadastrados, **When** o usuario acessa a area de fornecedores, **Then** o sistema exibe um estado vazio claro com acesso para cadastrar novo fornecedor.
4. **Given** que ocorre falha ao carregar os fornecedores, **When** a area de fornecedores e exibida, **Then** o sistema mostra uma mensagem de erro compreensivel e permite tentar novamente.

---

### User Story 2 - Cadastrar fornecedor (Priority: P2)

Como usuario operacional, quero cadastrar um novo fornecedor informando os dados
aceitos pelo sistema para que ele possa ser usado nos fluxos de compra.

**Why this priority**: Criar fornecedor e o primeiro fluxo de manutencao necessario
para que Compras consiga referenciar fornecedores reais.

**Independent Test**: Pode ser testada preenchendo o formulario com dados validos,
salvando o fornecedor e confirmando que ele aparece na lista e pode ser consultado.

**Acceptance Scenarios**:

1. **Given** que o usuario esta no cadastro de fornecedor, **When** preenche os campos obrigatorios e opcionais aceitos com valores validos, **Then** o sistema cadastra o fornecedor e permite ver o registro salvo.
2. **Given** que campos opcionais nao foram informados, **When** os campos obrigatorios estao validos, **Then** o fornecedor e criado sem exigir dados que a fonte oficial nao torna obrigatorios.
3. **Given** que algum campo obrigatorio esta ausente ou invalido, **When** o usuario tenta salvar, **Then** o sistema destaca os campos afetados e preserva os dados ja digitados.
4. **Given** que a fonte oficial rejeita o cadastro, **When** a tela recebe a rejeicao, **Then** a mensagem e apresentada de forma clara para correcao pelo usuario.

---

### User Story 3 - Consultar detalhes de fornecedor (Priority: P3)

Como usuario operacional, quero abrir um fornecedor especifico para revisar seus
dados antes de edita-lo ou utiliza-lo em compras.

**Why this priority**: A consulta individual reduz erro operacional e cria
continuidade natural entre listagem e edicao.

**Independent Test**: Pode ser testada abrindo um fornecedor existente a partir da
lista ou por seu identificador e validando que seus dados principais sao exibidos
sem informacoes inventadas.

**Acceptance Scenarios**:

1. **Given** que o fornecedor existe, **When** o usuario abre seus detalhes, **Then** o sistema exibe os dados principais atualmente suportados pela fonte oficial.
2. **Given** que o usuario esta nos detalhes de um fornecedor, **When** decide alterar seus dados, **Then** o sistema oferece navegacao clara para edicao.
3. **Given** que o fornecedor solicitado nao existe mais, **When** o usuario tenta abrir seus detalhes, **Then** o sistema exibe estado de nao encontrado sem quebrar a navegacao.

---

### User Story 4 - Editar fornecedor existente (Priority: P4)

Como usuario operacional, quero editar os dados permitidos de um fornecedor para
manter o cadastro correto conforme mudancas de nome, contato ou dados comerciais
suportados.

**Why this priority**: A edicao completa o ciclo basico de manutencao de
fornecedores e preserva a utilidade do cadastro para Compras.

**Independent Test**: Pode ser testada abrindo a edicao de um fornecedor existente,
alterando campos permitidos, salvando e verificando que a consulta e a lista exibem
os dados atualizados.

**Acceptance Scenarios**:

1. **Given** que o fornecedor existe, **When** o usuario abre a edicao, **Then** o formulario e preenchido com os dados atuais do fornecedor.
2. **Given** que o usuario altera campos permitidos com valores validos, **When** salva o formulario, **Then** o sistema atualiza o fornecedor e permite conferir os dados salvos.
3. **Given** que a fonte oficial rejeita a atualizacao por dados invalidos, **When** o usuario tenta salvar, **Then** a tela exibe a mensagem retornada e permite corrigir sem perder o preenchimento.

---

### User Story 5 - Navegar para fornecedores pelo menu (Priority: P5)

Como usuario operacional, quero encontrar a area de fornecedores na navegacao
principal para acessar o modulo de forma consistente com as demais areas cadastrais.

**Why this priority**: O modulo precisa ser descoberto e acessado no fluxo normal
de trabalho, mas essa entrega depende da existencia das telas principais.

**Independent Test**: Pode ser testada abrindo a navegacao principal em smartphone,
tablet e desktop e validando que o item de fornecedores leva para a area correta.

**Acceptance Scenarios**:

1. **Given** que o usuario esta autenticado no frontend, **When** abre a navegacao principal, **Then** encontra a area de fornecedores junto aos demais cadastros operacionais.
2. **Given** que o usuario aciona o item de fornecedores, **When** a navegacao ocorre, **Then** a area principal de fornecedores e exibida sem perda de contexto.
3. **Given** que o usuario esta em cadastro, detalhe ou edicao, **When** usa a navegacao de retorno, **Then** consegue voltar para a lista de fornecedores de forma clara.

### Edge Cases

- O carregamento da lista ou de um fornecedor individual pode falhar; cada tela deve exibir estado de erro claro sem bloquear toda a navegacao.
- A lista de fornecedores pode estar vazia; a tela deve orientar o usuario para cadastrar o primeiro fornecedor.
- Um fornecedor pode nao possuir todos os campos opcionais preenchidos; lista, detalhes e formulario devem exibir essa ausencia de forma neutra.
- O usuario pode informar dados de contato ou cadastro em formato invalido; o sistema deve impedir o envio quando houver validacao basica clara ou apresentar a rejeicao retornada pela fonte oficial.
- O usuario pode tentar abrir ou editar um identificador inexistente; o sistema deve exibir estado de nao encontrado.
- A fonte oficial nao oferece inativacao de fornecedor; a interface nao deve exibir acao de inativar, excluir ou remover fornecedor.
- A tela nao deve exibir historico de compras, metricas, ranking, totais comprados ou indicadores calculados no frontend.
- A area de fornecedores deve funcionar em smartphone, tablet e desktop, mantendo acoes acessiveis sem sobreposicao de conteudo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST exibir uma area principal de fornecedores com titulo, descricao curta, acao para novo fornecedor, busca simples, listagem responsiva e acoes por fornecedor.
- **FR-002**: O sistema MUST listar somente fornecedores reais retornados pela fonte oficial, sem dados mockados ou valores inventados.
- **FR-003**: O sistema MUST tratar estados de carregamento, vazio e erro na listagem de fornecedores.
- **FR-004**: O sistema MUST permitir busca simples sobre os fornecedores exibidos, no minimo por nome e, quando disponiveis, dados de contato, sem alterar os dados persistidos.
- **FR-005**: O sistema MUST permitir abrir a consulta individual de um fornecedor por identificador.
- **FR-006**: O sistema MUST exibir nos detalhes de fornecedor os dados principais atualmente suportados pela fonte oficial.
- **FR-007**: O sistema MUST permitir cadastrar fornecedor com os campos obrigatorios definidos pela fonte oficial e demais campos opcionais aceitos.
- **FR-008**: O sistema MUST permitir que campos opcionais fiquem ausentes quando a fonte oficial assim permitir.
- **FR-009**: O sistema MUST validar visualmente campos obrigatorios e formatos basicos antes ou durante a tentativa de salvar.
- **FR-010**: O sistema MUST apresentar mensagens claras quando a fonte oficial rejeitar cadastro ou edicao.
- **FR-011**: O sistema MUST permitir editar fornecedor existente, preenchendo o formulario com os dados atuais antes da alteracao.
- **FR-012**: O sistema MUST salvar apenas os campos atualmente aceitos para fornecedor pela fonte oficial.
- **FR-013**: O sistema MUST exibir feedback de sucesso apos cadastro ou edicao concluidos.
- **FR-014**: O sistema MUST redirecionar ou atualizar a tela apos cadastro ou edicao bem-sucedidos para que o usuario veja o fornecedor salvo.
- **FR-015**: O sistema MUST adicionar fornecedores a navegacao principal de forma consistente com os demais cadastros operacionais.
- **FR-016**: O sistema MUST tratar navegacao de retorno entre lista, detalhes, cadastro e edicao de forma clara em telas pequenas e grandes.
- **FR-017**: O sistema MUST manter a experiencia de listagem, formulario, loading, erro e navegacao consistente com a area de produtos da Feature 006.
- **FR-018**: O sistema MUST preservar o padrao visual Dark Only, Mobile First e responsivo definido para o frontend base.
- **FR-019**: O sistema MUST NOT implementar historico de compras por fornecedor, metricas, rankings, totais comprados, indicadores ou calculos gerenciais no frontend.
- **FR-020**: O sistema MUST NOT exibir acao de inativar, excluir ou remover fornecedor enquanto a fonte oficial nao oferecer suporte para essa operacao.
- **FR-021**: O sistema MUST manter Compras fora do escopo, usando fornecedores apenas como cadastro preparatorio para fluxos futuros.

### Key Entities *(include if feature involves data)*

- **Fornecedor**: Pessoa ou empresa que fornece mercadorias para a operacao. Dados principais no escopo atual: identificador, nome e demais campos cadastrais ou de contato aceitos pela fonte oficial.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuario consegue localizar um fornecedor existente e abrir seus detalhes em ate 30 segundos a partir da area principal de fornecedores.
- **SC-002**: Um usuario consegue cadastrar um fornecedor valido em ate 2 minutos usando os campos aceitos pela fonte oficial.
- **SC-003**: Um usuario consegue editar um fornecedor existente em ate 2 minutos sem precisar redigitar todos os dados.
- **SC-004**: 100% dos fluxos de lista, detalhe, cadastro e edicao apresentam estados de carregamento, erro ou vazio quando aplicavel.
- **SC-005**: 100% das telas de fornecedores permanecem utilizaveis sem sobreposicao de conteudo em smartphone, tablet e desktop.
- **SC-006**: Nenhum fluxo desta feature apresenta dados mockados, historico de compras inventado, metricas comerciais ou calculos gerenciais.
- **SC-007**: Nenhuma acao de inativacao, exclusao ou remocao fica disponivel para fornecedor nesta feature.
- **SC-008**: A experiencia operacional de fornecedores permanece consistente com a experiencia ja entregue para produtos, reduzindo variacao entre modulos cadastrais equivalentes.

## Assumptions

- O usuario alvo e um operador interno do Amani ERP que ja tem acesso ao frontend; autenticacao e autorizacao permanecem fora do escopo desta feature.
- A fonte oficial atual permite listar, consultar, criar e editar fornecedores, mas nao oferece inativacao, exclusao ou remocao.
- Nome e tratado como campo obrigatorio minimo para fornecedor; demais campos seguem obrigatoriedade e validacoes da fonte oficial.
- O contrato atual de fornecedor nao inclui historico de compras, metricas, totais comprados, ranking, indicadores ou status de inativacao.
- A listagem atual de fornecedores pode nao oferecer paginacao oficial; a tela pode exibir a lista retornada e aplicar busca simples sobre os dados carregados.
- A feature preserva Mobile First, Dark Only e a identidade visual existente do frontend base.
- A fase de planejamento deve usar a Feature 006 de produtos como referencia direta para estrutura de paginas, componentes reutilizaveis, experiencia de listagem, formulario, loading, erro e navegacao.
