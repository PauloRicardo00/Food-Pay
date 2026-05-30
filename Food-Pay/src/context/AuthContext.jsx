/**
 * Contexto global de autenticação.
 * Qualquer componente pode usar useAuth() para saber se há usuário logado e chamar login/logout.
 */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  fetchCurrentUser,
  getStoredUser,
  login as loginService,
  logout as logoutService,
  register as registerService,
} from "../services/authService";

// Contexto React — valor null até o Provider preencher
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Inicia com usuário salvo no localStorage (se existir)
  const [user, setUser] = useState(getStoredUser);
  // booting = true enquanto valida sessão ao abrir o app
  const [booting, setBooting] = useState(true);

  // Ao carregar a página, tenta recuperar/validar usuário (mock ou API /auth/me)
  useEffect(() => {
    let active = true;
    fetchCurrentUser().then((u) => {
      if (active) {
        setUser(u);
        setBooting(false);
      }
    });
    // Cleanup: evita setState se o componente desmontar antes da resposta
    return () => {
      active = false;
    };
  }, []);

  // useMemo evita recriar o objeto a cada render (só muda se user/booting mudar)
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}
