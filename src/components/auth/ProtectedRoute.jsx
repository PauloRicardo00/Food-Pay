/**
 * Guarda de rota: só renderiza filhos se o usuário estiver logado com o perfil correto.
 * Usado em AppRoutes.jsx envolvendo AlunoShell, FuncionarioLayout, etc.
 */
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ perfil, children }) {
  const { user, isAuthenticated, booting } = useAuth();
  const location = useLocation();

  // Enquanto verifica sessão, mostra loading (evita flash de login)
  if (booting) {
    return (
      <div className="app-loading-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  // Sem login → manda para tela de login com o perfil na query (?perfil=aluno)
  if (!isAuthenticated) {
    return <Navigate to={`/login?perfil=${perfil}`} state={{ from: location }} replace />;
  }

  // Logado com perfil diferente → redireciona para a área correta do usuário
  if (user.perfil !== perfil) {
    return <Navigate to={`/${user.perfil}`} replace />;
  }

  return children;
}

export default ProtectedRoute;
