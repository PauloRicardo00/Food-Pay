/**
 * Layout padrão de painéis (responsável e funcionário).
 * Estrutura igual à do Aluno: header full-width fixo no topo, sidebar abaixo.
 */
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../api/client";
import { contarNaoLidas, criarNotificacao } from "../../utils/notificacoes";
import { Bell, ChevronDown, UserCircle2, Utensils } from "lucide-react";
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
  const navigate = useNavigate();

  return (
    <div className="app-layout app-layout--stacked">
      <MobileTopBar
        onMenuClick={() => setDrawerOpen(true)}
        onNotificacoesClick={() => {
          const rota = menuItems?.find((i) => i.path?.includes("notificacoes"))?.path;
          if (rota) navigate(rota);
        }}
      />

      <header className="app-header app-header--desktop app-header--full">
        <div className="app-header__brand">
          <div className="app-header__brand-icon" aria-hidden="true">
            <Utensils size={22} />
          </div>
          <div className="app-header__brand-text">
            <strong>Food Pay</strong>
            <span>Sistema de Gestão de Alimentação</span>
          </div>
        </div>

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

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={menuItems}
        basePath={basePath}
        hideExitOnHome={hideExitOnHome}
      />

      <div className="app-body">
        <Sidebar
          items={menuItems}
          basePath={basePath}
          hideExitOnHome={hideExitOnHome}
          className="app-sidebar--desktop"
        />

        <div className="app-main">
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
    </div>
  );
}

function HeaderActions({ userLabel, basePath }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const [totalNotificacoes, setTotalNotificacoes] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickFora(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  useEffect(() => {
    let ativo = true;

    async function atualizarTotalNotificacoes() {
      try {
        if (basePath.includes("responsavel")) {
          const data = await api.get("/Notificacoes/minhas");
          if (ativo) setTotalNotificacoes(data.filter((n) => !n.lida).length);
          return;
        }

        if (basePath.includes("funcionario")) {
          const pedidos = await api.get("/pedidos");
          const pedidosPendentes = Array.isArray(pedidos)
            ? pedidos.filter((pedido) => pedido.status === "Pendente")
            : [];

          pedidosPendentes.forEach((pedido) => {
            criarNotificacao(
              "funcionario",
              `Novo pedido #${pedido.id} recebido${pedido.alunoNome ? ` de ${pedido.alunoNome}` : ""}.`,
              user,
              {
                id: `pedido-${pedido.id}`,
                pedidoId: pedido.id,
                dataEnvio: pedido.dataPedido ?? new Date().toISOString(),
              },
            );
          });

          if (ativo) setTotalNotificacoes(contarNaoLidas("funcionario", user));
          return;
        }

        if (ativo) setTotalNotificacoes(0);
      } catch (error) {
        console.error("Erro ao carregar contador de notificações:", error);
        if (ativo) setTotalNotificacoes(0);
      }
    }

    atualizarTotalNotificacoes();
    const intervalo = setInterval(atualizarTotalNotificacoes, 3000);

    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, [basePath, user]);

  function sair() {
    logout();
    toast.success("Você saiu com sucesso.");
    navigate("/");
  }

  return (
    <div className="app-header__actions" style={{ position: "relative" }} ref={menuRef}>
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
            onClick={() => {
              setMenuAberto(false);
              navigate(`${basePath}/perfil`);
            }}
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
  boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
  padding: "8px",
  minWidth: "180px",
  zIndex: 9999,
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
