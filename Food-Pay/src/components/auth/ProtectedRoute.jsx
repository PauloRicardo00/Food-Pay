/**
 * Guarda de rota que garante acesso somente a usuários autenticados
 * com o perfil correto.
 *
 * - Não autenticado  → redireciona para /login?perfil=<perfil>
 * - Perfil incorreto → redireciona para a área do perfil do usuário logado
 * - Enquanto valida a sessão (booting) → exibe tela de carregamento
 *   para evitar flash indesejado de conteúdo ou redirecionamento prematuro
 */
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ perfil, children }) {
  const { user, isAuthenticated, booting } = useAuth();
  const location = useLocation();

  if (booting) {
    return (
      <div className="app-loading-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?perfil=${perfil}`} state={{ from: location }} replace />;
  }

  if (user.perfil !== perfil) {
    return <Navigate to={`/${user.perfil}`} replace />;
  }

  return children;
}

export default ProtectedRoute;
