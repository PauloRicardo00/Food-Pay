/**
 * Barra superior compacta visível só no celular (≤768px).
 * Botão ☰ abre o MobileDrawer; título central; sino de notificações.
 */
import { Bell, Menu } from "lucide-react";

function MobileTopBar({ title = "Food Pay", onMenuClick, variant = "default" }) {
  const isPrimary = variant === "primary";

  return (
    <header className={`mobile-topbar ${isPrimary ? "mobile-topbar--primary" : ""}`}>
      <button
        type="button"
        className={`mobile-topbar__btn ${isPrimary ? "mobile-topbar__btn--light" : ""}`}
        onClick={onMenuClick}
        aria-label="Abrir menu"
      >
        <Menu size={22} />
      </button>
      <span className="mobile-topbar__title">{title}</span>
      <button
        type="button"
        className={`mobile-topbar__btn ${isPrimary ? "mobile-topbar__btn--light" : ""}`}
        aria-label="Notificações"
      >
        <Bell size={20} />
      </button>
    </header>
  );
}

export default MobileTopBar;
