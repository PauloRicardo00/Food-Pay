/**
 * Redefinição de senha com código de verificação de 6 dígitos.
 * O e-mail é pré-preenchido via query string (?email=...) enviada
 * pela tela de RecuperarSenha para evitar redigitação.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  UtensilsCrossed,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { confirmarResetSenha } from "../../services/authService";
import "./auth-modern.css";

const perfilLabel = {
  aluno: "Aluno",
  funcionario: "Funcionário",
  responsavel: "Responsável",
};

function RedefinirSenha() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const perfilParam = searchParams.get("perfil") || "aluno";
  const perfil = perfilLabel[perfilParam] ? perfilParam : "aluno";
  const emailInicial = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailInicial);
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro(null);

    if (!email.includes("@")) return setErro("Informe um e-mail válido.");
    if (codigo.trim().length !== 6) return setErro("O código deve ter 6 dígitos.");
    if (senha.length < 6) return setErro("A nova senha deve ter pelo menos 6 caracteres.");
    if (senha !== confirmar) return setErro("As senhas não coincidem.");

    setLoading(true);
    try {
      const res = await confirmarResetSenha({
        email,
        perfil,
        codigo,
        novaSenha: senha,
      });

      toast.success(res?.mensagem || "Senha redefinida com sucesso!");
      navigate(`/login?perfil=${perfil}`);
    } catch (err) {
      setErro(err.message || "Não foi possível redefinir a senha.");
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
        <Link to={`/recuperar-senha?perfil=${perfil}`} className="auth-modern-back">
          <ArrowLeft size={16} />
          Voltar
        </Link>

        <div className="auth-modern-header">
          <div className="auth-modern-main-icon">
            <KeyRound size={38} />
          </div>
          <h1>Redefinir senha</h1>
          <p>
            Digite o código de 6 dígitos enviado para o seu e-mail e escolha
            uma nova senha.
          </p>
        </div>

        {erro && <p className="auth-modern-error">{erro}</p>}

        <form className="auth-modern-form" onSubmit={handleSubmit}>
          <label htmlFor="email">E-mail</label>
          <div className="auth-modern-input-wrap">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label htmlFor="codigo">Código de verificação</label>
          <div className="auth-modern-input-wrap">
            <KeyRound size={18} />
            <input
              id="codigo"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
              required
              style={{ letterSpacing: "0.4em", fontWeight: 700 }}
            />
          </div>

          <label htmlFor="senha">Nova senha</label>
          <div className="auth-modern-input-wrap">
            <Lock size={18} />
            <input
              id="senha"
              type={mostrar ? "text" : "password"}
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <button
              type="button"
              className="auth-modern-toggle-senha"
              onClick={() => setMostrar((v) => !v)}
              aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
            >
              {mostrar ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <label htmlFor="confirmar">Confirmar nova senha</label>
          <div className="auth-modern-input-wrap">
            <Lock size={18} />
            <input
              id="confirmar"
              type={mostrar ? "text" : "password"}
              placeholder="••••••••"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-modern-primary" disabled={loading}>
            {loading ? "Redefinindo..." : "Redefinir senha"}
          </button>
        </form>

        <p className="auth-modern-switch">
          <Link to={`/recuperar-senha?perfil=${perfil}`}>Não recebi o código</Link>
          {" · "}
          <Link to={`/login?perfil=${perfil}`}>Voltar ao login</Link>
        </p>
      </section>

      <footer className="auth-modern-footer">
        © 2026 Food Pay — Todos os direitos reservados.
      </footer>
    </main>
  );
}

export default RedefinirSenha;
