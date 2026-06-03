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
    const response = await fetch(
      "https://localhost:7135/api/Produtos/upload-imagem",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao enviar imagem.");
    }

    const data = await response.json();

    console.log("URL da imagem recebida:", data.imagemUrl);

    setNovoProduto((produtoAtual) => ({
      ...produtoAtual,
      imagemUrl: data.imagemUrl,
    }));

    toast.success("Imagem enviada com sucesso!");
  } catch (error) {
    console.error(error);
    toast.error("Erro ao enviar imagem.");
  }
}

  async function cadastrarProduto() {
    if (!novoProduto.nome || !novoProduto.preco) {
      toast("Informe pelo menos nome e preço.");
      return;
    }

    try {
      await api.post("/produtos", {
        nome: novoProduto.nome,
        descricao: novoProduto.descricao,
        preco: Number(
          novoProduto.preco.toString().replace(",", ".")
        ),
        imagemUrl: novoProduto.imagemUrl,
        disponivel: true,
        categoriaId: 1,
      });

      setNovoProduto({
        nome: "",
        descricao: "",
        preco: "",
        imagemUrl: "",
      });

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
        produto.disponivel ? "Produto desativado!" : "Produto ativado!"
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
          step="0.01"
          min="0"
          value={novoProduto.preco}
          onChange={(e) =>
            setNovoProduto({ ...novoProduto, preco: e.target.value })
          }
          style={inputStyle}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => uploadImagem(e.target.files[0])}
          style={inputStyle}
        />

        {novoProduto.imagemUrl && (
          <img
            src={novoProduto.imagemUrl}
            alt="Prévia do produto"
            style={previewStyle}
          />
        )}

        <button
          style={buttonStyle}
          onClick={cadastrarProduto}
          disabled={!novoProduto.imagemUrl}
        >
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
          <div style={produtoInfoStyle}>
            {produto.imagemUrl && (
              <img
                src={produto.imagemUrl}
                alt={produto.nome}
                style={imageStyle}
              />
            )}

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

const previewStyle = {
  width: "160px",
  height: "110px",
  objectFit: "cover",
  borderRadius: "12px",
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
  gap: "20px",
};

const produtoInfoStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

const imageStyle = {
  width: "120px",
  height: "90px",
  objectFit: "cover",
  borderRadius: "12px",
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
  opacity: 1,
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