/**
 * Barra de navegação fixa na parte inferior do celular.
 * Exibe os 4 atalhos principais do perfil; o menu completo fica no MobileDrawer.
 * end: true nos itens força correspondência exata de URL para destacar o link ativo.
 */
import { Link, useLocation } from "react-router-dom";
import Icon from "../ui/Icon";

function AppBottomNav({ items }) {
  const location = useLocation();

  function isActive(path, end) {
    return end ? location.pathname === path : location.pathname.startsWith(path);
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
