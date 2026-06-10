import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Bell, ChevronDown, ShoppingCart, UserCircle2, Utensils } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { bottomNavAluno, menuAluno } from "../../config/navigation";
import AppBottomNav from "./AppBottomNav";
import MobileDrawer from "./MobileDrawer";
import MobileTopBar from "./MobileTopBar";
import Sidebar from "./Sidebar";
import "../../pages/aluno/aluno.css";

function AlunoShell() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quantidadeCarrinho, setQuantidadeCarrinho] = useState(0);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef(null);

  const nomeExibicao = user?.nome || "Nome do Aluno";
  const primeiroNome = nomeExibicao.split(" ")[0];

  useEffect(() => {
    function handleClickFora(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  function sair() {
    setMenuAberto(false);
    logout();
    toast.success("Você saiu com sucesso.");
    navigate("/");
  }

  // Chave única por aluno para leitura do carrinho no header
  const carrinhoKey = `carrinho_aluno_${user?.id ?? user?.email ?? "anonimo"}`;

  useEffect(() => {
    function atualizarQuantidadeCarrinho() {
      const carrinho = JSON.parse(localStorage.getItem(carrinhoKey)) || [];
      setQuantidadeCarrinho(carrinho.length);
    }

    atualizarQuantidadeCarrinho();

    window.addEventListener("storage", atualizarQuantidadeCarrinho);

    const intervalo = setInterval(atualizarQuantidadeCarrinho, 500);

    return () => {
      window.removeEventListener("storage", atualizarQuantidadeCarrinho);
      clearInterval(intervalo);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carrinhoKey]);

  useEffect(() => {
    carregarNotificacoesNaoLidas();

    const intervalo = setInterval(carregarNotificacoesNaoLidas, 3000);

    return () => clearInterval(intervalo);
  }, []);

  async function carregarNotificacoesNaoLidas() {
    try {
      const data = await api.get("/Notificacoes/minhas");
      const totalNaoLidas = data.filter((notificacao) => !notificacao.lida).length;

      setNotificacoesNaoLidas(totalNaoLidas);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    }
  }

  return (
    <div className="aluno-layout">
      <MobileTopBar
        variant="primary"
        onMenuClick={() => setDrawerOpen(true)}
        onNotificacoesClick={() => navigate("/aluno/notificacoes")}
      />

      <header className="aluno-topbar aluno-topbar--desktop">
        <div className="aluno-topbar__brand">
          <div className="aluno-topbar__brand-icon" aria-hidden="true">
            <Utensils size={22} />
          </div>
          <div className="aluno-topbar__brand-text">
            <strong>Food Pay</strong>
            <span>Sistema de Gestão de Alimentação</span>
          </div>
        </div>

        <div className="aluno-topbar__actions">
          <button
            type="button"
            className="icon-btn icon-btn--light"
            aria-label="Carrinho"
            style={{ position: "relative" }}
            onClick={() => navigate("/aluno/carrinho")}
          >
            <ShoppingCart size={20} />

            {quantidadeCarrinho > 0 && (
              <span style={badgeStyle}>{quantidadeCarrinho}</span>
            )}
          </button>

          <button
            type="button"
            className="icon-btn icon-btn--light"
            aria-label="Notificações"
            style={{ position: "relative" }}
            onClick={() => navigate("/aluno/notificacoes")}
          >
            <Bell size={20} />

            {notificacoesNaoLidas > 0 && (
              <span style={badgeStyle}>{notificacoesNaoLidas}</span>
            )}
          </button>

          <div style={{ position: "relative" }} ref={menuRef}>
            <button
              type="button"
              className="user-pill user-pill--light"
              onClick={() => setMenuAberto((v) => !v)}
            >
              <UserCircle2 size={28} />
              <span>{nomeExibicao}</span>
              <ChevronDown size={16} />
            </button>

            {menuAberto && (
              <div style={dropdownStyle}>
                <button
                  type="button"
                  style={dropdownItemStyle}
                  onClick={() => {
                    setMenuAberto(false);
                    navigate("/aluno/perfil");
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
        </div>
      </header>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={menuAluno}
        basePath="/aluno"
      />

      <div className="aluno-body">
        <Sidebar
          items={menuAluno}
          basePath="/aluno"
          className="app-sidebar--desktop"
        />

        <div className="aluno-main">
          <div className="app-content app-content--aluno">
            <Outlet context={{ primeiroNome }} />
          </div>

          <footer className="app-footer app-footer--aluno app-footer--desktop">
            © 2026 Food Pay - Todos os direitos reservados.
          </footer>
        </div>
      </div>

      <AppBottomNav items={bottomNavAluno} />
    </div>
  );
}

const badgeStyle = {
  position: "absolute",
  top: "-6px",
  right: "-6px",
  background: "red",
  color: "white",
  borderRadius: "50%",
  fontSize: "12px",
  minWidth: "18px",
  height: "18px",
  padding: "0 5px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
};

const dropdownStyle = {
  position: "absolute",
  top: "52px",
  right: "0",
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
  padding: "8px",
  minWidth: "170px",
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
  fontWeight: 600,
};

const dropdownItemDangerStyle = {
  ...dropdownItemStyle,
  color: "#dc2626",
};

export default AlunoShell;
