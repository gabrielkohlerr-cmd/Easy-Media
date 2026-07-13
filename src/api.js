const CHAVE_TOKEN = "easymedia-token";

export function obterToken() {
  return localStorage.getItem(CHAVE_TOKEN);
}

export function salvarToken(token) {
  localStorage.setItem(CHAVE_TOKEN, token);
}

export function limparToken() {
  localStorage.removeItem(CHAVE_TOKEN);
}

async function requisitar(caminho, opcoes = {}) {
  const token = obterToken();
  const resposta = await fetch(`/api${caminho}`, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opcoes.headers,
    },
  });

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.erro || "Algo deu errado. Tente novamente.");
  return dados;
}

export const api = {
  registrar: dados => requisitar("/auth/registro", { method: "POST", body: JSON.stringify(dados) }),
  login: dados => requisitar("/auth/login", { method: "POST", body: JSON.stringify(dados) }),
  eu: () => requisitar("/auth/me"),

  criarConvite: () => requisitar("/squad/convites", { method: "POST" }),
  listarConvites: () => requisitar("/squad/convites"),
  revogarConvite: id => requisitar(`/squad/convites/${id}`, { method: "DELETE" }),
  infoConvite: token => requisitar(`/squad/convites/${token}/info`),
  aceitarConvite: token => requisitar(`/squad/convites/${token}/aceitar`, { method: "POST" }),
  listarMembros: () => requisitar("/squad/membros"),
  removerMembro: id => requisitar(`/squad/membros/${id}`, { method: "DELETE" }),

  listarClientes: () => requisitar("/clientes"),
  criarCliente: nome => requisitar("/clientes", { method: "POST", body: JSON.stringify({ nome }) }),
  removerCliente: id => requisitar(`/clientes/${id}`, { method: "DELETE" }),
  rotacionarLinkCliente: id => requisitar(`/clientes/${id}/rotacionar-link`, { method: "POST" }),
  acessoCliente: token => requisitar(`/clientes/acesso/${token}`),
};
