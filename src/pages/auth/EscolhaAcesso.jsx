/**
 * Primeira tela do app (rota /): escolha do perfil antes do login.
 * Visual atualizado com base na tela nova, mantendo o redirecionamento por perfil.
 */
import { Link } from "react-router-dom";
import {
  ChevronRight,
  GraduationCap,
  Briefcase,
  User,
  UtensilsCrossed,
} from "lucide-react";
import "./auth-modern.css";

const perfis = [
  {
    id: "responsavel",
    titulo: "Responsável",
    descricao: "Acompanhe saldo, refeições e recargas",
    icon: User,
  },
  {
    id: "funcionario",
    titulo: "Funcionário",
    descricao: "Gerencie pedidos, cardápio e atendimento",
    icon: Briefcase,
  },
  {
    id: "aluno",
    titulo: "Aluno",
    descricao: "Consulte cardápio e registre refeições",
    icon: GraduationCap,
  },
];

function EscolhaAcesso() {
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

      <section className="auth-modern-card auth-modern-card--select">
        <div className="auth-modern-header">
          <div className="auth-modern-main-icon">
            <UtensilsCrossed size={38} />
          </div>

          <h1>Bem-vindo!</h1>
          <p>Escolha como deseja acessar o sistema</p>
        </div>

        <div className="auth-modern-options">
          {perfis.map((perfil) => {
            const Icon = perfil.icon;

            return (
              <Link
                key={perfil.id}
                to={`/login?perfil=${perfil.id}`}
                className="auth-modern-option"
              >
                <span className="auth-modern-option-icon">
                  <Icon size={22} />
                </span>

                <span className="auth-modern-option-text">
                  <strong>Acessar como {perfil.titulo}</strong>
                  <small>{perfil.descricao}</small>
                </span>

                <ChevronRight size={20} className="auth-modern-option-arrow" />
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="auth-modern-footer">
        © 2026 Food Pay — Todos os direitos reservados.
      </footer>
    </main>
  );
}

export default EscolhaAcesso;
