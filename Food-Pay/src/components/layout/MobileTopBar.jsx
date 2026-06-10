/**
 * Barra superior compacta exibida apenas em mobile (≤ 768px via CSS).
 * Contém o botão Menu que abre o MobileDrawer, o título central e o sino de notificações.
 */
import { Bell, Menu } from "lucide-react";

function MobileTopBar({ title = "Food Pay", onMenuClick, onNotificacoesClick, variant = "default" }) {
  const isPrimary = variant === "primary";

  return (
    <header className={`mobile-topbar ${isPrimary ? "mobile-topbar--primary" : ""}`}>
      <button
        type="button"
        className={`mobile-topbar__btn mobile-topbar__btn--menu ${isPrimary ? "mobile-topbar__btn--light" : ""}`}
        onClick={onMenuClick}
        aria-label="Abrir menu"
      >
        <Menu size={22} />
        <span className="mobile-topbar__btn-label">Menu</span>
      </button>

      <span className="mobile-topbar__title">{title}</span>

      <button
        type="button"
        className={`mobile-topbar__btn ${isPrimary ? "mobile-topbar__btn--light" : ""}`}
        aria-label="Notificações"
        onClick={onNotificacoesClick}
      >
        <Bell size={20} />
      </button>
    </header>
  );
}

export default MobileTopBar;
