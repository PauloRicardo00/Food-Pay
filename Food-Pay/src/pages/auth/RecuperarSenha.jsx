/**
 * Tela "Esqueci a senha" — solicita e-mail, envia código por e-mail
 * e leva o usuário para /redefinir-senha.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, Mail, UtensilsCrossed } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { solicitarResetSenha } from "../../services/authService";
import "./auth-modern.css";

const perfilLabel = {
  aluno: "Aluno",
  funcionario: "Funcionário",
  responsavel: "Responsável",
};

function RecuperarSenha() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const perfilParam = searchParams.get("perfil") || "aluno";
  const perfil = perfilLabel[perfilParam] ? perfilParam : "aluno";

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [email, setEmail] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setErro(null);

    if (!email.includes("@")) {
      setErro("Informe um e-mail válido.");
      return;
    }

    setLoading(true);

    try {
      const res = await solicitarResetSenha({ email, perfil });

      toast.success(
        res?.mensagem || "Código enviado para o e-mail informado.",
        {
          duration: 6000,
        },
      );

      navigate(
        `/redefinir-senha?perfil=${perfil}&email=${encodeURIComponent(email)}`,
      );
    } catch (err) {
      setErro(
        err.message ||
          "Não foi possível enviar o código. Tente novamente.",
      );
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
        <Link to={`/login?perfil=${perfil}`} className="auth-modern-back">
          <ArrowLeft size={16} />
          Voltar ao login
        </Link>

        <div className="auth-modern-header">
          <div className="auth-modern-main-icon">
            <Mail size={38} />
          </div>

          <h1>Recuperar senha</h1>
          <p>
            Enviaremos um código de verificação para o e-mail cadastrado como{" "}
            <strong>{perfilLabel[perfil]}</strong>.
          </p>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-modern-primary"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar código de verificação"}
          </button>
        </form>

        <p className="auth-modern-switch">
          Lembrou da senha?{" "}
          <Link to={`/login?perfil=${perfil}`}>Voltar ao login</Link>
        </p>
      </section>

      <footer className="auth-modern-footer">
        © 2026 Food Pay — Todos os direitos reservados.
      </footer>
    </main>
  );
}

export default RecuperarSenha;