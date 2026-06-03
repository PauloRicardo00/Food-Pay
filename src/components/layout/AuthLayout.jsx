/**
 * Moldura visual das telas de autenticação (login, cadastro, boas-vindas).
 * Barra lateral com marca + card central com título e conteúdo (children).
 */
import { Link } from "react-router-dom";
import "../../pages/auth/auth.css";

function AuthLayout({ title, subtitle, children, showExit = true }) {
  return (
    <div className="auth-page">
      <aside className="auth-sidebar">
        <div className="auth-brand">
          <div className="auth-logo" aria-hidden="true">
            🍴
          </div>
          <h1>Food Pay</h1>
          <p>Sistema de Gestão de Alimentação</p>
        </div>
        {/* showExit false na tela inicial — não faz sentido "Sair" antes de entrar */}
        {showExit && (
          <Link to="/" className="auth-exit">
            Sair
          </Link>
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
