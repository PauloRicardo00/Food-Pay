/**
 * Autenticação: login, cadastro, sessão e logout.
 * Alterna entre mock (desenvolvimento) e API real conforme env.useMock.
 */
import { api, setToken } from "../api/client";
import { endpoints } from "../api/endpoints";
import { env } from "../config/env";
import { homePorPerfil } from "../config/navigation";

const USER_KEY = "foodpay_user";

function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  setToken(null);
  localStorage.removeItem(USER_KEY);
}

/** Simula login sem servidor */
async function loginMock({ email, perfil }) {
  await delay(400);

  const user = {
    id: "mock-1",
    nome: email?.split("@")[0] || "Usuário",
    email: email || "usuario@email.com",
    perfil: perfil || "aluno",
  };

  const token = "mock-jwt-token";

  setToken(token);
  saveUser(user);

  return { token, user };
}

async function registerMock(payload) {
  await delay(400);

  return {
    message: "Cadastro realizado com sucesso",
    email: payload.email,
  };
}

/** LOGIN REAL */
async function loginApi({ email, senha, perfil }) {
  const data = await api.post(
    endpoints.auth.login,
    { email, senha, perfil },
    { auth: false },
  );

  const user = data.user;

  setToken(data.token);
  saveUser(user);

  return {
    token: data.token,
    user,
  };
}

/** CADASTRO REAL */
async function registerApi({ nome, email, senha, perfil }) {

  if (perfil === "funcionario") {
    return api.post(
      "/funcionarios",
      {
        nome,
        email,
        senhaHash: senha,
        cargo: "Atendente",
        ativo: true,
      },
      { auth: false },
    );
  }

  if (perfil === "responsavel") {
    return api.post(
      "/responsaveis",
      {
        nome,
        email,
        senhaHash: senha,
        telefone: "",
        ativo: true,
      },
      { auth: false },
    );
  }

  return api.post(
    "/alunos",
    {
      nome,
      email,
      senhaHash: senha,
      saldo: 0,
      limiteDiario: 20,
      ativo: true,
    },
    { auth: false },
  );
}

export async function login(credentials) {
  if (env.useMock) {
    return loginMock(credentials);
  }

  return loginApi(credentials);
}

export async function register(payload) {
  if (env.useMock) {
    return registerMock(payload);
  }

  return registerApi(payload);
}

/** Valida sessão */
export async function fetchCurrentUser() {
  const stored = getStoredUser();

  if (env.useMock) {
    return stored;
  }

  if (!stored) return null;

  try {
    const user = await api.get(endpoints.auth.me);

    saveUser(user);

    return user;
  } catch {
    clearSession();
    return null;
  }
}

export function logout() {
  clearSession();

  if (!env.useMock) {
    api.post(endpoints.auth.logout, {}).catch(() => { });
  }
}

/** Rota inicial por perfil */
export function getHomeRoute(perfil) {
  return homePorPerfil[perfil] || "/aluno";
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}