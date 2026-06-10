/**
 * Menu lateral fixo — visível apenas em desktop (≥ 768px via CSS).
 * No mobile o equivalente é o MobileDrawer, acessado pelo botão ☰.
 */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "../ui/Icon";

function Sidebar({ items, basePath, hideExitOnHome = false, className = "" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isHome = location.pathname === basePath || location.pathname === `${basePath}/`;

  /** hideExitOnHome permite ocultar "Sair" na tela inicial de boas-vindas */
  const showExit = !(hideExitOnHome && isHome);

  function handleLogout() {
    logout();
    navigate("/");
  }

  /** Marca o link ativo: correspondência exata para a raiz, startsWith para sub-rotas */
  function isActive(path) {
    if (path === basePath) return location.pathname === path;
    return location.pathname.startsWith(path);
  }

  return (
    <aside className={`app-sidebar ${className}`.trim()}>
      <nav className="app-sidebar__nav app-sidebar__nav--top">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`app-sidebar__link ${isActive(item.path) ? "is-active" : ""}`}
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {showExit && (
        <button type="button" className="app-sidebar__exit" onClick={handleLogout}>
          <Icon name="log-out" size={18} />
          <span>Sair</span>
        </button>
      )}
    </aside>
  );
}

export default Sidebar;
