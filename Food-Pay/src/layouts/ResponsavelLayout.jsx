/**
 * Layout do perfil responsável.
 * Passa as configurações específicas (menu, rotas, textos) para o DashboardShell compartilhado.
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
    />
  );
}

export default ResponsavelLayout;
