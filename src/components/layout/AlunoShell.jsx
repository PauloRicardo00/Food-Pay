import { useEffect, useState } from "react";
import { Bell, ChevronDown, ShoppingCart, UserCircle2 } from "lucide-react";
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
  const { user } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quantidadeCarrinho, setQuantidadeCarrinho] = useState(0);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);

  const nomeExibicao = user?.nome || "Nome do Aluno";
  const primeiroNome = nomeExibicao.split(" ")[0];

  useEffect(() => {
    function atualizarQuantidadeCarrinho() {
      const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
      setQuantidadeCarrinho(carrinho.length);
    }

    atualizarQuantidadeCarrinho();

    window.addEventListener("storage", atualizarQuantidadeCarrinho);

    const intervalo = setInterval(atualizarQuantidadeCarrinho, 500);

    return () => {
      window.removeEventListener("storage", atualizarQuantidadeCarrinho);
      clearInterval(intervalo);
    };
  }, []);

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
      <MobileTopBar variant="primary" onMenuClick={() => setDrawerOpen(true)} />

      <header className="aluno-topbar aluno-topbar--desktop">
        <div className="aluno-topbar__logo">SESI</div>

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

          <button
            type="button"
            className="user-pill user-pill--light"
            onClick={() => navigate("/aluno/perfil")}
          >
            <span>{nomeExibicao}</span>
            <UserCircle2 size={28} />
            <ChevronDown size={16} />
          </button>
        </div>
      </header>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={menuAluno}
        basePath="/aluno"
        hideExitOnHome
      />

      <div className="aluno-body">
        <Sidebar
          items={menuAluno}
          basePath="/aluno"
          hideExitOnHome
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

export default AlunoShell;