/**
 * Componente de ícone unificado baseado em Lucide React.
 *
 * Recebe o nome do ícone como string (mesmo valor usado nos arrays de menu
 * em navigation.js) e renderiza o SVG correspondente, centralizando todas
 * as importações de ícones em um único lugar.
 */
import {
  BarChart3, Bell, BookOpen, ChevronRight, ClipboardList,
  CreditCard, History, Home, LayoutDashboard, LogOut,
  Plus, Receipt, Settings, Shield, ShoppingCart,
  User, Users, UtensilsCrossed,
} from "lucide-react";

const icons = {
  "layout-dashboard": LayoutDashboard,
  "clipboard-list":   ClipboardList,
  "credit-card":      CreditCard,
  "book-open":        BookOpen,
  "bar-chart-3":      BarChart3,
  "shopping-cart":    ShoppingCart,
  "chevron-right":    ChevronRight,
  "log-out":          LogOut,
  settings:           Settings,
  home:               Home,
  history:            History,
  user:               User,
  users:              Users,
  shield:             Shield,
  receipt:            Receipt,
  bell:               Bell,
  plus:               Plus,
  utensils:           UtensilsCrossed,
};

/** Retorna null silenciosamente se o nome não for encontrado no mapa */
function Icon({ name, size = 20, className = "" }) {
  const LucideIcon = icons[name];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} className={className} aria-hidden="true" />;
}

export default Icon;
