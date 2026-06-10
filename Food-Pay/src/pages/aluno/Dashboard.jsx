/**
 * Dashboard do aluno — tela inicial após login.
 * Exibe saldo disponível, cardápio do dia e os últimos pedidos.
 * Permite adicionar itens ao carrinho diretamente desta tela.
 */
import { CheckCircle2, Clock, Plus, ShoppingBag, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import StatusBadge from "../../components/ui/StatusBadge";
import { ErrorState, LoadingState } from "../../components/ui/DataState";
import { useAlunoDashboard } from "../../hooks/useAlunoDashboard";
import { useAuth } from "../../context/AuthContext";
import "./aluno.css";

function DashboardAluno() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Chave única por aluno
  const carrinhoKey = `carrinho_aluno_${user?.id ?? user?.email ?? "anonimo"}`;

  const { primeiroNome = "Aluno" } = useOutletContext() ?? {};
  const { data, loading, error, refetch } = useAlunoDashboard();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return null;

  function handleAdicionar(produto) {
    const carrinhoAtual = JSON.parse(localStorage.getItem(carrinhoKey)) || [];

    const produtoFormatado = {
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco || produto.valor || 8.5,
    };

    const novoCarrinho = [...carrinhoAtual, produtoFormatado];

    localStorage.setItem(carrinhoKey, JSON.stringify(novoCarrinho));

    toast.success(`${produto.nome} adicionado ao carrinho!`);
  }

  return (
    <div className="aluno-dashboard">
      <header className="aluno-home-greeting">
        <h1>Olá, {primeiroNome} 👋</h1>
        <p>O que deseja fazer hoje?</p>
      </header>

      <button
        type="button"
        className="aluno-mobile-cta"
        onClick={() => navigate("/aluno/cardapio")}
      >
        <span className="aluno-mobile-cta__icon">
          <ShoppingBag size={24} />
        </span>

        <span>Fazer novo pedido</span>
      </button>

      <div className="aluno-dashboard__grid">
        <section className="panel-card cardapio-panel">
          <h3>Cardápio de hoje</h3>

          <div className="produtos-grid">
            {data.cardapio.map((produto) => (
              <article key={produto.id} className="produto-card">
                <img src={produto.imagem} alt={produto.nome} />

                <p>{produto.nome}</p>

                <button type="button" onClick={() => handleAdicionar(produto)}>
                  Adicionar
                </button>
              </article>
            ))}
          </div>
        </section>

        <div className="aluno-side">
          <div className="aluno-side__top">
            <div className="saldo-card">
              <h4>Saldo disponibilizado</h4>

              <div className="saldo-card__valor">
                <Wallet size={22} />
                <strong>{data.saldoFormatado}</strong>
              </div>

              <Link to="/aluno/historico" className="saldo-card__link">
                Histórico de Compras
              </Link>
            </div>

            <button
              type="button"
              className="novo-pedido-btn"
              onClick={() => navigate("/aluno/cardapio")}
            >
              <span className="novo-pedido-btn__icon">
                <Plus size={28} />
              </span>

              <span>Fazer um novo pedido</span>
            </button>
          </div>

          <section className="panel-card pedidos-panel">
            <div className="panel-card__header">
              <h3>Últimos pedidos</h3>

              <Link to="/aluno/pedidos">Ver todos</Link>
            </div>

            <ul className="pedidos-aluno-list">
              {data.ultimosPedidos.map((pedido) => (
                <li key={pedido.id}>
                  <span
                    className={`pedido-status-icon ${
                      pedido.status === "Entregue" ? "is-done" : "is-pending"
                    }`}
                  >
                    {pedido.status === "Entregue" ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <Clock size={18} />
                    )}
                  </span>

                  <div>
                    <small>{pedido.data}</small>
                    <p>{pedido.item}</p>
                  </div>

                  <div className="pedidos-aluno-list__right">
                    <strong>{pedido.valorFormatado}</strong>
                    <StatusBadge status={pedido.status} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default DashboardAluno;
