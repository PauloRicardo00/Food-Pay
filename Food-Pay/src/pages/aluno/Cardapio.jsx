/**
 * Cardápio do aluno — listagem completa de produtos disponíveis.
 * Suporta filtragem por categoria, busca textual e controle de estoque.
 */
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Search, ShoppingCart, Utensils, Tag, X } from "lucide-react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import "./aluno.css";

function Cardapio() {
  const { user } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [loading, setLoading] = useState(true);

  // Chave única por aluno
  const carrinhoKey = `carrinho_aluno_${user?.id ?? user?.email ?? "anonimo"}`;

  useEffect(() => {
    async function carregar() {
      try {
        const data = await api.get("/produtos");
        setProdutos(data);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar cardápio.");
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const produtosVisiveis = useMemo(
    () => produtos.filter((p) => p.disponivel || Number(p.estoque ?? 0) === 0),
    [produtos]
  );

  const categorias = useMemo(() => {
    const set = new Set(
      produtosVisiveis.map((p) => p.categoria).filter(Boolean)
    );
    return ["Todos", ...Array.from(set)];
  }, [produtosVisiveis]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return produtosVisiveis.filter((p) => {
      const matchCat = categoriaAtiva === "Todos" || p.categoria === categoriaAtiva;
      const matchBusca =
        !termo ||
        p.nome?.toLowerCase().includes(termo) ||
        p.descricao?.toLowerCase().includes(termo);
      return matchCat && matchBusca;
    });
  }, [produtosVisiveis, busca, categoriaAtiva]);

  function adicionarCarrinho(produto) {
    const estoque = Number(produto.estoque ?? 0);

    if (!produto.disponivel || estoque <= 0) {
      toast.error("Produto esgotado ou indisponível.");
      return;
    }

    const carrinhoAtual = JSON.parse(localStorage.getItem(carrinhoKey)) || [];
    const quantidadeAtual = carrinhoAtual
      .filter((item) => item.id === produto.id)
      .reduce((total, item) => total + Number(item.quantidade || 1), 0);

    if (quantidadeAtual >= estoque) {
      toast.error(`Só existem ${estoque} unidade(s) disponíveis de ${produto.nome}.`);
      return;
    }

    const item = {
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagemUrl: produto.imagemUrl,
      estoque,
      quantidade: 1,
    };

    localStorage.setItem(carrinhoKey, JSON.stringify([...carrinhoAtual, item]));
    toast.success(`${produto.nome} adicionado ao carrinho!`);
  }

  return (
    <div className="cardapio-page">
      <header className="cardapio-header">
        <div>
          <h1>Cardápio</h1>
          <p>Escolha sua refeição e adicione ao carrinho</p>
        </div>

        <div className="cardapio-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar prato, lanche, bebida..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {busca && (
            <button type="button" onClick={() => setBusca("")} aria-label="Limpar">
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      <nav className="cardapio-tabs">
        {categorias.map((c) => (
          <button
            key={c}
            type="button"
            className={`cardapio-tab ${categoriaAtiva === c ? "is-active" : ""}`}
            onClick={() => {
              setCategoriaAtiva(c);
              if (c === "Todos") setBusca("");
            }}
          >
            <Tag size={14} />
            {c}
          </button>
        ))}
      </nav>

      {loading ? (
        <p className="cardapio-empty">Carregando cardápio...</p>
      ) : filtrados.length === 0 ? (
        <div className="cardapio-empty">
          <Utensils size={28} />
          <p>Nenhum produto encontrado.</p>
        </div>
      ) : (
        <div className="cardapio-grid">
          {filtrados.map((produto) => {
            const estoque = Number(produto.estoque ?? 0);
            const esgotado = !produto.disponivel || estoque <= 0;

            return (
              <article key={produto.id} className={`cardapio-card ${esgotado ? "is-sold-out" : ""}`}>
                <div className="cardapio-card-img">
                  {produto.imagemUrl ? (
                    <img src={produto.imagemUrl} alt={produto.nome} loading="lazy" />
                  ) : (
                    <div className="cardapio-card-placeholder">
                      <Utensils size={36} />
                    </div>
                  )}

                  <span
                    className={`cardapio-badge ${
                      esgotado ? "is-off" : "is-on"
                    }`}
                  >
                    {esgotado ? "Esgotado" : "Disponível"}
                  </span>
                </div>

                <div className="cardapio-card-body">
                  <div className="cardapio-card-head">
                    <h3>{produto.nome}</h3>
                    {produto.categoria && (
                      <span className="cardapio-card-cat">{produto.categoria}</span>
                    )}
                  </div>

                  {produto.descricao && (
                    <p className="cardapio-card-desc">{produto.descricao}</p>
                  )}

                  <p className={`cardapio-stock ${estoque <= 5 && estoque > 0 ? "is-low" : ""} ${esgotado ? "is-empty" : ""}`}>
                    {esgotado
                      ? "Produto esgotado"
                      : estoque <= 5
                        ? `Últimas unidades: ${estoque}`
                        : `Disponível: ${estoque} unidade(s)`}
                  </p>

                  <div className="cardapio-card-foot">
                    <strong className="cardapio-card-price">
                      R$ {Number(produto.preco).toFixed(2)}
                    </strong>

                    <button
                      type="button"
                      className="cardapio-card-btn"
                      onClick={() => adicionarCarrinho(produto)}
                      disabled={esgotado}
                    >
                      <ShoppingCart size={16} />
                      {esgotado ? "Esgotado" : "Adicionar"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Cardapio;
