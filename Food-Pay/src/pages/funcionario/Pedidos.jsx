import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../api/client";
import { playNotification } from "../../utils/playNotification";
import { criarNotificacao } from "../../utils/notificacoes";
import "./funcionario.css";

function PedidosFuncionario() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const primeiraCarga = useRef(true);
  const totalAnterior = useRef(0);

  async function carregarPedidos() {
    try {
      setErro(null);

      const data = await api.get("/pedidos");

      const config = JSON.parse(
        localStorage.getItem("foodpay_config_funcionario")
      );

      if (
        !primeiraCarga.current &&
        config?.somNotificacao &&
        data.length > totalAnterior.current
      ) {
        playNotification();

        if (config?.novoPedido !== false) {
          toast.success("Novo pedido recebido!");
        }
      }

      setPedidos(data);

      totalAnterior.current = data.length;
      primeiraCarga.current = false;
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      setErro("Erro ao carregar pedidos.");
    } finally {
      setLoading(false);
    }
  }

  async function atualizarStatus(id, novoStatus) {
    try {
      await api.put(`/pedidos/${id}/status`, novoStatus);

      toast.success(`Pedido atualizado para ${novoStatus}!`);

      criarNotificacao(
        "aluno",
        `Seu pedido #${id} mudou para: ${novoStatus}.`
      );

      await carregarPedidos();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status.");
    }
  }

  useEffect(() => {
    carregarPedidos();

    const config = JSON.parse(
      localStorage.getItem("foodpay_config_funcionario")
    );

    let intervalo = null;

    if (config?.autoRefresh !== false) {
      intervalo = setInterval(carregarPedidos, 5000);
    }

    return () => {
      if (intervalo) {
        clearInterval(intervalo);
      }
    };
  }, []);

  if (loading) {
    return (
      <div style={pageStyle}>
        <h1 style={tituloStyle}>Gerenciar Pedidos</h1>
        <p>Carregando pedidos...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div style={pageStyle}>
        <h1 style={tituloStyle}>Gerenciar Pedidos</h1>

        <p style={{ color: "#dc2626" }}>{erro}</p>

        <button style={buttonStyle} onClick={carregarPedidos}>
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={tituloStyle}>Gerenciar Pedidos</h1>

      {pedidos.length === 0 ? (
        <div style={emptyStyle}>
          <p>Nenhum pedido encontrado.</p>
        </div>
      ) : (
        pedidos.map((pedido) => (
          <div key={pedido.id} style={cardStyle}>
            <div>
              <h3>Pedido #{pedido.id}</h3>

              <p>
                <strong>Aluno:</strong> {pedido.alunoNome}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    color:
                      pedido.status === "Entregue"
                        ? "#16a34a"
                        : pedido.status === "Em preparo"
                        ? "#2563eb"
                        : "#d97706",
                    fontWeight: "600",
                  }}
                >
                  {pedido.status}
                </span>
              </p>

              <p>
                <strong>Valor:</strong> R${" "}
                {Number(pedido.valorTotal).toFixed(2)}
              </p>

              <p>
                <strong>Data:</strong>{" "}
                {new Date(pedido.dataPedido).toLocaleString("pt-BR")}
              </p>

              <div style={{ marginTop: "12px" }}>
                <strong>Itens:</strong>

                {pedido.itens?.length > 0 ? (
                  pedido.itens.map((item) => (
                    <div key={item.id}>
                      • {item.produtoNome} x{item.quantidade}
                    </div>
                  ))
                ) : (
                  <p>Nenhum item encontrado.</p>
                )}
              </div>
            </div>

            <div style={actionsStyle}>
              <button
                style={buttonStyle}
                onClick={() =>
                  atualizarStatus(pedido.id, "Em preparo")
                }
                disabled={pedido.status === "Em preparo"}
              >
                Em preparo
              </button>

              <button
                style={buttonGreenStyle}
                onClick={() =>
                  atualizarStatus(pedido.id, "Entregue")
                }
                disabled={pedido.status === "Entregue"}
              >
                Entregue
              </button>
            </div>
          </div>
        ))
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
  padding: "24px",
  borderRadius: "18px",
  marginBottom: "16px",
  display: "flex",
  justifyContent: "space-between",
  gap: "24px",
  alignItems: "center",
};

const actionsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const buttonStyle = {
  padding: "12px 18px",
  border: "none",
  borderRadius: "10px",
  background: "#0b2c66",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "600",
};

const buttonGreenStyle = {
  ...buttonStyle,
  background: "#16a34a",
};

export default PedidosFuncionario;