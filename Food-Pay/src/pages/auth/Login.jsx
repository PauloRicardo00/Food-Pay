/**
 * Tela de login — lê ?perfil= da URL (vindo da escolha de acesso) e autentica via AuthContext.
 */
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { useAuth } from "../../context/AuthContext";
import { getHomeRoute } from "../../services/authService";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const perfil = searchParams.get("perfil") || "aluno";
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
    <AuthLayout
      title="Acesse sua conta"
      subtitle="Informe seu email e senha para entrar"
    >
      {erro && <p className="auth-error">{erro}</p>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <div className="auth-input-wrap">
          <Mail size={18} />
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Digite seu email"
            autoComplete="email"
            required
          />
        </div>

        <label htmlFor="senha">Senha</label>
        <div className="auth-input-wrap">
          <Lock size={18} />
          <input
            id="senha"
            name="senha"
            type={mostrarSenha ? "text" : "password"}
            placeholder="Digite sua senha"
            autoComplete="current-password"
            required
          />

          <button
            type="button"
            className="auth-toggle-senha"
            onClick={() => setMostrarSenha((v) => !v)}
            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
          >
            {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Link to={`/login?perfil=${perfil}`} className="auth-forgot">
          Esqueceu sua senha?
        </Link>

        <button type="submit" className="auth-btn-primary" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="auth-divider">ou</p>

      <Link to={`/cadastro?perfil=${perfil}`} className="auth-btn-secondary">
        Cadastrar
      </Link>

      <Link to="/" className="auth-link">
        Voltar para escolha de acesso
      </Link>
    </AuthLayout>
  );
}

export default Login;