/**
 * Navegação fixa na parte inferior do celular (atalhos principais).
 * Complementa o MobileDrawer, que tem o menu completo.
 */
import { Link, useLocation } from "react-router-dom";
import Icon from "../ui/Icon";

function AppBottomNav({ items }) {
  const location = useLocation();

  function isActive(path, end) {
    if (end) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  }

  return (
    <nav className="app-bottom-nav" aria-label="Navegação principal">
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`app-bottom-nav__link ${isActive(item.path, item.end) ? "is-active" : ""}`}
        >
          <Icon name={item.icon} size={22} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default AppBottomNav;
