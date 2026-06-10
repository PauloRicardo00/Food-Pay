/**
 * Configuração de limites diário/semanal/mensal e recarga de saldo por dependente.
 */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api, getApiErrorMessage } from "../../api/client";

function Limite() {
  const [dependentes, setDependentes] = useState([]);
  const [limites, setLimites] = useState({});
  const [recargas, setRecargas] = useState({});
  const [loading, setLoading] = useState(true);
  const [salvandoLimiteId, setSalvandoLimiteId] = useState(null);
  const [recarregandoId, setRecarregandoId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pagamento = params.get("pagamento");
    const sessionId = params.get("session_id");

    async function tratarRetornoStripe() {
      if (pagamento === "sucesso") {
        try {
          if (sessionId) {
            toast.loading("Confirmando recarga...", { id: "confirmar-recarga" });
            await api.post(`/Pagamentos/confirmar-checkout/${sessionId}`);
            toast.success("Recarga confirmada! Atualizando saldo...", {
              id: "confirmar-recarga",
            });
          } else {
            toast.success("Recarga realizada com sucesso! Atualizando saldo...");
          }
        } catch (error) {
          console.error("Erro ao confirmar recarga:", error);
          toast.error(
            getApiErrorMessage(
              error,
              "Pagamento aprovado, mas não foi possível confirmar a atualização do saldo. Atualize a página em alguns segundos."
            ),
            { id: "confirmar-recarga" }
          );
        } finally {
          window.history.replaceState({}, "", "/responsavel/limite");

          carregarDependentes();
          setTimeout(() => carregarDependentes(), 1500);
          setTimeout(() => carregarDependentes(), 3000);
          setTimeout(() => carregarDependentes(), 5000);
        }

        return;
      }

      if (pagamento === "cancelado") {
        toast.error("Recarga cancelada.");
        window.history.replaceState({}, "", "/responsavel/limite");
        carregarDependentes();
        return;
      }

      carregarDependentes();
    }

    tratarRetornoStripe();
  }, []);

  async function carregarDependentes() {
    try {
      setLoading(true);
      const data = await api.get("/ResponsavelAluno");
      setDependentes(data);

      const limitesIniciais = {};
      data.forEach((item) => {
        limitesIniciais[item.aluno.id] = {
          diario: item.aluno.limiteDiario ?? "",
          semanal:
            item.aluno.limiteSemanal ??
            Number(item.aluno.limiteDiario || 0) * 7,
          mensal:
            item.aluno.limiteMensal ??
            Number(item.aluno.limiteDiario || 0) * 30,
        };
      });

      setLimites(limitesIniciais);
    } catch (error) {
      console.error("Erro ao carregar limites:", error);
      toast.error(getApiErrorMessage(error, "Erro ao carregar limites."));
    } finally {
      setLoading(false);
    }
  }

  function normalizarValor(valor) {
    return Number(String(valor || "").replace(",", "."));
  }

  function atualizarCampoLimite(alunoId, campo, valor) {
    setLimites((valores) => ({
      ...valores,
      [alunoId]: {
        ...(valores[alunoId] || {}),
        [campo]: valor,
      },
    }));
  }

  async function recarregarViaStripe(alunoId) {
    const valorConvertido = normalizarValor(recargas[alunoId]);

    if (!valorConvertido || valorConvertido <= 0) {
      toast.error("Informe um valor válido para recarregar.");
      return;
    }

    setRecarregandoId(alunoId);

    try {
      const data = await api.post("/Pagamentos/criar-checkout", {
        alunoId,
        valor: valorConvertido,
      });

      window.location.href = data.url;
    } catch (error) {
      console.error("Erro ao iniciar pagamento Stripe:", error);
      toast.error(getApiErrorMessage(error, "Erro ao iniciar pagamento Stripe."));
      setRecarregandoId(null);
    }
  }

  async function atualizarLimites(alunoId) {
    const valores = limites[alunoId] || {};
    const limiteDiario = normalizarValor(valores.diario);
    const limiteSemanal = normalizarValor(valores.semanal);
    const limiteMensal = normalizarValor(valores.mensal);

    if (!limiteDiario || !limiteSemanal || !limiteMensal) {
      toast.error("Informe os três limites: diário, semanal e mensal.");
      return;
    }

    if (limiteDiario <= 0 || limiteSemanal <= 0 || limiteMensal <= 0) {
      toast.error("Os limites devem ser valores positivos.");
      return;
    }

    if (limiteSemanal < limiteDiario) {
      toast.error("O limite semanal não pode ser menor que o limite diário.");
      return;
    }

    if (limiteMensal < limiteSemanal) {
      toast.error("O limite mensal não pode ser menor que o limite semanal.");
      return;
    }

    if (
      [limiteDiario, limiteSemanal, limiteMensal].some(
        (valor) => valor > 99999.99
      )
    ) {
      toast.error("O limite máximo permitido é R$ 99.999,99.");
      return;
    }

    setSalvandoLimiteId(alunoId);

    try {
      await api.put(`/ResponsavelAluno/aluno/${alunoId}/limites`, {
        limiteDiario,
        limiteSemanal,
        limiteMensal,
      });

      toast.success("Limites atualizados!");
      await carregarDependentes();
    } catch (error) {
      console.error("Erro ao atualizar limites:", error);
      toast.error(getApiErrorMessage(error, "Erro ao atualizar limites."));
    } finally {
      setSalvandoLimiteId(null);
    }
  }

  if (loading) {
    return (
      <div style={pageStyle}>
        <h1 style={tituloStyle}>Limite de gastos</h1>
        <p>Carregando dependentes...</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={tituloStyle}>Limite de gastos</h1>

      {dependentes.length === 0 ? (
        <p>Nenhum dependente encontrado.</p>
      ) : (
        dependentes.map((item) => {
          const valores = limites[item.aluno.id] || {};

          return (
            <div key={item.alunoId} style={cardStyle}>
              <div style={infoDependenteStyle}>
                <h2>{item.aluno.nome}</h2>
                <p>Email: {item.aluno.email}</p>
                <p>
                  Saldo atual:{" "}
                  <strong>R$ {Number(item.aluno.saldo).toFixed(2)}</strong>
                </p>

                <div style={resumoLimitesStyle}>
                  <span>
                    Diário:{" "}
                    <strong>
                      R$ {Number(item.aluno.limiteDiario || 0).toFixed(2)}
                    </strong>
                  </span>

                  <span>
                    Semanal:{" "}
                    <strong>
                      R$ {Number(item.aluno.limiteSemanal || 0).toFixed(2)}
                    </strong>
                  </span>

                  <span>
                    Mensal:{" "}
                    <strong>
                      R$ {Number(item.aluno.limiteMensal || 0).toFixed(2)}
                    </strong>
                  </span>
                </div>
              </div>

              <div style={acoesStyle}>
                <div style={blocoAcaoStyle}>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Valor para recarregar"
                    value={recargas[item.aluno.id] || ""}
                    onChange={(event) =>
                      setRecargas((valores) => ({
                        ...valores,
                        [item.aluno.id]: event.target.value,
                      }))
                    }
                    style={inputStyle}
                  />

                  <button
                    style={{
                      ...buttonBlue,
                      opacity: recarregandoId === item.aluno.id ? 0.7 : 1,
                      cursor:
                        recarregandoId === item.aluno.id
                          ? "not-allowed"
                          : "pointer",
                    }}
                    onClick={() => recarregarViaStripe(item.aluno.id)}
                    disabled={recarregandoId === item.aluno.id}
                  >
                    {recarregandoId === item.aluno.id
                      ? "Abrindo pagamento..."
                      : "Recarregar saldo"}
                  </button>

                  <small style={stripeNoteStyle}>
                    Pagamento processado com segurança pela plataforma Stripe.
                  </small>
                </div>

                <div style={blocoAcaoStyle}>
                  <div style={limitesGridStyle}>
                    <label style={campoLimiteStyle}>
                      <span style={labelLimiteStyle}>Diário</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ex: 20"
                        value={valores.diario ?? ""}
                        onChange={(event) =>
                          atualizarCampoLimite(
                            item.aluno.id,
                            "diario",
                            event.target.value
                          )
                        }
                        style={inputStyle}
                      />
                    </label>

                    <label style={campoLimiteStyle}>
                      <span style={labelLimiteStyle}>Semanal</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ex: 140"
                        value={valores.semanal ?? ""}
                        onChange={(event) =>
                          atualizarCampoLimite(
                            item.aluno.id,
                            "semanal",
                            event.target.value
                          )
                        }
                        style={inputStyle}
                      />
                    </label>

                    <label style={campoLimiteStyle}>
                      <span style={labelLimiteStyle}>Mensal</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ex: 450"
                        value={valores.mensal ?? ""}
                        onChange={(event) =>
                          atualizarCampoLimite(
                            item.aluno.id,
                            "mensal",
                            event.target.value
                          )
                        }
                        style={inputStyle}
                      />
                    </label>
                  </div>

                  <button
                    style={{
                      ...buttonGreen,
                      opacity: salvandoLimiteId === item.aluno.id ? 0.7 : 1,
                      cursor:
                        salvandoLimiteId === item.aluno.id
                          ? "not-allowed"
                          : "pointer",
                    }}
                    onClick={() => atualizarLimites(item.aluno.id)}
                    disabled={salvandoLimiteId === item.aluno.id}
                  >
                    {salvandoLimiteId === item.aluno.id
                      ? "Atualizando..."
                      : "Atualizar limites"}
                  </button>

                  <small style={limitesNoteStyle}>
                    Diário = máximo que o aluno pode gastar por dia. Semanal =
                    máximo por semana. Mensal = máximo por mês.
                  </small>
                </div>
              </div>
            </div>
          );
        })
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

const cardStyle = {
  background: "#fff",
  borderRadius: "18px",
  padding: "22px",
  marginBottom: "18px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  flexWrap: "wrap",
  gap: "18px",
  overflow: "hidden",
};

const infoDependenteStyle = {
  flex: "1 1 240px",
  minWidth: "200px",
};

const resumoLimitesStyle = {
  marginTop: "12px",
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  color: "#475569",
  fontSize: "13px",
};

const acoesStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "14px",
  flex: "1 1 540px",
  width: "100%",
  maxWidth: "640px",
  minWidth: 0,
  boxSizing: "border-box",
};

const blocoAcaoStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const limitesGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
  gap: "8px",
  width: "100%",
  minWidth: 0,
};

const campoLimiteStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
  minWidth: 0,
};

const labelLimiteStyle = {
  color: "#475569",
  fontSize: "12px",
  fontWeight: "700",
};

const inputStyle = {
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  padding: "10px 11px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
};

const buttonBlue = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "none",
  borderRadius: "10px",
  background: "#635bff",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "14px",
};

const buttonGreen = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "none",
  borderRadius: "10px",
  background: "#16a34a",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "14px",
};

const stripeNoteStyle = {
  color: "#64748b",
  fontSize: "12px",
  lineHeight: 1.4,
};

const limitesNoteStyle = {
  color: "#64748b",
  fontSize: "12px",
  lineHeight: 1.4,
};

export default Limite;