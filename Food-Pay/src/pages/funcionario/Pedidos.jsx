/**
 * Gerenciamento de pedidos em tempo real.
 * Polling a cada poucos segundos detecta novos pedidos e dispara
 * som de notificação. O funcionário avança o status:
 * Pendente → Em preparo → Entregue, ou Pendente → Recusado com estorno.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ChefHat, CheckCircle2, XCircle, Inbox, RefreshCw } from "lucide-react";
import { api, getApiErrorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { playNotification } from "../../utils/playNotification";
import { criarNotificacao } from "../../utils/notificacoes";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import "./funcionario.css";

const STATUS = { PENDENTE: "Pendente", PREPARO: "Em preparo", ENTREGUE: "Entregue", RECUSADO: "Recusado" };
const PAGE_SIZE = 10;

const FILTROS_STATUS = [
  { label: "Todos", value: "Todos" },
  { label: "Pendentes", value: STATUS.PENDENTE },
  { label: "Em preparo", value: STATUS.PREPARO },
  { label: "Entregues", value: STATUS.ENTREGUE },
  { label: "Recusados", value: STATUS.RECUSADO },
];

const STATUS_THEME = {
  [STATUS.PENDENTE]: { bg: "#fff7ed", fg: "#9a3412", border: "#fed7aa", dot: "#f59e0b" },
  [STATUS.PREPARO]:  { bg: "#eff6ff", fg: "#1d4ed8", border: "#bfdbfe", dot: "#2563eb" },
  [STATUS.ENTREGUE]: { bg: "#ecfdf5", fg: "#047857", border: "#a7f3d0", dot: "#16a34a" },
  [STATUS.RECUSADO]: { bg: "#fef2f2", fg: "#b91c1c", border: "#fecaca", dot: "#dc2626" },
};

function PedidosFuncionario() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [atualizando, setAtualizando] = useState({});
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [confirmState, setConfirmState] = useState(null);

  const primeiraCarga = useRef(true);
  const pedidosConhecidos = useRef(new Set());

  async function carregarPedidos() {
    try {
      setErro(null);
      const data = await api.get("/pedidos");
      const pedidosAtuais = Array.isArray(data) ? data : [];
      const config = JSON.parse(localStorage.getItem("foodpay_config_funcionario"));

      const pedidosPendentes = pedidosAtuais.filter(
        (pedido) => pedido.status === STATUS.PENDENTE,
      );

      pedidosPendentes.forEach((pedido) => {
        criarNotificacao(
          "funcionario",
          `Novo pedido #${pedido.id} recebido${pedido.alunoNome ? ` de ${pedido.alunoNome}` : ""}.`,
          user,
          {
            id: `pedido-${pedido.id}`,
            pedidoId: pedido.id,
            dataEnvio: pedido.dataPedido ?? new Date().toISOString(),
          },
        );
      });

      const novosPedidos = pedidosPendentes.filter(
        (pedido) => !pedidosConhecidos.current.has(pedido.id),
      );

      if (!primeiraCarga.current && novosPedidos.length > 0) {
        if (config?.somNotificacao) playNotification();
        if (config?.novoPedido !== false) {
          toast.success(
            novosPedidos.length === 1
              ? `Novo pedido #${novosPedidos[0].id} recebido!`
              : `${novosPedidos.length} novos pedidos recebidos!`,
          );
        }
      }

      pedidosConhecidos.current = new Set(pedidosAtuais.map((pedido) => pedido.id));
      setPedidos(pedidosAtuais);
      primeiraCarga.current = false;
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      setErro("Erro ao carregar pedidos.");
    } finally {
      setLoading(false);
    }
  }

  async function atualizarStatus(pedido, novoStatus) {
    if (atualizando[pedido.id]) return;
    if (pedido.status === STATUS.ENTREGUE || pedido.status === STATUS.RECUSADO) return;
    if (novoStatus === STATUS.PREPARO && pedido.status !== STATUS.PENDENTE) return;
    if (novoStatus === STATUS.RECUSADO && pedido.status !== STATUS.PENDENTE) return;
    if (novoStatus === STATUS.ENTREGUE && pedido.status !== STATUS.PREPARO) {
      toast.error('Marque "Em preparo" antes de entregar o pedido.');
      return;
    }

    if (novoStatus === STATUS.RECUSADO) {
      setConfirmState({
        title: `Recusar pedido #${pedido.id}?`,
        description: `O valor de R$ ${Number(pedido.valorTotal).toFixed(2)} será devolvido ao saldo do aluno.`,
        confirmLabel: "Confirmar recusa",
        cancelLabel: "Cancelar",
        variant: "danger",
        onConfirm: () => executarAtualizacao(pedido, novoStatus),
      });
      return;
    }

    await executarAtualizacao(pedido, novoStatus);
  }

  async function executarAtualizacao(pedido, novoStatus) {

    setAtualizando((a) => ({ ...a, [pedido.id]: true }));

    setPedidos((prev) =>
      prev.map((p) => (p.id === pedido.id ? { ...p, status: novoStatus } : p))
    );

    try {
      await api.put(`/pedidos/${pedido.id}/status`, novoStatus);
      toast.success(
        novoStatus === STATUS.RECUSADO
          ? `Pedido #${pedido.id} recusado e valor estornado.`
          : `Pedido #${pedido.id} → ${novoStatus}`
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error(getApiErrorMessage(error, "Erro ao atualizar status."));
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.email]);

  const pedidosOrdenados = useMemo(
    () => [...pedidos].sort((a, b) => new Date(b.dataPedido) - new Date(a.dataPedido)),
    [pedidos]
  );

  const contagens = useMemo(() => {
    const c = { Todos: pedidosOrdenados.length };
    FILTROS_STATUS.forEach((f) => {
      if (f.value !== "Todos") c[f.value] = pedidosOrdenados.filter((p) => p.status === f.value).length;
    });
    return c;
  }, [pedidosOrdenados]);

  const pedidosFiltrados = useMemo(() => {
    if (filtroStatus === "Todos") return pedidosOrdenados;
    return pedidosOrdenados.filter((pedido) => pedido.status === filtroStatus);
  }, [pedidosOrdenados, filtroStatus]);

  const pedidosVisiveis = pedidosFiltrados.slice(0, visibleCount);
  const temMaisPedidos = visibleCount < pedidosFiltrados.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filtroStatus]);

  if (loading) {
    return (
      <div style={pageStyle}>
        <h1 style={tituloStyle}>Gerenciar Pedidos</h1>
        <div style={emptyStyle}>Carregando pedidos...</div>
      </div>
    );
  }

  if (erro) {
    return (
      <div style={pageStyle}>
        <h1 style={tituloStyle}>Gerenciar Pedidos</h1>
        <div style={emptyStyle}>
          <p style={{ color: "#dc2626", marginBottom: 12 }}>{erro}</p>
          <button style={buttonStyle} onClick={carregarPedidos}>
            <RefreshCw size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={tituloStyle}>Gerenciar Pedidos</h1>
          <p style={subStyle}>Acompanhe e atualize o status dos pedidos em tempo real.</p>
        </div>
      </div>

      <div style={toolbarStyle}>
        <div style={filtersStyle}>
          {FILTROS_STATUS.map((filtro) => {
            const active = filtroStatus === filtro.value;
            return (
              <button
                key={filtro.value}
                type="button"
                style={{
                  ...filterButtonStyle,
                  ...(active ? filterButtonActiveStyle : {}),
                }}
                onClick={() => setFiltroStatus(filtro.value)}
              >
                {filtro.label}
                <span style={{ ...badgeStyle, ...(active ? badgeActiveStyle : {}) }}>
                  {contagens[filtro.value] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        <span style={contadorStyle}>
          {pedidosVisiveis.length} de {pedidosFiltrados.length}
        </span>
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div style={emptyStyle}>
          <Inbox size={36} color="#94a3b8" />
          <h3 style={{ margin: "12px 0 4px" }}>Nenhum pedido encontrado para este status</h3>
          <p style={{ color: "#64748b", margin: 0 }}>Tente trocar o filtro acima.</p>
        </div>
      ) : (
        <>
          {pedidosVisiveis.map((pedido) => {
            const theme = STATUS_THEME[pedido.status] || STATUS_THEME[STATUS.PENDENTE];
            const isPendente = pedido.status === STATUS.PENDENTE;
            const isPreparo = pedido.status === STATUS.PREPARO;
            const isEntregue = pedido.status === STATUS.ENTREGUE;
            const isRecusado = pedido.status === STATUS.RECUSADO;
            const travado = !!atualizando[pedido.id];

            const podePreparo = isPendente && !travado;
            const podeRecusar = isPendente && !travado;
            const podeEntregue = isPreparo && !travado;

            return (
              <div key={pedido.id} style={{ ...cardStyle, borderLeft: `4px solid ${theme.dot}` }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={cardHeaderStyle}>
                    <h3 style={cardTitleStyle}>Pedido #{pedido.id}</h3>
                    <span
                      style={{
                        ...statusPillStyle,
                        background: theme.bg,
                        color: theme.fg,
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      <span style={{ ...dotStyle, background: theme.dot }} />
                      {pedido.status}
                    </span>
                  </div>

                  <div style={metaGridStyle}>
                    <div>
                      <span style={metaLabelStyle}>Aluno</span>
                      <span style={metaValueStyle}>{pedido.alunoNome || "—"}</span>
                    </div>
                    <div>
                      <span style={metaLabelStyle}>Valor</span>
                      <span style={metaValueStyle}>R$ {Number(pedido.valorTotal).toFixed(2)}</span>
                    </div>
                    <div>
                      <span style={metaLabelStyle}>Data</span>
                      <span style={metaValueStyle}>
                        {new Date(pedido.dataPedido).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>

                  <div style={itensWrapStyle}>
                    <span style={metaLabelStyle}>Itens</span>
                    {pedido.itens?.length > 0 ? (
                      <ul style={itensListStyle}>
                        {pedido.itens.map((item) => (
                          <li key={item.id} style={itemRowStyle}>
                            <span>{item.produtoNome}</span>
                            <span style={qtdStyle}>×{item.quantidade}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ margin: "6px 0 0", color: "#64748b" }}>Nenhum item.</p>
                    )}
                  </div>
                </div>

                <div style={actionsStyle}>
                  <button
                    type="button"
                    style={{
                      ...buttonStyle,
                      background: "#2563eb",
                      opacity: podePreparo ? 1 : 0.5,
                      cursor: podePreparo ? "pointer" : "not-allowed",
                    }}
                    onClick={() => atualizarStatus(pedido, STATUS.PREPARO)}
                    disabled={!podePreparo}
                  >
                    <ChefHat size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />
                    {isPreparo || isEntregue ? "Em preparo ✓" : "Em preparo"}
                  </button>

                  <button
                    type="button"
                    style={{
                      ...buttonGreenStyle,
                      opacity: podeEntregue ? 1 : 0.5,
                      cursor: podeEntregue ? "pointer" : "not-allowed",
                    }}
                    onClick={() => atualizarStatus(pedido, STATUS.ENTREGUE)}
                    disabled={!podeEntregue}
                  >
                    <CheckCircle2 size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />
                    {isEntregue ? "Entregue ✓" : "Entregue"}
                  </button>

                  {isPendente && (
                    <button
                      type="button"
                      style={{
                        ...buttonGhostDangerStyle,
                        opacity: podeRecusar ? 1 : 0.5,
                        cursor: podeRecusar ? "pointer" : "not-allowed",
                      }}
                      onClick={() => atualizarStatus(pedido, STATUS.RECUSADO)}
                      disabled={!podeRecusar}
                    >
                      <XCircle size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />
                      Recusar
                    </button>
                  )}

                  {isRecusado && (
                    <small style={{ color: "#dc2626", fontSize: 12, textAlign: "center" }}>
                      Valor devolvido ao aluno.
                    </small>
                  )}
                </div>
              </div>
            );
          })}

          {temMaisPedidos ? (
            <button
              type="button"
              style={mostrarMaisStyle}
              onClick={() => setVisibleCount((atual) => atual + PAGE_SIZE)}
            >
              Mostrar mais 10 pedidos
            </button>
          ) : pedidosFiltrados.length > PAGE_SIZE ? (
            <p style={fimListaStyle}>Fim da lista — você viu todos os pedidos.</p>
          ) : null}
        </>
      )}
      <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
    </div>
  );
}

const pageStyle = { padding: "30px", maxWidth: 1100, margin: "0 auto" };
const headerStyle = { marginBottom: 20 };
const tituloStyle = {
  fontSize: "clamp(1.8rem,3vw,2.4rem)",
  fontWeight: 800,
  margin: 0,
  color: "#0f172a",
};
const subStyle = { color: "#64748b", margin: "6px 0 0" };

const emptyStyle = {
  background: "#fff",
  padding: "40px 24px",
  borderRadius: "18px",
  border: "1px solid #eef2f7",
  textAlign: "center",
};

const cardStyle = {
  background: "#fff",
  padding: "20px 22px",
  borderRadius: "16px",
  marginBottom: "14px",
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  alignItems: "stretch",
  boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
  border: "1px solid #eef2f7",
};

const cardHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 12,
  flexWrap: "wrap",
};

const cardTitleStyle = { margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" };

const statusPillStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
};
const dotStyle = { width: 6, height: 6, borderRadius: "50%" };

const metaGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 10,
  marginBottom: 14,
};
const metaLabelStyle = {
  display: "block",
  fontSize: 11,
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  fontWeight: 700,
  marginBottom: 2,
};
const metaValueStyle = { display: "block", color: "#0f172a", fontWeight: 600 };

const itensWrapStyle = {
  background: "#f8fafc",
  borderRadius: 10,
  padding: "10px 12px",
};
const itensListStyle = { listStyle: "none", margin: "6px 0 0", padding: 0 };
const itemRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "4px 0",
  borderBottom: "1px dashed #e2e8f0",
  fontSize: 14,
};
const qtdStyle = { color: "#64748b", fontWeight: 700 };

const actionsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  minWidth: 170,
};
const buttonStyle = {
  padding: "10px 14px",
  border: "none",
  borderRadius: "10px",
  background: "#7f1d1d",
  color: "#fff",
  fontWeight: 700,
  fontSize: 14,
};
const buttonGreenStyle = { ...buttonStyle, background: "#16a34a" };
const buttonGhostDangerStyle = {
  ...buttonStyle,
  background: "#fff",
  color: "#b91c1c",
  border: "1px solid #fecaca",
};

const toolbarStyle = {
  background: "#fff",
  borderRadius: "16px",
  padding: "12px 14px",
  marginBottom: "16px",
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "center",
  flexWrap: "wrap",
  border: "1px solid #eef2f7",
};
const filtersStyle = { display: "flex", gap: "8px", flexWrap: "wrap" };
const filterButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  border: "1px solid #e2e8f0",
  background: "#fff",
  color: "#475569",
  borderRadius: "999px",
  padding: "8px 14px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
  transition: "all .15s ease",
};
const filterButtonActiveStyle = {
  background: "#7f1d1d",
  color: "#fff",
  borderColor: "#7f1d1d",
  boxShadow: "0 2px 6px rgba(127,29,29,0.25)",
};
const badgeStyle = {
  background: "#f1f5f9",
  color: "#475569",
  borderRadius: 999,
  padding: "1px 8px",
  fontSize: 11,
  fontWeight: 800,
};
const badgeActiveStyle = { background: "rgba(255,255,255,0.2)", color: "#fff" };

const contadorStyle = { color: "#64748b", fontWeight: 700, fontSize: 13 };

const mostrarMaisStyle = {
  width: "100%",
  padding: "14px 18px",
  border: "1px solid #7f1d1d",
  borderRadius: "12px",
  background: "#fff",
  color: "#7f1d1d",
  fontWeight: 800,
  cursor: "pointer",
  marginTop: "10px",
  transition: "all .15s ease",
};

const fimListaStyle = {
  textAlign: "center",
  color: "#94a3b8",
  fontSize: 13,
  margin: "16px 0 4px",
};

export default PedidosFuncionario;
