import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ChefHat, CheckCircle2 } from "lucide-react";
import { api } from "../../api/client";
import { playNotification } from "../../utils/playNotification";
import { criarNotificacao } from "../../utils/notificacoes";
import "./funcionario.css";

const STATUS = { PENDENTE: "Pendente", PREPARO: "Em preparo", ENTREGUE: "Entregue" };

function PedidosFuncionario() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [atualizando, setAtualizando] = useState({}); // { [pedidoId]: true } — trava cliques duplos

  const primeiraCarga = useRef(true);
  const totalAnterior = useRef(0);

  async function carregarPedidos() {
    try {
      setErro(null);
      const data = await api.get("/pedidos");
      const config = JSON.parse(localStorage.getItem("foodpay_config_funcionario"));

      if (
        !primeiraCarga.current &&
        config?.somNotificacao &&
        data.length > totalAnterior.current
      ) {
        playNotification();
        if (config?.novoPedido !== false) toast.success("Novo pedido recebido!");
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

  async function atualizarStatus(pedido, novoStatus) {
    // Regras de fluxo: Pendente -> Em preparo -> Entregue (sem voltar)
    if (atualizando[pedido.id]) return;
    if (pedido.status === STATUS.ENTREGUE) return;
    if (novoStatus === STATUS.PREPARO && pedido.status !== STATUS.PENDENTE) return;
    if (novoStatus === STATUS.ENTREGUE && pedido.status !== STATUS.PREPARO) {
      toast.error('Marque "Em preparo" antes de entregar o pedido.');
      return;
    }

    setAtualizando((a) => ({ ...a, [pedido.id]: true }));

    // Atualização otimista — evita duplo clique enquanto o backend responde
    setPedidos((prev) =>
      prev.map((p) => (p.id === pedido.id ? { ...p, status: novoStatus } : p))
    );

    try {
      await api.put(`/pedidos/${pedido.id}/status`, novoStatus);
      toast.success(`Pedido #${pedido.id} → ${novoStatus}`);
      criarNotificacao("aluno", `Seu pedido #${pedido.id} mudou para: ${novoStatus}.`);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status.");
      // Reverte em caso de falha
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedido.id ? { ...p, status: pedido.status } : p))
      );
    } finally {
      setAtualizando((a) => {
        const next = { ...a };
        delete next[pedido.id];
        return next;
      });
    }
  }

  useEffect(() => {
    carregarPedidos();
    const config = JSON.parse(localStorage.getItem("foodpay_config_funcionario"));
    let intervalo = null;
    if (config?.autoRefresh !== false) intervalo = setInterval(carregarPedidos, 5000);
    return () => intervalo && clearInterval(intervalo);
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
        <button style={buttonStyle} onClick={carregarPedidos}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={tituloStyle}>Gerenciar Pedidos</h1>

      {pedidos.length === 0 ? (
        <div style={emptyStyle}><p>Nenhum pedido encontrado.</p></div>
      ) : (
        pedidos.map((pedido) => {
          const isPendente = pedido.status === STATUS.PENDENTE;
          const isPreparo = pedido.status === STATUS.PREPARO;
          const isEntregue = pedido.status === STATUS.ENTREGUE;
          const travado = !!atualizando[pedido.id];

          // Regras de disponibilidade dos botões
          const podePreparo = isPendente && !travado;
          const podeEntregue = isPreparo && !travado;

          return (
            <div key={pedido.id} style={cardStyle}>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginTop: 0 }}>Pedido #{pedido.id}</h3>
                <p><strong>Aluno:</strong> {pedido.alunoNome}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    style={{
                      color: isEntregue ? "#16a34a" : isPreparo ? "#2563eb" : "#d97706",
                      fontWeight: 700,
                    }}
                  >
                    {pedido.status}
                  </span>
                </p>
                <p><strong>Valor:</strong> R$ {Number(pedido.valorTotal).toFixed(2)}</p>
                <p>
                  <strong>Data:</strong>{" "}
                  {new Date(pedido.dataPedido).toLocaleString("pt-BR")}
                </p>

                <div style={{ marginTop: 12 }}>
                  <strong>Itens:</strong>
                  {pedido.itens?.length > 0 ? (
                    pedido.itens.map((item) => (
                      <div key={item.id}>• {item.produtoNome} x{item.quantidade}</div>
                    ))
                  ) : (
                    <p>Nenhum item encontrado.</p>
                  )}
                </div>
              </div>

              <div style={actionsStyle}>
                <button
                  type="button"
                  style={{
                    ...buttonStyle,
                    opacity: podePreparo ? 1 : 0.55,
                    cursor: podePreparo ? "pointer" : "not-allowed",
                  }}
                  onClick={() => atualizarStatus(pedido, STATUS.PREPARO)}
                  disabled={!podePreparo}
                  title={
                    isPreparo || isEntregue
                      ? "Pedido já avançou desta etapa"
                      : "Marcar em preparo"
                  }
                >
                  <ChefHat size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />
                  {isPreparo || isEntregue ? "Em preparo ✓" : "Em preparo"}
                </button>

                <button
                  type="button"
                  style={{
                    ...buttonGreenStyle,
                    opacity: podeEntregue ? 1 : 0.55,
                    cursor: podeEntregue ? "pointer" : "not-allowed",
                  }}
                  onClick={() => atualizarStatus(pedido, STATUS.ENTREGUE)}
                  disabled={!podeEntregue}
                  title={
                    isPendente
                      ? "Inicie o preparo antes de entregar"
                      : isEntregue
                      ? "Pedido já entregue"
                      : "Marcar entregue"
                  }
                >
                  <CheckCircle2 size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />
                  {isEntregue ? "Entregue ✓" : "Entregue"}
                </button>

                {isPendente && (
                  <small style={{ color: "#64748b", fontSize: 12, textAlign: "center" }}>
                    Inicie o preparo para liberar "Entregue"
                  </small>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

const pageStyle = { padding: "30px", maxWidth: 1100, margin: "0 auto" };
const tituloStyle = {
  fontSize: "clamp(1.8rem,3vw,2.4rem)",
  fontWeight: 800,
  marginBottom: "24px",
};
const emptyStyle = { background: "#fff", padding: "24px", borderRadius: "18px" };
const cardStyle = {
  background: "#fff",
  padding: "24px",
  borderRadius: "18px",
  marginBottom: "16px",
  display: "flex",
  justifyContent: "space-between",
  gap: "24px",
  alignItems: "center",
  boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
  border: "1px solid #eef2f7",
};
const actionsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  minWidth: 180,
};
const buttonStyle = {
  padding: "12px 18px",
  border: "none",
  borderRadius: "10px",
  background: "#b91c1c",
  color: "#fff",
  fontWeight: 700,
};
const buttonGreenStyle = { ...buttonStyle, background: "#16a34a" };

export default PedidosFuncionario;
