import {
  Building2,
  Boxes,
  ClipboardList,
  CreditCard,
  Home,
  MoreHorizontal,
  Package,
  Settings,
  ShoppingCart,
  Users
} from "lucide-react";

import { routes } from "@/config/routes";
import type { NavigationItem } from "@/types/navigation";

export const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: routes.dashboard,
    icon: Home,
    desktopVisible: true,
    mobileVisible: true,
    mobileOrder: 1,
    group: "main",
    status: "placeholder"
  },
  {
    id: "clientes",
    label: "Clientes",
    href: routes.clientes,
    icon: Users,
    desktopVisible: true,
    mobileVisible: false,
    group: "more",
    status: "placeholder"
  },
  {
    id: "fornecedores",
    label: "Fornecedores",
    href: routes.fornecedores,
    icon: Building2,
    desktopVisible: true,
    mobileVisible: false,
    group: "more",
    status: "ready"
  },
  {
    id: "produtos",
    label: "Produtos",
    href: routes.produtos,
    icon: Package,
    desktopVisible: true,
    mobileVisible: false,
    group: "more",
    status: "placeholder"
  },
  {
    id: "compras",
    label: "Compras",
    href: routes.compras,
    icon: ClipboardList,
    desktopVisible: true,
    mobileVisible: true,
    mobileOrder: 4,
    group: "main",
    status: "ready"
  },
  {
    id: "vendas",
    label: "Vendas",
    href: routes.vendas,
    icon: ShoppingCart,
    desktopVisible: true,
    mobileVisible: true,
    mobileOrder: 2,
    group: "main",
    status: "placeholder"
  },
  {
    id: "estoque",
    label: "Estoque",
    href: routes.estoque,
    icon: Boxes,
    desktopVisible: true,
    mobileVisible: true,
    mobileOrder: 3,
    group: "main",
    status: "placeholder"
  },
  {
    id: "financeiro",
    label: "Financeiro",
    href: routes.financeiro,
    icon: CreditCard,
    desktopVisible: true,
    mobileVisible: false,
    group: "more",
    status: "placeholder"
  },
  {
    id: "configuracoes",
    label: "Configuracoes",
    href: routes.configuracoes,
    icon: Settings,
    desktopVisible: true,
    mobileVisible: false,
    group: "more",
    status: "ready"
  },
  {
    id: "mais",
    label: "Mais",
    href: routes.clientes,
    icon: MoreHorizontal,
    desktopVisible: false,
    mobileVisible: true,
    mobileOrder: 5,
    group: "more",
    status: "placeholder"
  }
] as const satisfies readonly NavigationItem[];

export const desktopNavigationItems = navigationItems.filter(
  (item) => item.desktopVisible
);

export const mobileNavigationItems = navigationItems
  .filter((item) => item.mobileVisible)
  .sort((a, b) => (a.mobileOrder ?? 99) - (b.mobileOrder ?? 99));

export const moreNavigationItems = navigationItems.filter(
  (item) => item.group === "more" && item.id !== "mais"
);
