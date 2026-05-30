/**
 * Configura o layout do perfil responsável.
 * Repassa menus e textos para DashboardShell (componente visual compartilhado).
 */
import DashboardShell from "../components/layout/DashboardShell";
import { bottomNavResponsavel, menuResponsavel } from "../config/navigation";

function ResponsavelLayout() {
  return (
    <DashboardShell
      menuItems={menuResponsavel}
      basePath="/responsavel"
      greeting="Olá, Responsável! 👋"
      pageTitle="Acompanhe os gastos e limites de seus dependentes."
      userLabel="Responsável"
      bottomNavItems={bottomNavResponsavel}
      hideExitOnHome
    />
  );
}

export default ResponsavelLayout;
