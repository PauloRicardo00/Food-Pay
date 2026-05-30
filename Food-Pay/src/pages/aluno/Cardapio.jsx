import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../api/client";
import "./aluno.css";

function Cardapio() {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const data = await api.get("/produtos");
        setProdutos(data);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar cardápio.");
      }
    }

    carregarProdutos();
  }, []);

  function adicionarCarrinho(produto) {
    const carrinhoAtual =
      JSON.parse(localStorage.getItem("carrinho")) || [];

    const item = {
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
    };

    localStorage.setItem(
      "carrinho",
      JSON.stringify([...carrinhoAtual, item])
    );

    toast.success(`${produto.nome} adicionado ao carrinho!`);
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Cardápio</h1>

      {produtos.length === 0 ? (
        <p>Nenhum produto encontrado.</p>
      ) : (
        produtos.map((produto) => (
          <div key={produto.id} style={cardStyle}>
            <div>
              <h3>{produto.nome}</h3>

              <p>{produto.descricao}</p>

              <p>
                Preço: R$ {Number(produto.preco).toFixed(2)}
              </p>

              <p
                style={{
                  color: produto.disponivel
                    ? "#16a34a"
                    : "#dc2626",
                  fontWeight: "600",
                }}
              >
                {produto.disponivel
                  ? "Disponível"
                  : "Indisponível"}
              </p>
            </div>

            <button
              style={buttonStyle}
              onClick={() => adicionarCarrinho(produto)}
              disabled={!produto.disponivel}
            >
              Adicionar ao carrinho
            </button>
          </div>
        ))
      )}
    </div>
  );
}

const cardStyle = {
  background: "#fff",
  padding: "18px",
  borderRadius: "12px",
  marginBottom: "14px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const buttonStyle = {
  marginTop: "10px",
  padding: "10px 16px",
  border: "none",
  borderRadius: "8px",
  background: "#0b2c66",
  color: "#fff",
  cursor: "pointer",
};

export default Cardapio;