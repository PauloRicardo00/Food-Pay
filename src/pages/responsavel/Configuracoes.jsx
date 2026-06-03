import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../api/client";

function ConfiguracoesResponsavel() {
  const [usuario, setUsuario] = useState(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [receberNotificacoes, setReceberNotificacoes] = useState(true);
  const [avisarLimite, setAvisarLimite] = useState(true);
  const [avisarRecarga, setAvisarRecarga] = useState(true);

  useEffect(() => {
    carregarUsuario();
    carregarPreferencias();
  }, []);

  async function carregarUsuario() {
    try {
      const data = await api.get("/Auth/me");

      setUsuario(data);
      setNome(data.nome);
      setEmail(data.email);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      toast.error("Erro ao carregar configurações.");
    }
  }

  function carregarPreferencias() {
    const preferencias = JSON.parse(
      localStorage.getItem("foodpay_config_responsavel")
    );

    if (preferencias) {
      setReceberNotificacoes(preferencias.receberNotificacoes);
      setAvisarLimite(preferencias.avisarLimite);
      setAvisarRecarga(preferencias.avisarRecarga);
    }
  }

  function salvarConfiguracoes() {
    const preferencias = {
      receberNotificacoes,
      avisarLimite,
      avisarRecarga,
    };

    localStorage.setItem(
      "foodpay_config_responsavel",
      JSON.stringify(preferencias)
    );

    toast.success("Configurações salvas com sucesso!");
  }

  if (!usuario) {
    return (
      <div style={pageStyle}>
        <h1>Configurações</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={tituloStyle}>Configurações</h1>

      <div style={gridStyle}>
        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Dados pessoais</h2>

          <label style={labelStyle}>Nome</label>
          <div style={infoBoxStyle}>{nome}</div>

          <label style={labelStyle}>Email</label>
          <div style={infoBoxStyle}>{email}</div>

          <label style={labelStyle}>Perfil</label>
          <div style={infoBoxStyle}>Responsável</div>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Preferências</h2>

          <ConfigOption
            title="Receber notificações"
            description="Permite receber avisos sobre pedidos, saldo e limite."
            checked={receberNotificacoes}
            onChange={() => setReceberNotificacoes(!receberNotificacoes)}
          />

          <ConfigOption
            title="Avisar quando o limite for atingido"
            description="Exibe avisos quando o consumo se aproximar do limite diário."
            checked={avisarLimite}
            onChange={() => setAvisarLimite(!avisarLimite)}
          />

          <ConfigOption
            title="Avisar sobre recargas"
            description="Exibe notificações quando uma recarga for realizada."
            checked={avisarRecarga}
            onChange={() => setAvisarRecarga(!avisarRecarga)}
          />

          <button style={buttonStyle} onClick={salvarConfiguracoes}>
            Salvar configurações
          </button>
        </section>
      </div>
    </div>
  );
}

function ConfigOption({ title, description, checked, onChange }) {
  return (
    <div style={optionStyle}>
      <div>
        <strong>{title}</strong>
        <p style={descriptionStyle}>{description}</p>
      </div>

      <label style={switchStyle}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={{ display: "none" }}
        />

        <span
          style={{
            ...switchTrackStyle,
            background: checked ? "#2563eb" : "#cbd5e1",
          }}
        >
          <span
            style={{
              ...switchThumbStyle,
              transform: checked ? "translateX(22px)" : "translateX(0)",
            }}
          />
        </span>
      </label>
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

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "18px",
};

const cardStyle = {
  background: "#fff",
  borderRadius: "18px",
  padding: "24px",
};

const sectionTitleStyle = {
  fontSize: "24px",
  marginBottom: "18px",
};

const labelStyle = {
  display: "block",
  fontWeight: "600",
  marginBottom: "6px",
  marginTop: "14px",
};

const optionStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  padding: "16px 0",
  borderBottom: "1px solid #e5e7eb",
};

const descriptionStyle = {
  color: "#64748b",
  marginTop: "4px",
};

const switchStyle = {
  cursor: "pointer",
};

const switchTrackStyle = {
  width: "48px",
  height: "26px",
  borderRadius: "999px",
  padding: "3px",
  display: "block",
  transition: "0.2s",
};

const switchThumbStyle = {
  width: "20px",
  height: "20px",
  background: "#fff",
  borderRadius: "50%",
  display: "block",
  transition: "0.2s",
};

const buttonStyle = {
  width: "100%",
  marginTop: "20px",
  padding: "12px",
  border: "none",
  borderRadius: "10px",
  background: "#2563eb",
  color: "#fff",
  fontWeight: "600",
  cursor: "pointer",
};

const infoBoxStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  background: "#f8fafc",
  minHeight: "46px",
  display: "flex",
  alignItems: "center",
  color: "#0f172a",
};

export default ConfiguracoesResponsavel;