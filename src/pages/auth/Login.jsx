/**
 * Tela de login — lê ?perfil= da URL e autentica via AuthContext.
 * "Lembrar-me" removido. Link de "Esqueci a senha" leva à tela /recuperar-senha.
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
import { getHomeRoute } from "../../services/authService";
import "./auth-modern.css";

const perfilInfo = {
  responsavel: {
    label: "Responsável",
    description: "Acompanhe saldo, refeições e recargas",
    Icon: User,
  },
  funcionario: {
    label: "Funcionário",
    description: "Gerencie pedidos, cardápio e atendimento",
    Icon: Briefcase,
  },
  aluno: {
    label: "Aluno",
    description: "Consulte cardápio e registre refeições",
    Icon: GraduationCap,
  },
};

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const perfilParam = searchParams.get("perfil") || "aluno";
  const perfil = Object.keys(perfilInfo).includes(perfilParam) ? perfilParam : "aluno";
  const info = useMemo(() => perfilInfo[perfil], [perfil]);
  const Icon = info.Icon;

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);

    try {
      const result = await login({
        email: form.get("email"),
        senha: form.get("senha"),
        perfil,
      });

      navigate(getHomeRoute(result.user.perfil));
    } catch (err) {
      setErro(err.message || "Não foi possível entrar. Verifique seus dados.");
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

      <section className="auth-modern-card">
        <Link to="/" className="auth-modern-back">
          <ArrowLeft size={16} />
          Voltar
        </Link>

        <div className="auth-modern-header">
          <div className="auth-modern-main-icon">
            <Icon size={38} />
          </div>

          <h1>Entrar como {info.label}</h1>
          <p>{info.description}</p>
        </div>

        {erro && <p className="auth-modern-error">{erro}</p>}

        <form className="auth-modern-form" onSubmit={handleSubmit}>
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
              placeholder="••••••••"
              autoComplete="current-password"
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

          <div className="auth-modern-form-row" style={{ justifyContent: "flex-end" }}>
            <Link to={`/recuperar-senha?perfil=${perfil}`} className="auth-modern-forgot">
              Esqueci a senha
            </Link>
          </div>

          <button type="submit" className="auth-modern-primary" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="auth-modern-switch">
          Trocar perfil? <Link to="/">Voltar à seleção</Link>
        </p>

        <Link to={`/cadastro?perfil=${perfil}`} className="auth-modern-register">
          Criar cadastro
        </Link>
      </section>

      <footer className="auth-modern-footer">
        © 2026 Food Pay — Todos os direitos reservados.
      </footer>
    </main>
  );
}

export default Login;
