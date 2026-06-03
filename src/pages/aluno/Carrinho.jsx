import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../api/client";
import { criarNotificacao } from "../../utils/notificacoes";

function Carrinho() {
  const [itens, setItens] = useState([]);

  useEffect(() => {
    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    const agrupado = carrinho.reduce((acc, item) => {
      const existente = acc.find((p) => p.id === item.id);

      if (existente) {
        existente.quantidade += item.quantidade || 1;
      } else {
        acc.push({
          ...item,
          quantidade: item.quantidade || 1,
        });
      }

      return acc;
    }, []);

    setItens(agrupado);
    localStorage.setItem("carrinho", JSON.stringify(agrupado));
  }, []);

  function salvarCarrinho(novoCarrinho) {
    setItens(novoCarrinho);
    localStorage.setItem("carrinho", JSON.stringify(novoCarrinho));
  }

  function aumentarQuantidade(id) {
    const novoCarrinho = itens.map((item) =>
      item.id === id
        ? { ...item, quantidade: item.quantidade + 1 }
        : item
    );

    salvarCarrinho(novoCarrinho);
  }

  function diminuirQuantidade(id) {
    const novoCarrinho = itens
      .map((item) =>
        item.id === id
          ? { ...item, quantidade: item.quantidade - 1 }
          : item
      )
      .filter((item) => item.quantidade > 0);

    salvarCarrinho(novoCarrinho);
  }

  function removerItem(id) {
    const novoCarrinho = itens.filter((item) => item.id !== id);
    salvarCarrinho(novoCarrinho);

    toast.success("Item removido do carrinho.");
  }

  async function finalizarPedido() {
    if (itens.length === 0) {
      toast("Carrinho vazio.");
      return;
    }

    try {
      await api.post("/pedidos", {
        itens: itens.map((item) => ({
          produtoId: item.id,
          quantidade: item.quantidade,
          precoUnitario: Number(item.preco),
        })),
      });

      localStorage.removeItem("carrinho");
      setItens([]);

      toast.success("Pedido realizado!");

      criarNotificacao("aluno", "Seu pedido foi realizado com sucesso.");
      criarNotificacao("funcionario", "Um novo pedido foi recebido.");
    } catch {
      toast.error("Erro ao finalizar pedido.");
    }
  }

  const total = itens.reduce(
    (soma, item) => soma + Number(item.preco) * item.quantidade,
    0
  );

  return (
    <div style={pageStyle}>
      <h1 style={tituloStyle}>Carrinho</h1>

      {itens.length === 0 ? (
        <div style={emptyStyle}>
          <p>Carrinho vazio.</p>
        </div>
      ) : (
        <>
          {itens.map((item) => (
            <div key={item.id} style={cardStyle}>
              <div style={produtoInfoStyle}>
                {item.imagemUrl ? (
                  <img
                    src={item.imagemUrl}
                    alt={item.nome}
                    style={imageStyle}
                  />
                ) : (
                  <div style={imagePlaceholderStyle}>Sem imagem</div>
                )}

                <div>
                  <h3>{item.nome}</h3>

                  <p style={mutedTextStyle}>
                    Preço unitário: R$ {Number(item.preco).toFixed(2)}
                  </p>

                  <strong>
                    Subtotal: R${" "}
                    {(Number(item.preco) * item.quantidade).toFixed(2)}
                  </strong>
                </div>
              </div>

              <div style={quantityBoxStyle}>
                <button
                  style={quantityButtonStyle}
                  onClick={() => diminuirQuantidade(item.id)}
                >
                  -
                </button>

                <strong>{item.quantidade}</strong>

                <button
                  style={quantityButtonStyle}
                  onClick={() => aumentarQuantidade(item.id)}
                >
                  +
                </button>
              </div>

              <button
                style={removeButton}
                onClick={() => removerItem(item.id)}
              >
                Remover
              </button>
            </div>
          ))}

          <div style={totalCardStyle}>
            <h2>Total: R$ {total.toFixed(2)}</h2>

            <button style={finishButton} onClick={finalizarPedido}>
              Finalizar pedido
            </button>
          </div>
        </>
      )}
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

const emptyStyle = {
  background: "#fff",
  padding: "24px",
  borderRadius: "18px",
};

const cardStyle = {
  background: "#fff",
  padding: "20px",
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
  flex: 1,
};

const imageStyle = {
  width: "110px",
  height: "85px",
  objectFit: "cover",
  borderRadius: "12px",
};

const imagePlaceholderStyle = {
  width: "110px",
  height: "85px",
  borderRadius: "12px",
  background: "#e5e7eb",
  color: "#64748b",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "13px",
};

const mutedTextStyle = {
  color: "#64748b",
  margin: "6px 0",
};

const quantityBoxStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const quantityButtonStyle = {
  background: "#0b2c66",
  color: "#fff",
  border: "none",
  width: "32px",
  height: "32px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "18px",
};

const removeButton = {
  background: "#d62828",
  color: "#fff",
  border: "none",
  padding: "10px 14px",
  borderRadius: "10px",
  cursor: "pointer",
};

const totalCardStyle = {
  background: "#fff",
  padding: "22px",
  borderRadius: "18px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "20px",
};

const finishButton = {
  background: "#0b2c66",
  color: "#fff",
  border: "none",
  padding: "14px 20px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
};

export default Carrinho;