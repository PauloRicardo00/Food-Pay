/**
 * Contexto global de autenticação.
 *
 * Provê ao restante da aplicação:
 *   user          – objeto do usuário logado (ou null)
 *   isAuthenticated – booleano derivado de user
 *   booting       – true enquanto a sessão é validada na inicialização
 *   login / register / logout – ações que atualizam o estado global
 *
 * Uso: importe useAuth() em qualquer componente dentro de <AuthProvider>.
 */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  fetchCurrentUser,
  getStoredUser,
  login as loginService,
  logout as logoutService,
  register as registerService,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [booting, setBooting] = useState(true);

  /**
   * Ao montar, valida a sessão existente no localStorage.
   * Em modo real chama GET /auth/me; em mock retorna o usuário salvo.
   * O flag `active` evita atualização de estado após desmontagem.
   */
  useEffect(() => {
    let active = true;
    fetchCurrentUser().then((u) => {
      if (active) {
        setUser(u);
        setBooting(false);
      }
    });
    return () => { active = false; };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      booting,
      async login(credentials) {
        const result = await loginService(credentials);
        setUser(result.user);
        return result;
      },
      async register(payload) {
        return registerService(payload);
      },
      logout() {
        logoutService();
        setUser(null);
      },
    }),
    [user, booting],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook que lança erro se usado fora do AuthProvider */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
