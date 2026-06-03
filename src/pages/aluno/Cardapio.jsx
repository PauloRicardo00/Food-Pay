import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Search, ShoppingCart, Utensils, Tag, X } from "lucide-react";
import { api } from "../../api/client";
import "./aluno.css";

function Cardapio() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [loading, setLoading] = useState(true);

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

  const categorias = useMemo(() => {
    const set = new Set(produtos.map((p) => p.categoria).filter(Boolean));
    return ["Todos", ...Array.from(set)];
  }, [produtos]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return produtos.filter((p) => {
      const matchCat = categoriaAtiva === "Todos" || p.categoria === categoriaAtiva;
      const matchBusca =
        !termo ||
        p.nome?.toLowerCase().includes(termo) ||
        p.descricao?.toLowerCase().includes(termo);
      return matchCat && matchBusca;
    });
  }, [produtos, busca, categoriaAtiva]);

  function adicionarCarrinho(produto) {
    const carrinhoAtual = JSON.parse(localStorage.getItem("carrinho")) || [];
    const item = {
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagemUrl: produto.imagemUrl,
    };
    localStorage.setItem("carrinho", JSON.stringify([...carrinhoAtual, item]));
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
            onClick={() => setCategoriaAtiva(c)}
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
          {filtrados.map((produto) => (
            <article key={produto.id} className="cardapio-card">
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
                    produto.disponivel ? "is-on" : "is-off"
                  }`}
                >
                  {produto.disponivel ? "Disponível" : "Indisponível"}
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

                <div className="cardapio-card-foot">
                  <strong className="cardapio-card-price">
                    R$ {Number(produto.preco).toFixed(2)}
                  </strong>

                  <button
                    type="button"
                    className="cardapio-card-btn"
                    onClick={() => adicionarCarrinho(produto)}
                    disabled={!produto.disponivel}
                  >
                    <ShoppingCart size={16} />
                    Adicionar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Cardapio;
