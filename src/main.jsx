/**
 * Ponto de entrada da aplicação React.
 * Monta o app no elemento #root do index.html e envolve tudo com os provedores necessários.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { Toaster } from "react-hot-toast";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
        }}
      />

      <App />
    </AuthProvider>
  </StrictMode>
);