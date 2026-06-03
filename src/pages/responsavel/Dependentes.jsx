import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../api/client";

function Dependentes() {
  const [dependentes, setDependentes] = useState([]);

  useEffect(() => {
    carregarDependentes();
  }, []);

  async function carregarDependentes() {
    try {
      const data = await api.get("/ResponsavelAluno");
      setDependentes(data);
    } catch (error) {
      console.error("Erro ao carregar dependentes:", error);
      toast.error("Erro ao carregar dependentes.");
    }
  }

  async function atualizarSaldo(alunoId, saldo) {
    try {
      await api.put(`/ResponsavelAluno/aluno/${alunoId}/saldo`, Number(saldo));

      toast.success("Saldo atualizado!");

      carregarDependentes();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar saldo.");
    }
  }

  async function recarregarViaStripe(alunoId, valor) {
    if (!valor || Number(valor) <= 0) {
      toast("Informe um valor válido para recarregar.");
      return;
    }

    try {
      const data = await api.post("/Stripe/criar-checkout", {
        alunoId,
        valor: Number(valor),
      });

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao iniciar pagamento Stripe.");
    }
  }

  async function atualizarLimite(alunoId, limite) {
    if (!limite || Number(limite) <= 0) {
      toast("Informe um limite válido.");
      return;
    }

    try {
      await api.put(`/ResponsavelAluno/aluno/${alunoId}/limite`, Number(limite));

      toast.success("Limite atualizado!");

      carregarDependentes();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar limite.");
    }
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1 style={tituloStyle}>Meus Dependentes</h1>

      {dependentes.length === 0 ? (
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
            </div>

            <div style={acoesStyle}>
              <input
                type="number"
                placeholder="Valor para recarregar"
                id={`saldo-${item.aluno.id}`}
                style={inputStyle}
              />

              <button
                style={buttonBlue}
                onClick={() =>
                  recarregarViaStripe(
                    item.aluno.id,
                    document.getElementById(`saldo-${item.aluno.id}`).value
                  )
                }
              >
                Recarregar via Stripe
              </button>

              <input
                type="number"
                placeholder="Novo limite"
                id={`limite-${item.aluno.id}`}
                style={inputStyle}
              />

              <button
                style={buttonGreen}
                onClick={() =>
                  atualizarLimite(
                    item.aluno.id,
                    document.getElementById(`limite-${item.aluno.id}`).value
                  )
                }
              >
                Atualizar limite
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const tituloStyle = {
  fontSize: "42px",
  fontWeight: "700",
  marginBottom: "24px",
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
};

const buttonBlue = {
  padding: "12px",
  border: "none",
  borderRadius: "10px",
  background: "#635bff",
  color: "#fff",
  cursor: "pointer",
};

const buttonGreen = {
  padding: "12px",
  border: "none",
  borderRadius: "10px",
  background: "#16a34a",
  color: "#fff",
  cursor: "pointer",
};

export default Dependentes;