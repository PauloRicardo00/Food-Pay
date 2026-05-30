import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../api/client";

function CardapioFuncionario() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");

  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    descricao: "",
    preco: "",
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

  async function cadastrarProduto() {
    if (!novoProduto.nome || !novoProduto.preco) {
      toast("Informe pelo menos nome e preço.");
      return;
    }

    try {
      await api.post("/produtos", {
        nome: novoProduto.nome,
        descricao: novoProduto.descricao,
        preco: Number(novoProduto.preco),
        imagemUrl: "",
        disponivel: true,
        categoriaId: 1,
      });

      setNovoProduto({ nome: "", descricao: "", preco: "" });
      carregarProdutos();

      toast.success("Produto cadastrado!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao cadastrar produto.");
    }
  }

  async function alterarDisponibilidade(produto) {
    try {
      await api.put(`/produtos/${produto.id}`, {
        ...produto,
        disponivel: !produto.disponivel,
      });

      carregarProdutos();

      toast.success(
        produto.disponivel
          ? "Produto desativado!"
          : "Produto ativado!"
      );
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar produto.");
    }
  }

  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={pageStyle}>
      <h1 style={tituloStyle}>Gerenciar Cardápio</h1>

      <div style={formStyle}>
        <h2>Novo produto</h2>

        <input
          placeholder="Nome do produto"
          value={novoProduto.nome}
          onChange={(e) =>
            setNovoProduto({ ...novoProduto, nome: e.target.value })
          }
          style={inputStyle}
        />

        <input
          placeholder="Descrição"
          value={novoProduto.descricao}
          onChange={(e) =>
            setNovoProduto({ ...novoProduto, descricao: e.target.value })
          }
          style={inputStyle}
        />

        <input
          placeholder="Preço"
          type="number"
          value={novoProduto.preco}
          onChange={(e) =>
            setNovoProduto({ ...novoProduto, preco: e.target.value })
          }
          style={inputStyle}
        />

        <button style={buttonStyle} onClick={cadastrarProduto}>
          Cadastrar produto
        </button>
      </div>

      <div style={topListStyle}>
        <h2>Produtos cadastrados</h2>

        <input
          placeholder="Buscar produto..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={searchStyle}
        />
      </div>

      {produtosFiltrados.map((produto) => (
        <div key={produto.id} style={cardStyle}>
          <div>
            <h3>{produto.nome}</h3>
            <p>{produto.descricao || "Sem descrição"}</p>

            <strong>R$ {Number(produto.preco).toFixed(2)}</strong>

            <p
              style={{
                ...statusStyle,
                background: produto.disponivel ? "#dcfce7" : "#fee2e2",
                color: produto.disponivel ? "#166534" : "#991b1b",
              }}
            >
              {produto.disponivel ? "Disponível" : "Indisponível"}
            </p>
          </div>

          <button
            style={produto.disponivel ? buttonRedStyle : buttonGreenStyle}
            onClick={() => alterarDisponibilidade(produto)}
          >
            {produto.disponivel ? "Desativar" : "Ativar"}
          </button>
        </div>
      ))}
    </div>
  );
}

const pageStyle = {
  padding: "30px",
};

const tituloStyle = {
  fontSize: "42px",
  fontWeight: "700",
  marginBottom: "24px",
};

const formStyle = {
  background: "#fff",
  padding: "24px",
  borderRadius: "18px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px",
  marginBottom: "30px",
};

const inputStyle = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
};

const searchStyle = {
  ...inputStyle,
  width: "280px",
};

const topListStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "18px",
};

const cardStyle = {
  background: "#fff",
  padding: "24px",
  borderRadius: "18px",
  marginBottom: "14px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const statusStyle = {
  display: "inline-block",
  marginTop: "10px",
  padding: "6px 12px",
  borderRadius: "999px",
  fontWeight: "600",
};

const buttonStyle = {
  background: "#0b2c66",
  color: "#fff",
  border: "none",
  padding: "12px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
};

const buttonRedStyle = {
  ...buttonStyle,
  background: "#dc2626",
};

const buttonGreenStyle = {
  ...buttonStyle,
  background: "#16a34a",
};

export default CardapioFuncionario;