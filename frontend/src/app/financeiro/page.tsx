import { redirect } from "next/navigation";

import { routes } from "@/config/routes";

export default function FinanceiroPage() {
  redirect(routes.contasReceber);
}
