# Amani ERP

Vocabulário de compras e seus eventos logísticos e financeiros.

## Language

**Item de compra**:
Produto e quantidade adquiridos de um fornecedor em uma compra.

**Recebimento**:
Confirmação de que uma quantidade adquirida foi recebida. O fato do recebimento permanece no histórico mesmo quando essa quantidade é devolvida posteriormente.

**Devolução antes do recebimento**:
Recusa de uma quantidade adquirida ainda pendente de recebimento, encerrando a expectativa de receber essa quantidade.
_Avoid_: Recebimento, saída de estoque.

**Devolução depois do recebimento**:
Retorno ao fornecedor de uma quantidade anteriormente recebida, com retirada correspondente do estoque.
_Avoid_: Cancelamento do recebimento original.

**Compensação de devolução**:
Correção auditável que neutraliza os efeitos de uma devolução incorreta, preservando o fato originalmente registrado.
_Avoid_: Exclusão da devolução.

**Reembolso de compra**:
Crédito financeiro recuperado junto ao fornecedor. Pode existir independentemente de uma devolução logística.
_Avoid_: Devolução física, recebimento de mercadoria.


**Mercadoria em trânsito**:
Quantidade adquirida cuja expectativa de recebimento permanece aberta, descontados recebimentos, perdas e recusas vigentes.

**Devolvida antes do recebimento**:
Identificação de uma compra cuja quantidade foi integralmente recusada antes de qualquer recebimento, sem pendência restante.

**Parcialmente devolvida**:
Identificação de uma compra com devolução de parte da quantidade adquirida. Quando ainda há quantidade pendente, somente essa parcela continua em trânsito.
