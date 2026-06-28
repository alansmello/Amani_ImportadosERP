# Contract: Operational Identifier Presentation

This is the closed inventory for removing technical identifiers in F021. IDs remain mandatory in routes, keys, payloads, caches and relationships; only the listed user-facing presentation changes.

| Operational surface | File | Current technical presentation | Required presentation |
| --- | --- | --- | --- |
| Supplier list, mobile cards | `frontend/src/components/fornecedores/supplier-table.tsx` | `ID: {supplier.id}` | Phone or “Não informado” |
| Supplier list, desktop table | `frontend/src/components/fornecedores/supplier-table.tsx` | “Identificador” column with full GUID | “Telefone” column with phone or “Não informado” |
| Supplier detail header/card | `frontend/src/components/fornecedores/supplier-details.tsx` | `ID` and “Identificador” | Supplier name and phone or “Não informado” |
| Customer detail header | `frontend/src/components/clientes/customer-details.tsx` | `ID: {customer.id}` | Customer name/status/contact only |
| Product detail header | `frontend/src/components/produtos/product-details.tsx` | `ID: {product.id}` | Product name and operational fields only |
| Receivables list customer fallback | `frontend/src/components/financeiro/receivables-list.tsx` | First eight characters of Customer GUID | “Cliente não encontrado” or “Referência indisponível” according to state |
| Customer receivables page heading | `frontend/src/app/financeiro/contas-receber/cliente/[clienteId]/page.tsx` | First eight characters of Customer GUID | Customer name when available; otherwise “Cliente não encontrado”/“Referência indisponível” |
| Stock search prompt | `frontend/src/components/estoque/stock-filters.tsx` | “Produto, código ou identificador” | Operational wording without suggesting technical identifier |

## Validation boundary

- Search these surfaces for full GUID rendering, eight-character GUID fallbacks, `ID:` and “Identificador”.
- Do not remove `id`/`Id` from TypeScript or API types.
- Do not change route parameters, React keys, query keys, relationship payloads or persistence identifiers.
- Occurrences such as array `.slice(0, 8)` that limit result counts rather than abbreviate an identifier are outside this contract.
