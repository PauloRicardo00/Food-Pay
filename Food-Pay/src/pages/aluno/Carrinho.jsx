/**
 * Carrinho de compras do aluno.
 * Os itens são armazenados no localStorage com chave vinculada ao usuário
 * (carrinho_aluno_<id>) para que cada aluno tenha seu próprio carrinho.
 * Ao montar, busca os dados atualizados da API para garantir estoque, imagemUrl
 * e preço sempre corretos.
 */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Utensils } from "lucide-react";
import { api, getApiErrorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

function Carrinho() {
  const { user } = useAuth();
  const [itens, setItens] = useState([]);
  const [finalizando, setFinalizando] = useState(false);

  // Chave única por aluno — nunca usa a chave genérica "carrinho"
  const carrinhoKey = `carrinho_aluno_${user?.id ?? user?.email ?? "anonimo"}`;

  useEffect(() => {
    async function carregarCarrinho() {
      const carrinho = JSON.parse(localStorage.getItem(carrinhoKey)) || [];

      // Agrupa itens repetidos
      const agrupado = carrinho.reduce((acc, item) => {
        const existente = acc.find((p) => p.id === item.id);
        if (existente) {
          existente.quantidade += item.quantidade || 1;
        } else {
          acc.push({ ...item, quantidade: item.quantidade || 1 });
        }
        return acc;
      }, []);

      // Busca dados atualizados da API para garantir estoque, imagemUrl e preço corretos
      try {
        const produtos = await api.get("/produtos");
        const enriquecido = agrupado.map((item) => {
          const produtoAtualizado = produtos.find((p) => p.id === item.id);
          if (!produtoAtualizado) return item;

          const estoque = Number(produtoAtualizado.estoque ?? 0);
          const quantidadeAjustada = Math.min(item.quantidade, Math.max(estoque, 0));

          return {
            ...item,
            imagemUrl: produtoAtualizado.imagemUrl || item.imagemUrl,
            preco: produtoAtualizado.preco,
            disponivel: produtoAtualizado.disponivel,
            estoque,
            quantidade: quantidadeAjustada || item.quantidade,
          };
        });

        setItens(enriquecido);
        localStorage.setItem(carrinhoKey, JSON.stringify(enriquecido));
      } catch {
        // Se a API falhar, usa o que está no localStorage mesmo
        setItens(agrupado);
        localStorage.setItem(carrinhoKey, JSON.stringify(agrupado));
      }
    }

    if (carrinhoKey) carregarCarrinho();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carrinhoKey]);

  function salvarCarrinho(novoCarrinho) {
    setItens(novoCarrinho);
    localStorage.setItem(carrinhoKey, JSON.stringify(novoCarrinho));
  }

  function aumentarQuantidade(id) {
    const itemAtual = itens.find((item) => item.id === id);
    const estoque = Number(itemAtual?.estoque ?? 0);

    if (estoque > 0 && itemAtual.quantidade >= estoque) {
      toast.error(`Só existem ${estoque} unidade(s) disponíveis de ${itemAtual.nome}.`);
      return;
    }

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
    if (finalizando) return;

    if (itens.length === 0) {
      toast("Carrinho vazio.");
      return;
    }

    const itemSemEstoque = itens.find(
      (item) => !item.disponivel || Number(item.estoque ?? 0) <= 0 || item.quantidade > Number(item.estoque ?? 0)
    );

    if (itemSemEstoque) {
      toast.error(`Estoque insuficiente para ${itemSemEstoque.nome}. Atualize o carrinho.`);
      return;
    }

    setFinalizando(true);

    try {
      await api.post("/pedidos", {
        itens: itens.map((item) => ({
          produtoId: item.id,
          quantidade: item.quantidade,
          precoUnitario: Number(item.preco),
        })),
      });

      localStorage.removeItem(carrinhoKey);
      setItens([]);

      toast.success("Pedido realizado!");
    } catch (error) {
      const mensagem = getApiErrorMessage(error, "Erro ao finalizar pedido.");
      toast.error(mensagem);
    } finally {
      setFinalizando(false);
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
          {itens.map((item) => {
            const estoque = Number(item.estoque ?? 0);
            const semEstoque = !item.disponivel || estoque <= 0;
            const atingiuEstoque = estoque > 0 && item.quantidade >= estoque;

            return (
              <div key={item.id} style={cardStyle}>
                <div style={produtoInfoStyle}>
                  {item.imagemUrl ? (
                    <img
                      src={item.imagemUrl}
                      alt={item.nome}
                      style={imageStyle}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    style={{
                      ...imagePlaceholderStyle,
                      display: item.imagemUrl ? "none" : "flex",
                    }}
                  >
                    <Utensils size={28} color="#94a3b8" />
                  </div>

                  <div>
                    <h3>{item.nome}</h3>

                    <p style={mutedTextStyle}>
                      Preço unitário: R$ {Number(item.preco).toFixed(2)}
                    </p>

                    <p style={semEstoque ? stockDangerStyle : stockTextStyle}>
                      {semEstoque ? "Produto esgotado" : `Disponível: ${estoque} unidade(s)`}
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
                    style={{
                      ...quantityButtonStyle,
                      opacity: atingiuEstoque || semEstoque ? 0.55 : 1,
                      cursor: atingiuEstoque || semEstoque ? "not-allowed" : "pointer",
                    }}
                    onClick={() => aumentarQuantidade(item.id)}
                    disabled={atingiuEstoque || semEstoque}
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
            );
          })}

          <div style={totalCardStyle}>
            <h2>Total: R$ {total.toFixed(2)}</h2>

            <button
              style={{
                ...finishButton,
                opacity: finalizando ? 0.7 : 1,
                cursor: finalizando ? "not-allowed" : "pointer",
              }}
              onClick={finalizarPedido}
              disabled={finalizando}
            >
              {finalizando ? "Finalizando..." : "Finalizar pedido"}
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
  flexShrink: 0,
};

const mutedTextStyle = {
  color: "#64748b",
  margin: "6px 0",
};

const stockTextStyle = {
  color: "#166534",
  margin: "0 0 8px",
  fontSize: "13px",
  fontWeight: "700",
};

const stockDangerStyle = {
  color: "#991b1b",
  margin: "0 0 8px",
  fontSize: "13px",
  fontWeight: "700",
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
