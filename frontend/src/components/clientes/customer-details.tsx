import { Badge } from "@/components/ui/badge";
import type { Customer } from "@/types/customer";

type CustomerStatusBadgeProps = {
  active: boolean;
};

type CustomerDetailsProps = {
  customer?: Customer;
};

export function CustomerStatusBadge({ active }: CustomerStatusBadgeProps) {
  return (
    <Badge variant={active ? "success" : "neutral"}>
      {active ? "Ativo" : "Inativo"}
    </Badge>
  );
}

export function CustomerDetails({ customer }: CustomerDetailsProps) {
  if (!customer) {
    return null;
  }

  return <CustomerStatusBadge active={customer.ativo} />;
}
