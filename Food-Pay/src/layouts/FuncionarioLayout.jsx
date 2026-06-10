/**
 * Layout do perfil funcionário.
 * Passa as configurações específicas (menu, rotas, textos) para o DashboardShell compartilhado.
 */
import DashboardShell from "../components/layout/DashboardShell";
import { bottomNavFuncionario, menuFuncionario } from "../config/navigation";

function FuncionarioLayout() {
  return (
    <DashboardShell
      menuItems={menuFuncionario}
      basePath="/funcionario"
      greeting="Olá, Funcionário! 👋"
      pageTitle="Gerencie pedidos, produtos e relatórios da cantina."
      userLabel="Funcionário"
      bottomNavItems={bottomNavFuncionario}
    />
  );
}

export default FuncionarioLayout;
