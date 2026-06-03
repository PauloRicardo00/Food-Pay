/**
 * Menu lateral fixo (somente desktop).
 * No celular o menu equivalente é o MobileDrawer (botão ☰).
 */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "../ui/Icon";

function Sidebar({ items, basePath, hideExitOnHome = false, className = "" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Na página inicial do perfil, opcionalmente esconde "Sair" (ex.: boas-vindas do aluno)
  const isHome =
    location.pathname === basePath || location.pathname === `${basePath}/`;
  const showExit = !(hideExitOnHome && isHome);

  function handleLogout() {
    logout();
    navigate("/");
  }

  /** Destaca o link da rota atual */
  function isActive(path) {
    if (path === basePath) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  }

  return (
    <aside className={`app-sidebar ${className}`.trim()}>
      <div className="app-sidebar__brand">
        <div className="app-sidebar__logo" aria-hidden="true">
          <Icon name="utensils" size={22} />
        </div>
        <div className="app-sidebar__text">
          <strong>Food Pay</strong>
          <span>Sistema de Gestão de Alimentação</span>
        </div>
      </div>

      <nav className="app-sidebar__nav">
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
