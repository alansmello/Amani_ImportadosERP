import type { ComponentType } from "react";

export type NavigationModuleId =
  | "dashboard"
  | "clientes"
  | "produtos"
  | "compras"
  | "vendas"
  | "estoque"
  | "financeiro"
  | "configuracoes"
  | "mais";

export type NavigationGroup = "main" | "more";

export type ModuleStatus = "placeholder" | "ready";

export type NavigationIcon = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export type NavigationItem = {
  id: NavigationModuleId;
  label: string;
  href: string;
  icon: NavigationIcon;
  desktopVisible: boolean;
  mobileVisible: boolean;
  mobileOrder?: number;
  group?: NavigationGroup;
  status: ModuleStatus;
};
