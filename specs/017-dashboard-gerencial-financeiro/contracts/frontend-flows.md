# Frontend Flow Contract: Dashboard Gerencial e Financeiro

## Flow 1: Abrir Home

Initial state:
- Usuario acessa `/`.
- Periodo padrao: mes atual.

Expected behavior:
- Home deixa de renderizar placeholder.
- Filtro mostra o periodo ativo.
- KPIs financeiros carregam da fonte financeira filtravel.
- Rankings, alertas e graficos carregam das fontes gerenciais.
- Cada secao tem loading proprio.

Acceptance:
- Gestor identifica faturamento, lucro, despesas e recebiveis em ate 10
  segundos quando a API responde com dados.
- Se uma secao falhar, as demais continuam visiveis quando carregadas.

## Flow 2: Alterar Periodo para Mes

Initial state:
- Home carregada.

Steps:
1. Usuario escolhe modo "Mes".
2. Usuario seleciona mes e ano.
3. Usuario aplica o filtro.

Expected behavior:
- Todas as query keys incluem o filtro normalizado.
- Todas as secoes filtraveis refazem consulta.
- Dados exibidos correspondem ao filtro aplicado.

Acceptance:
- Nenhum bloco mostra dados de periodo anterior como atuais.

## Flow 3: Alterar Periodo para Ano

Initial state:
- Home carregada.

Steps:
1. Usuario escolhe modo "Ano".
2. Usuario seleciona ano.
3. Usuario aplica o filtro.

Expected behavior:
- Consultas filtraveis recebem `ano`.
- Filtro aplicado retornado pela API e coerente com a tela.

Acceptance:
- KPIs, rankings, alertas e graficos representam o ano escolhido.

## Flow 4: Alterar para Intervalo Customizado

Initial state:
- Home carregada.

Steps:
1. Usuario escolhe modo "Intervalo".
2. Usuario informa data inicial e data final.
3. Usuario aplica.

Expected behavior:
- Se `dataInicial <= dataFinal`, consultas sao refeitas.
- Se `dataInicial > dataFinal`, a UI bloqueia a consulta e mostra erro claro.

Acceptance:
- Intervalo invalido nao dispara requisicoes de dashboard.

## Flow 5: Dados Vazios ou Incompletos

Initial state:
- Fonte oficial responde sem registros ou com avisos.

Expected behavior:
- Secoes vazias mostram mensagem propria.
- Avisos de dado incompleto aparecem no bloco impactado.
- Valores nao sao fabricados ou substituidos por calculos locais.

Acceptance:
- Usuario entende que faltam dados operacionais/financeiros registrados.

## Flow 6: Responsividade

Viewports minimos:
- Smartphone: 360px de largura.
- Tablet: 768px de largura.
- Desktop: 1280px de largura.

Expected behavior:
- Filtros, KPIs, rankings, alertas e graficos permanecem legiveis.
- Sem rolagem horizontal indevida.
- Textos nao sobrepoem cards, eixos, botoes ou navegacao.

Acceptance:
- Os quatro KPIs principais aparecem sem perda de informacao essencial.
