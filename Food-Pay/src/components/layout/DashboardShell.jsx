/**
 * Layout padrão de painéis (responsável e funcionário).
 * Desktop: sidebar + cabeçalho. Mobile: barra superior, gaveta e menu inferior.
 */
import { useEffect, useState } from "react";
import { contarNaoLidas } from "../../utils/notificacoes";
import { Bell, ChevronDown, UserCircle2 } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AppBottomNav from "./AppBottomNav";
import MobileDrawer from "./MobileDrawer";
import MobileTopBar from "./MobileTopBar";
import Sidebar from "./Sidebar";

function DashboardShell({
  menuItems,
  basePath,
  pageTitle,
  userLabel,
  greeting,
  bottomNavItems,
  hideExitOnHome = false,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        items={menuItems}
        basePath={basePath}
        hideExitOnHome={hideExitOnHome}
        className="app-sidebar--desktop"
      />

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={menuItems}
        basePath={basePath}
        hideExitOnHome={hideExitOnHome}
      />

      <div className="app-main">
        <MobileTopBar onMenuClick={() => setDrawerOpen(true)} />

        <header className="app-header app-header--desktop">
          {greeting ? (
            <div className="app-header__greeting">
              <h1>{greeting}</h1>
              {pageTitle && <p>{pageTitle}</p>}
            </div>
          ) : (
            <h1 className="app-header__title">{pageTitle}</h1>
          )}

          <HeaderActions userLabel={userLabel} basePath={basePath} />
        </header>

        {greeting && (
          <div className="app-mobile-greeting">
            <h1>{greeting}</h1>
            {pageTitle && <p>{pageTitle}</p>}
          </div>
        )}

        <div className="app-content">
          <Outlet />
        </div>

        <footer className="app-footer app-footer--desktop">
          © 2026 Food Pay - Todos os direitos reservados.
        </footer>

        {bottomNavItems?.length > 0 && <AppBottomNav items={bottomNavItems} />}
      </div>
    </div>
  );
}

function HeaderActions({ userLabel, basePath }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const [totalNotificacoes, setTotalNotificacoes] = useState(0);

  useEffect(() => {
    let perfil = "aluno";

    if (basePath.includes("funcionario")) {
      perfil = "funcionario";
    }

    if (basePath.includes("responsavel")) {
      perfil = "responsavel";
    }

    setTotalNotificacoes(contarNaoLidas(perfil));

    const intervalo = setInterval(() => {
      setTotalNotificacoes(contarNaoLidas(perfil));
    }, 1000);

    return () => clearInterval(intervalo);
  }, [basePath]);

  function sair() {
    logout();
    navigate("/");
  }

  return (
    <div className="app-header__actions" style={{ position: "relative" }}>
      <button
        type="button"
        className="icon-btn"
        aria-label="Notificações"
        onClick={() => navigate(`${basePath}/notificacoes`)}
        style={{ position: "relative" }}
      >
        <Bell size={20} />

        {totalNotificacoes > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              background: "#ef4444",
              color: "#fff",
              borderRadius: "999px",
              minWidth: "18px",
              height: "18px",
              padding: "0 4px",
              fontSize: "11px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {totalNotificacoes}
          </span>
        )}
      </button>

      <button
        type="button"
        className="user-pill"
        onClick={() => setMenuAberto((valor) => !valor)}
      >
        <UserCircle2 size={28} />
        <span>{userLabel}</span>
        <ChevronDown size={16} />
      </button>

      {menuAberto && (
        <div style={dropdownStyle}>
          <button
            type="button"
            style={dropdownItemStyle}
            onClick={() => navigate(`${basePath}/perfil`)}
          >
            Meu perfil
          </button>

          <button
            type="button"
            style={dropdownItemDangerStyle}
            onClick={sair}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

const dropdownStyle = {
  position: "absolute",
  top: "52px",
  right: "0",
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  padding: "8px",
  minWidth: "160px",
  zIndex: 999,
};

const dropdownItemStyle = {
  width: "100%",
  border: "none",
  background: "transparent",
  padding: "10px 12px",
  textAlign: "left",
  cursor: "pointer",
  borderRadius: "8px",
  color: "#0f172a",
};

const dropdownItemDangerStyle = {
  ...dropdownItemStyle,
  color: "#dc2626",
};

export default DashboardShell;