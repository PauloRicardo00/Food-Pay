/**
 * Cadastro de nova conta — envia dados para register() do AuthContext.
 * Visual atualizado para seguir o mesmo padrão da tela de login/escolha.
 */
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./auth-modern.css";

const perfilInfo = {
  responsavel: {
    label: "Responsável",
    description: "Cadastre-se para acompanhar saldo, refeições e recargas",
    Icon: User,
  },
  funcionario: {
    label: "Funcionário",
    description: "Cadastre-se para gerenciar pedidos, cardápio e atendimento",
    Icon: Briefcase,
  },
  aluno: {
    label: "Aluno",
    description: "Cadastre-se para consultar cardápio e registrar refeições",
    Icon: GraduationCap,
  },
};

function Cadastro() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  const perfilParam = searchParams.get("perfil") || "aluno";
  const perfil = Object.keys(perfilInfo).includes(perfilParam) ? perfilParam : "aluno";
  const info = useMemo(() => perfilInfo[perfil], [perfil]);
  const Icon = info.Icon;

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro(null);
    setSucesso(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);

    try {
      await register({
        nome: form.get("nome"),
        email: form.get("email"),
        senha: form.get("senha"),
        perfil,
      });

      setSucesso("Conta criada! Faça login para continuar.");
      setTimeout(() => navigate(`/login?perfil=${perfil}`), 1500);
    } catch (err) {
      setErro(err.message || "Não foi possível cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-modern-page">
      <div className="auth-modern-bg" aria-hidden="true" />

      <header className="auth-modern-brand">
        <div className="auth-modern-brand-icon">
          <UtensilsCrossed size={20} />
        </div>
        <div className="auth-modern-brand-text">
          <p>Food Pay</p>
          <span>Sistema de Gestão de Alimentação</span>
        </div>
      </header>

      <section className="auth-modern-card auth-modern-card--cadastro">
        <Link to={`/login?perfil=${perfil}`} className="auth-modern-back">
          <ArrowLeft size={16} />
          Voltar
        </Link>

        <div className="auth-modern-header">
          <div className="auth-modern-main-icon">
            <Icon size={38} />
          </div>

          <h1>Criar cadastro</h1>
          <p>{info.description}</p>
        </div>

        {erro && <p className="auth-modern-error">{erro}</p>}
        {sucesso && <p className="auth-modern-success">{sucesso}</p>}

        <form className="auth-modern-form" onSubmit={handleSubmit}>
          <label htmlFor="nome">Nome completo</label>
          <div className="auth-modern-input-wrap">
            <User size={18} />
            <input
              id="nome"
              name="nome"
              type="text"
              placeholder="Seu nome completo"
              autoComplete="name"
              required
            />
          </div>

          <label htmlFor="email">E-mail</label>
          <div className="auth-modern-input-wrap">
            <Mail size={18} />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="voce@exemplo.com"
              autoComplete="email"
              required
            />
          </div>

          <label htmlFor="senha">Senha</label>
          <div className="auth-modern-input-wrap">
            <Lock size={18} />
            <input
              id="senha"
              name="senha"
              type={mostrarSenha ? "text" : "password"}
              placeholder="Crie uma senha"
              autoComplete="new-password"
              required
            />

            <button
              type="button"
              className="auth-modern-toggle-senha"
              onClick={() => setMostrarSenha((v) => !v)}
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            >
              {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" className="auth-modern-primary" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <p className="auth-modern-switch">
          Já tenho conta <Link to={`/login?perfil=${perfil}`}>Entrar</Link>
        </p>
      </section>

      <footer className="auth-modern-footer">
        © 2026 Food Pay — Todos os direitos reservados.
      </footer>
    </main>
  );
}

export default Cadastro;
