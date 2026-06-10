/**
 * Gerenciamento do cardápio — CRUD de produtos.
 * Permite criar, editar estoque, ativar/desativar, excluir e fazer upload de imagem
 * para cada item. Produtos inativos não aparecem para os alunos.
 */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  ImageIcon,
  Package,
  PlusCircle,
  Power,
  Search,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { api, getApiErrorMessage, getToken } from "../../api/client";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

function CardapioFuncionario() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [confirmState, setConfirmState] = useState(null);
  const [estoquesEditados, setEstoquesEditados] = useState({});
  const [salvandoEstoqueId, setSalvandoEstoqueId] = useState(null);

  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    descricao: "",
    preco: "",
    estoque: "",
    imagemUrl: "",
  });

  async function carregarProdutos() {
    try {
      const data = await api.get("/produtos");
      setProdutos(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar produtos.");
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function uploadImagem(arquivo) {
    if (!arquivo) return;

    const formData = new FormData();
    formData.append("Arquivo", arquivo);

    try {
      const token = getToken();
      const response = await fetch(
        "https://localhost:7135/api/Produtos/upload-imagem",
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Erro ao enviar imagem.");

      const data = await response.json();

      setNovoProduto((p) => ({ ...p, imagemUrl: data.imagemUrl }));
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar imagem.");
    }
  }

  function normalizarNumero(valor) {
    return Number(String(valor || "").replace(",", "."));
  }

  async function cadastrarProduto() {
    if (!novoProduto.nome || !novoProduto.preco) {
      toast("Informe pelo menos nome e preço.");
      return;
    }

    const preco = normalizarNumero(novoProduto.preco);
    const estoque = Number(novoProduto.estoque || 0);

    if (!preco || preco <= 0) {
      toast.error("Informe um preço válido.");
      return;
    }

    if (preco > 9999.99) {
      toast.error("O preço máximo permitido é R$ 9.999,99.");
      return;
    }

    if (!Number.isInteger(estoque) || estoque < 0) {
      toast.error("Informe uma quantidade de estoque válida.");
      return;
    }

    try {
      await api.post("/produtos", {
        nome: novoProduto.nome,
        descricao: novoProduto.descricao,
        preco,
        estoque,
        imagemUrl: novoProduto.imagemUrl,
        disponivel: estoque > 0,
        categoriaId: 1,
      });

      setNovoProduto({ nome: "", descricao: "", preco: "", estoque: "", imagemUrl: "" });
      carregarProdutos();
      toast.success("Produto cadastrado!");
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Erro ao cadastrar produto."));
    }
  }

  function confirmarAlterarDisponibilidade(produto) {
    if (!produto.disponivel && Number(produto.estoque || 0) <= 0) {
      toast.error("Defina estoque maior que zero antes de ativar o produto.");
      return;
    }

    setConfirmState({
      title: produto.disponivel ? "Desativar produto?" : "Ativar produto?",
      description: produto.disponivel
        ? "Este produto não aparecerá mais para os alunos, mas o histórico de pedidos será mantido."
        : "Este produto voltará a aparecer no cardápio dos alunos se houver estoque disponível.",
      confirmLabel: produto.disponivel ? "Confirmar desativação" : "Confirmar ativação",
      cancelLabel: "Cancelar",
      variant: produto.disponivel ? "danger" : "default",
      onConfirm: () => alterarDisponibilidade(produto),
    });
  }

  async function alterarDisponibilidade(produto) {
    try {
      await api.put(`/produtos/${produto.id}`, {
        ...produto,
        disponivel: !produto.disponivel,
        estoque: Number(produto.estoque || 0),
      });
      carregarProdutos();
      toast.success(
        produto.disponivel ? "Produto desativado!" : "Produto ativado!"
      );
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Erro ao atualizar produto."));
    }
  }

  function confirmarExcluirProduto(produto) {
    setConfirmState({
      title: `Excluir ${produto.nome}?`,
      description:
        "Esta ação remove o produto do cadastro. Se ele já estiver em pedidos antigos, o back-end pode bloquear a exclusão para preservar o histórico.",
      confirmLabel: "Excluir produto",
      cancelLabel: "Cancelar",
      variant: "danger",
      onConfirm: () => excluirProduto(produto.id),
    });
  }

  async function excluirProduto(produtoId) {
    try {
      await api.delete(`/produtos/${produtoId}`);
      toast.success("Produto excluído com sucesso!");
      carregarProdutos();
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Erro ao excluir produto. Se houver pedidos vinculados, desative o produto em vez de excluir."));
    }
  }

  async function salvarEstoque(produto) {
    const valor = estoquesEditados[produto.id] ?? produto.estoque ?? 0;
    const estoque = Number(valor);

    if (!Number.isInteger(estoque) || estoque < 0) {
      toast.error("Informe uma quantidade de estoque válida.");
      return;
    }

    setSalvandoEstoqueId(produto.id);

    try {
      await api.put(`/produtos/${produto.id}`, {
        ...produto,
        estoque,
        disponivel: estoque > 0 ? produto.disponivel : false,
      });

      setEstoquesEditados((valores) => {
        const novos = { ...valores };
        delete novos[produto.id];
        return novos;
      });
      toast.success("Estoque atualizado!");
      carregarProdutos();
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Erro ao atualizar estoque."));
    } finally {
      setSalvandoEstoqueId(null);
    }
  }

  const contagensStatus = {
    Todos: produtos.length,
    Ativos: produtos.filter((p) => p.disponivel).length,
    Inativos: produtos.filter((p) => !p.disponivel).length,
  };

  const produtosFiltrados = produtos
    .filter((produto) => {
      if (filtroStatus === "Ativos") return produto.disponivel;
      if (filtroStatus === "Inativos") return !produto.disponivel;
      return true;
    })
    .filter((produto) =>
      produto.nome.toLowerCase().includes(busca.toLowerCase())
    );

  return (
    <div className="fcard-page">
      <div className="fcard-head">
        <div>
          <h1>Gerenciar Cardápio</h1>
          <p>Cadastre, ative e controle os produtos disponíveis na cantina.</p>
        </div>
      </div>

      <section className="fcard-form">
        <h2>
          <PlusCircle size={20} color="#b91c1c" />
          Novo produto
        </h2>

        <div className="fcard-form-grid">
          <input
            className="fcard-input"
            placeholder="Nome do produto"
            value={novoProduto.nome}
            onChange={(e) =>
              setNovoProduto({ ...novoProduto, nome: e.target.value })
            }
          />

          <input
            className="fcard-input"
            placeholder="Descrição"
            value={novoProduto.descricao}
            onChange={(e) =>
              setNovoProduto({ ...novoProduto, descricao: e.target.value })
            }
          />

          <input
            className="fcard-input"
            placeholder="Preço (R$)"
            type="number"
            step="0.01"
            min="0"
            value={novoProduto.preco}
            onChange={(e) =>
              setNovoProduto({ ...novoProduto, preco: e.target.value })
            }
          />

          <input
            className="fcard-input"
            placeholder="Quantidade em estoque"
            type="number"
            step="1"
            min="0"
            value={novoProduto.estoque}
            onChange={(e) =>
              setNovoProduto({ ...novoProduto, estoque: e.target.value })
            }
          />

          <input
            className="fcard-file"
            type="file"
            accept="image/*"
            onChange={(e) => uploadImagem(e.target.files[0])}
          />

          {novoProduto.imagemUrl && (
            <img
              src={novoProduto.imagemUrl}
              alt="Prévia do produto"
              className="fcard-preview"
            />
          )}

          <button
            type="button"
            className="fcard-submit"
            onClick={cadastrarProduto}
            disabled={!novoProduto.imagemUrl}
          >
            <PlusCircle size={16} />
            Cadastrar produto
          </button>

          {!novoProduto.imagemUrl && (
            <p className="fcard-hint">
              Envie uma imagem acima para habilitar o cadastro.
            </p>
          )}
        </div>
      </section>

      <div className="fcard-toolbar">
        <h2>
          <UtensilsCrossed size={20} color="#b91c1c" />
          Produtos cadastrados
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
            ({produtosFiltrados.length})
          </span>
        </h2>

        <div className="fcard-status-tabs">
          {["Todos", "Ativos", "Inativos"].map((label) => (
            <button
              key={label}
              type="button"
              className={`fcard-status-tab ${filtroStatus === label ? "is-active" : ""}`}
              onClick={() => setFiltroStatus(label)}
            >
              {label}
              <span className="fcard-status-tab-count">{contagensStatus[label] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="fcard-search">
          <Search size={16} />
          <input
            placeholder="Buscar produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>


      <div className="fcard-grid">
        {produtosFiltrados.length === 0 && (
          <div className="fcard-empty">
            <Package size={28} style={{ marginBottom: 8 }} />
            <p>Nenhum produto encontrado.</p>
          </div>
        )}

        {produtosFiltrados.map((produto) => {
          const estoqueAtual = Number(produto.estoque ?? 0);
          const estoqueEditado = estoquesEditados[produto.id] ?? estoqueAtual;

          return (
            <article
              key={produto.id}
              className={`fcard-item ${produto.disponivel ? "" : "is-off"}`}
            >
              <div className="fcard-img">
                {produto.imagemUrl ? (
                  <img src={produto.imagemUrl} alt={produto.nome} />
                ) : (
                  <div className="fcard-img-placeholder">
                    <ImageIcon size={40} />
                  </div>
                )}
              </div>

              <div className="fcard-body">
                <h3>{produto.nome}</h3>
                <p className="fcard-desc">
                  {produto.descricao || "Sem descrição"}
                </p>

                <div className="fcard-stock-row">
                  <span className={`fcard-stock-badge ${estoqueAtual <= 0 ? "is-empty" : estoqueAtual <= 5 ? "is-low" : ""}`}>
                    {estoqueAtual <= 0 ? "Esgotado" : `Estoque: ${estoqueAtual}`}
                  </span>
                </div>

                <div className="fcard-stock-editor">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={estoqueEditado}
                    onChange={(event) =>
                      setEstoquesEditados((valores) => ({
                        ...valores,
                        [produto.id]: event.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => salvarEstoque(produto)}
                    disabled={salvandoEstoqueId === produto.id}
                  >
                    {salvandoEstoqueId === produto.id ? "Salvando..." : "Salvar estoque"}
                  </button>
                </div>

                <div className="fcard-foot">
                  <span className="fcard-price">
                    R$ {Number(produto.preco).toFixed(2)}
                  </span>
                  <span
                    className={`fcard-status ${
                      produto.disponivel ? "is-on" : "is-off"
                    }`}
                  >
                    {produto.disponivel ? "Disponível" : "Indisponível"}
                  </span>
                </div>
              </div>

              <div className="fcard-actions">
                <button
                  type="button"
                  className={`fcard-btn ${
                    produto.disponivel ? "fcard-btn--off" : "fcard-btn--on"
                  }`}
                  onClick={() => confirmarAlterarDisponibilidade(produto)}
                >
                  <Power size={14} />
                  {produto.disponivel ? "Desativar" : "Ativar"}
                </button>

                <button
                  type="button"
                  className="fcard-btn fcard-btn--delete"
                  onClick={() => confirmarExcluirProduto(produto)}
                >
                  <Trash2 size={14} />
                  Excluir
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
    </div>
  );
}

export default CardapioFuncionario;
