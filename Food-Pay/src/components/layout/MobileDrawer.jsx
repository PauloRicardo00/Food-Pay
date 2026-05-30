/**
 * Menu lateral deslizante no celular (gaveta).
 * Lista todos os itens do perfil + botão Sair (exceto na home se hideExitOnHome).
 */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Icon from "../ui/Icon";

function MobileDrawer({ open, onClose, items, basePath, hideExitOnHome = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isHome =
    location.pathname === basePath || location.pathname === `${basePath}/`;
  const showExit = !(hideExitOnHome && isHome);

  function isActive(path) {
    if (path === basePath) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  }

  function handleLogout() {
    onClose();
    logout();
    navigate("/");
  }

  function handleNavClick() {
    onClose();
  }

  // Não renderiza nada se fechado — evita foco em elementos invisíveis
  if (!open) return null;

  return (
    <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Menu">
      <button type="button" className="mobile-drawer__backdrop" onClick={onClose} aria-label="Fechar menu" />
      <aside className="mobile-drawer__panel">
        <div className="mobile-drawer__head">
          <div className="mobile-drawer__brand">
            <span className="mobile-drawer__logo" aria-hidden="true">
              <Icon name="utensils" size={20} />
            </span>
            <div>
              <strong>Food Pay</strong>
              <span>Sistema de Gestão de Alimentação</span>
            </div>
          </div>
          <button type="button" className="mobile-drawer__close" onClick={onClose} aria-label="Fechar">
            <X size={22} />
          </button>
        </div>

        <nav className="mobile-drawer__nav">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-drawer__link ${isActive(item.path) ? "is-active" : ""}`}
              onClick={handleNavClick}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {showExit && (
          <button type="button" className="mobile-drawer__exit" onClick={handleLogout}>
            <Icon name="log-out" size={18} />
            <span>Sair</span>
          </button>
        )}
      </aside>
    </div>
  );
}

export default MobileDrawer;
