/**
 * Definição de todas as rotas (URLs) do sistema.
 * BrowserRouter habilita navegação sem recarregar a página (SPA).
 */
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import EscolhaAcesso from "../pages/auth/EscolhaAcesso";
import Login from "../pages/auth/Login";
import Cadastro from "../pages/auth/Cadastro";
import Historico from "../pages/aluno/Historico";

import AlunoShell from "../components/layout/AlunoShell";
import FuncionarioLayout from "../layouts/FuncionarioLayout";
import ResponsavelLayout from "../layouts/ResponsavelLayout";

import DashboardAluno from "../pages/aluno/Dashboard";
import CardapioAluno from "../pages/aluno/Cardapio";
import PedidosAluno from "../pages/aluno/Pedidos";
import PerfilAluno from "../pages/aluno/Perfil";
import PagamentosAluno from "../pages/aluno/Pagamentos";
import NotificacoesAluno from "../pages/aluno/Notificacoes";
import Carrinho from "../pages/aluno/Carrinho";

import DashboardFuncionario from "../pages/funcionario/Dashboard";
import PedidosFuncionario from "../pages/funcionario/Pedidos";
import RelatoriosFuncionario from "../pages/funcionario/Relatorios";
import CardapioFuncionario from "../pages/funcionario/Cardapio";
import PerfilFuncionario from "../pages/funcionario/Perfil";
import PagamentosFuncionario from "../pages/funcionario/Pagamentos";
import ConfiguracoesFuncionario from "../pages/funcionario/Configuracoes";
import NotificacoesFuncionario from "../pages/funcionario/Notificacoes";

import Dependentes from "../pages/responsavel/Dependentes";   
import DashboardResponsavel from "../pages/responsavel/Dashboard";
import NotificacoesResponsavel from "../pages/responsavel/Notificacoes";
import LimiteResponsavel from "../pages/responsavel/Limite";
import GastosResponsavel from "../pages/responsavel/Gastos";
import HistoricoResponsavel from "../pages/responsavel/Historico";
import ConfiguracoesResponsavel from "../pages/responsavel/Configuracoes";
import PerfilResponsavel from "../pages/responsavel/Perfil";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EscolhaAcesso />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        <Route
          path="/aluno"
          element={
            <ProtectedRoute perfil="aluno">
              <AlunoShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardAluno />} />
          <Route path="pedidos" element={<PedidosAluno />} />
          <Route path="carrinho" element={<Carrinho />} />
          <Route path="pagamentos" element={<PagamentosAluno />} />
          <Route path="cardapio" element={<CardapioAluno />} />
          <Route path="historico" element={<Historico />} />
          <Route path="notificacoes" element={<NotificacoesAluno />} />
          <Route path="perfil" element={<PerfilAluno />} />
        </Route>

        <Route
          path="/funcionario"
          element={
            <ProtectedRoute perfil="funcionario">
              <FuncionarioLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardFuncionario />} />
          <Route path="pedidos" element={<PedidosFuncionario />} />
          <Route path="pagamentos" element={<PagamentosFuncionario />} />
          <Route path="cardapio" element={<CardapioFuncionario />} />
          <Route path="relatorios" element={<RelatoriosFuncionario />} />
          <Route path="perfil" element={<PerfilFuncionario />} />
          <Route path="configuracoes" element={<ConfiguracoesFuncionario />} />
          <Route path="notificacoes" element={<NotificacoesFuncionario />} />
        </Route>

        <Route
          path="/responsavel"
          element={
            <ProtectedRoute perfil="responsavel">
              <ResponsavelLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardResponsavel />} />
          <Route path="dependentes" element={<Dependentes />} />
          <Route path="perfil" element={<PerfilResponsavel />} />
          <Route path="limite" element={<LimiteResponsavel />} />
          <Route path="gastos" element={<GastosResponsavel />} />
          <Route path="historico" element={<HistoricoResponsavel />} />
          <Route path="notificacoes" element={<NotificacoesResponsavel />} />
          <Route path="configuracoes" element={<ConfiguracoesResponsavel />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;