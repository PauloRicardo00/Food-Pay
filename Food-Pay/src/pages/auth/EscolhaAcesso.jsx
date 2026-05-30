/**
 * Primeira tela do app (rota /): escolha do perfil antes do login.
 */
import { Link } from "react-router-dom";
import { ChevronRight, GraduationCap, Briefcase, User } from "lucide-react";
import AuthLayout from "../../components/layout/AuthLayout";

const perfis = [
  {
    id: "responsavel",
    titulo: "Acessar como Responsável",
    descricao: "Acesse o sistema como responsável",
    icon: User,
    className: "auth-option--responsavel",
  },
  {
    id: "funcionario",
    titulo: "Acessar como Funcionário",
    descricao: "Acesse o sistema como funcionário",
    icon: Briefcase,
    className: "auth-option--funcionario",
  },
  {
    id: "aluno",
    titulo: "Acessar como Aluno",
    descricao: "Acesse o sistema como aluno",
    icon: GraduationCap,
    className: "auth-option--aluno",
  },
];

function EscolhaAcesso() {
  return (
    <AuthLayout
      title="Bem-vindo!"
      subtitle="Escolha como deseja acessar o sistema"
      showExit={false}
    >
      {perfis.map((perfil) => {
        const Icon = perfil.icon;
        return (
          <Link
            key={perfil.id}
            to={`/login?perfil=${perfil.id}`}
            className={`auth-option ${perfil.className}`}
          >
            <span className="auth-option-icon">
              <Icon size={20} />
            </span>
            <span className="auth-option-text">
              <strong>{perfil.titulo}</strong>
              <span>{perfil.descricao}</span>
            </span>
            <ChevronRight size={18} className="auth-option-arrow" />
          </Link>
        );
      })}
    </AuthLayout>
  );
}

export default EscolhaAcesso;
