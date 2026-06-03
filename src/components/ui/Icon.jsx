/**
 * Ícones centralizados — recebe nome string e renderiza o componente Lucide correspondente.
 * Evita importar dezenas de ícones em cada arquivo de menu.
 */
import {
  BarChart3,
  Bell,
  BookOpen,
  ChevronRight,
  ClipboardList,
  CreditCard,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  Plus,
  Receipt,
  Settings,
  Shield,
  ShoppingCart,
  User,
  Users,
  UtensilsCrossed,
} from "lucide-react";

const icons = {
  "layout-dashboard": LayoutDashboard,
  "clipboard-list": ClipboardList,
  "credit-card": CreditCard,
  "book-open": BookOpen,
  "bar-chart-3": BarChart3,
  settings: Settings,
  home: Home,
  history: History,
  user: User,
  users: Users,
  shield: Shield,
  receipt: Receipt,
  bell: Bell,
  "shopping-cart": ShoppingCart,
  "chevron-right": ChevronRight,
  plus: Plus,
  "log-out": LogOut,
  utensils: UtensilsCrossed,
};

function Icon({ name, size = 20, className = "" }) {
  const LucideIcon = icons[name];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} className={className} aria-hidden="true" />;
}

export default Icon;
