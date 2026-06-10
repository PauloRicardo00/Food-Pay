/**
 * Gerenciamento de dependentes — lista, adiciona e remove alunos vinculados ao responsável.
 * A recarga e alteração de limite ficam na tela "Limite de gastos".
 */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api, getApiErrorMessage } from "../../api/client";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

function Dependentes() {
  const [dependentes, setDependentes] = useState([]);
  const [emailAluno, setEmailAluno] = useState("");
  const [loading, setLoading] = useState(true);
  const [adicionando, setAdicionando] = useState(false);
  const [removendoId, setRemovendoId] = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  useEffect(() => {
    carregarDependentes();
  }, []);

  async function carregarDependentes() {
    try {
      setLoading(true);
      const data = await api.get("/ResponsavelAluno");
      setDependentes(data);
    } catch (error) {
      console.error("Erro ao carregar dependentes:", error);
      toast.error(getApiErrorMessage(error, "Erro ao carregar dependentes."));
    } finally {
      setLoading(false);
    }
  }

  async function adicionarDependente(event) {
    event.preventDefault();

    const email = emailAluno.trim();

    if (!email) {
      toast.error("Informe o e-mail do aluno.");
      return;
    }

    setAdicionando(true);

    try {
      await api.post("/ResponsavelAluno/meus-dependentes", {
        alunoEmail: email,
        permiteAlterarLimite: true,
        recebeNotificacao: true,
      });

      toast.success("Dependente adicionado com sucesso!");
      setEmailAluno("");
      await carregarDependentes();
    } catch (error) {
      console.error("Erro ao adicionar dependente:", error);
      toast.error(getApiErrorMessage(error, "Erro ao adicionar dependente."));
    } finally {
      setAdicionando(false);
    }
  }

  function removerDependente(alunoId, alunoNome) {
    setConfirmState({
      title: `Remover ${alunoNome}?`,
      description:
        "O aluno não será excluído do sistema. Apenas o vínculo com este responsável será removido.",
      confirmLabel: "Remover dependente",
      cancelLabel: "Cancelar",
      variant: "danger",
      onConfirm: () => executarRemocao(alunoId),
    });
  }

  async function executarRemocao(alunoId) {
    setRemovendoId(alunoId);
    try {
      await api.delete(`/ResponsavelAluno/aluno/${alunoId}`);
      toast.success("Dependente removido com sucesso!");
      await carregarDependentes();
    } catch (error) {
      console.error("Erro ao remover dependente:", error);
      toast.error(getApiErrorMessage(error, "Erro ao remover dependente."));
    } finally {
      setRemovendoId(null);
    }
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1 style={tituloStyle}>Meus Dependentes</h1>

      <form style={formStyle} onSubmit={adicionarDependente}>
        <div>
          <h2 style={formTitleStyle}>Adicionar dependente</h2>
          <p style={formTextStyle}>
            Informe o e-mail do aluno já cadastrado para vinculá-lo à sua conta.
          </p>
        </div>

        <div style={formActionsStyle}>
          <input
            type="email"
            placeholder="E-mail do aluno"
            value={emailAluno}
            onChange={(event) => setEmailAluno(event.target.value)}
            style={inputStyle}
          />

          <button
            type="submit"
            style={{
              ...buttonBlue,
              opacity: adicionando ? 0.7 : 1,
              cursor: adicionando ? "not-allowed" : "pointer",
            }}
            disabled={adicionando}
          >
            {adicionando ? "Adicionando..." : "Adicionar dependente"}
          </button>
        </div>
      </form>

      {loading ? (
        <p>Carregando dependentes...</p>
      ) : dependentes.length === 0 ? (
        <p>Nenhum dependente encontrado.</p>
      ) : (
        dependentes.map((item) => (
          <div key={item.alunoId} style={cardStyle}>
            <div>
              <h2>{item.aluno.nome}</h2>

              <p>Email: {item.aluno.email}</p>

              <p>
                Saldo atual:{" "}
                <strong>R$ {Number(item.aluno.saldo).toFixed(2)}</strong>
              </p>

              <p>
                Limite diário:{" "}
                <strong>R$ {Number(item.aluno.limiteDiario).toFixed(2)}</strong>
              </p>

              <p style={permissoesStyle}>
                {item.permiteAlterarLimite
                  ? "Permissão para alterar limite ativa"
                  : "Sem permissão para alterar limite"}
                {" · "}
                {item.recebeNotificacao
                  ? "Notificações ativas"
                  : "Notificações desativadas"}
              </p>
            </div>

            <div style={acoesStyle}>
              <button
                style={{
                  ...buttonRed,
                  opacity: removendoId === item.aluno.id ? 0.7 : 1,
                  cursor: removendoId === item.aluno.id ? "not-allowed" : "pointer",
                }}
                onClick={() => removerDependente(item.aluno.id, item.aluno.nome)}
                disabled={removendoId === item.aluno.id}
              >
                {removendoId === item.aluno.id ? "Removendo..." : "Remover dependente"}
              </button>

              <small style={infoStyle}>
                Para recarregar saldo ou alterar limite, acesse "Limite de gastos".
              </small>
            </div>
          </div>
        ))
      )}
      <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
    </div>
  );
}

const tituloStyle = {
  fontSize: "42px",
  fontWeight: "700",
  marginBottom: "24px",
};

const formStyle = {
  background: "#fff",
  padding: "24px",
  borderRadius: "18px",
  marginBottom: "24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "24px",
};

const formTitleStyle = {
  margin: "0 0 8px",
  fontSize: "24px",
};

const formTextStyle = {
  margin: 0,
  color: "#64748b",
};

const formActionsStyle = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
  minWidth: "460px",
};

const cardStyle = {
  background: "#fff",
  padding: "24px",
  borderRadius: "18px",
  marginBottom: "18px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "30px",
};

const acoesStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  width: "250px",
};

const inputStyle = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  flex: 1,
};

const buttonBlue = {
  padding: "12px",
  border: "none",
  borderRadius: "10px",
  background: "#635bff",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "700",
};

const buttonRed = {
  padding: "12px",
  border: "none",
  borderRadius: "10px",
  background: "#dc2626",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "700",
};

const infoStyle = {
  color: "#64748b",
  fontSize: "12px",
  lineHeight: 1.4,
};

const permissoesStyle = {
  marginTop: "10px",
  color: "#64748b",
  fontSize: "13px",
};

export default Dependentes;
