/**
 * Cadastro de nova conta — envia dados para register() do AuthContext.
 */
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { useAuth } from "../../context/AuthContext";

function Cadastro() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  const perfil = searchParams.get("perfil") || "aluno";
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
    <AuthLayout
      title="Criar conta"
      subtitle="Preencha os dados para se cadastrar"
    >
      {erro && <p className="auth-error">{erro}</p>}
      {sucesso && <p className="auth-success">{sucesso}</p>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="nome">Nome</label>
        <input id="nome" name="nome" type="text" placeholder="Seu nome completo" required />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Digite seu email"
          autoComplete="email"
          required
        />

        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          name="senha"
          type="password"
          placeholder="Crie uma senha"
          autoComplete="new-password"
          required
        />

        <button type="submit" className="auth-btn-primary" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>

      <Link to={`/login?perfil=${perfil}`} className="auth-link">
        Já tenho conta — Entrar
      </Link>
    </AuthLayout>
  );
}

export default Cadastro;
