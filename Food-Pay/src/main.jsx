/**
 * Ponto de entrada da aplicação.
 * Provedores globais:
 *   - AuthProvider  → contexto de autenticação
 *   - Toaster       → notificações toast
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { Toaster } from "react-hot-toast";
import "./index.css";

try {
  localStorage.removeItem("foodpay_theme");
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.classList.remove("dark");
} catch {
  // localStorage pode estar indisponível em alguns contextos; ignorar.
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{ duration: 3000 }}
      />
      <App />
    </AuthProvider>
  </StrictMode>,
);
