import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../api/client";

function Limite() {
  const [dependentes, setDependentes] = useState([]);

  useEffect(() => {
    carregarDependentes();
  }, []);

  async function carregarDependentes() {
    try {
      const data = await api.get("/ResponsavelAluno");
      setDependentes(data);
    } catch (error) {
      console.error("Erro ao carregar limites:", error);
      toast.error("Erro ao carregar limites.");
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
    <div style={pageStyle}>
      <h1 style={tituloStyle}>Limite de gastos</h1>

      {dependentes.length === 0 ? (
        <p>Nenhum dependente encontrado.</p>
      ) : (
        dependentes.map((item) => (
          <div key={item.alunoId} style={cardStyle}>
            <div>
              <h2>{item.aluno.nome}</h2>
              <p>Email: {item.aluno.email}</p>
              <p>
                Limite diário atual:{" "}
                <strong>R$ {Number(item.aluno.limiteDiario).toFixed(2)}</strong>
              </p>
            </div>

            <div style={acoesStyle}>
              <input
                type="number"
                placeholder="Novo limite diário"
                id={`limite-${item.aluno.id}`}
                style={inputStyle}
              />

              <button
                style={buttonStyle}
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
  padding: "24px",
  marginBottom: "18px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
};

const acoesStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  width: "260px",
};

const inputStyle = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
};

const buttonStyle = {
  padding: "12px",
  border: "none",
  borderRadius: "10px",
  background: "#16a34a",
  color: "#fff",
  cursor: "pointer",
};

export default Limite;