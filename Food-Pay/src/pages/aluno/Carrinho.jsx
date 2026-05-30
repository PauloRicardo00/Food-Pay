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
    <div style={{ padding: "30px" }}>
      <h1>Carrinho</h1>

      {itens.length === 0 ? (
        <p>Carrinho vazio.</p>
      ) : (
        <>
          {itens.map((item) => (
            <div key={item.id} style={cardStyle}>
              <div>
                <h3>{item.nome}</h3>
                <p>Preço unitário: R$ {Number(item.preco).toFixed(2)}</p>
                <p>
                  Subtotal: R${" "}
                  {(Number(item.preco) * item.quantidade).toFixed(2)}
                </p>
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

          <h2>Total: R$ {total.toFixed(2)}</h2>

          <button style={finishButton} onClick={finalizarPedido}>
            Finalizar pedido
          </button>
        </>
      )}
    </div>
  );
}

const cardStyle = {
  background: "#fff",
  padding: "16px",
  borderRadius: "12px",
  marginBottom: "12px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
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
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
};

const finishButton = {
  marginTop: "20px",
  background: "#0b2c66",
  color: "#fff",
  border: "none",
  padding: "14px 20px",
  borderRadius: "10px",
  cursor: "pointer",
};

export default Carrinho;