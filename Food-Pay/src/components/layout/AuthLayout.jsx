/**
 * Layout compartilhado das telas de autenticação (login, cadastro, recuperação de senha).
 * Estrutura: barra lateral com a marca à esquerda + card central com título e conteúdo.
 */
import { Link } from "react-router-dom";

function AuthLayout({ title, subtitle, children, showExit = true }) {
  return (
    <div className="auth-page">
      <aside className="auth-sidebar">
        <div className="auth-brand">
          <div className="auth-logo" aria-hidden="true">🍴</div>
          <h1>Food Pay</h1>
          <p>Sistema de Gestão de Alimentação</p>
        </div>

        {/* showExit: false na tela de escolha de perfil, onde "Sair" não faz sentido */}
        {showExit && (
          <Link to="/" className="auth-exit">Sair</Link>
        )}
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-avatar" aria-hidden="true" />
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
          {children}
        </div>
        <p className="auth-footer">© 2026 Food Pay - Todos os direitos reservados.</p>
      </main>
    </div>
  );
}

export default AuthLayout;
