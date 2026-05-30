/**
 * Componente raiz: apenas delega para o sistema de rotas.
 * Mantém App.jsx simples — a lógica de páginas fica em routes/AppRoutes.jsx.
 */
import AppRoutes from "./routes/AppRoutes";

function App() {
  return <AppRoutes />;
}

export default App;
