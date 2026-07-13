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
  const ehFormData = opcoes.body instanceof FormData;
  const resposta = await fetch(`/api${caminho}`, {
    ...opcoes,
    headers: {
      ...(ehFormData ? {} : { "Content-Type": "application/json" }),
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

  listarPosts: () => requisitar("/posts"),
  criarPost: (clienteId, formData) => requisitar(`/posts/clientes/${clienteId}`, { method: "POST", body: formData }),
  atualizarStatusPost: (id, status, feedback) =>
    requisitar(`/posts/${id}`, { method: "PATCH", body: JSON.stringify({ status, feedback }) }),
  removerPost: id => requisitar(`/posts/${id}`, { method: "DELETE" }),

  listarPostsClientePublico: token => requisitar(`/posts/acesso/${token}`),
  aprovarPostCliente: (token, postId) => requisitar(`/posts/acesso/${token}/${postId}/aprovar`, { method: "POST" }),
  reprovarPostCliente: (token, postId, feedback) =>
    requisitar(`/posts/acesso/${token}/${postId}/reprovar`, { method: "POST", body: JSON.stringify({ feedback }) }),

  atualizarPerfil: formData => requisitar("/auth/perfil", { method: "PATCH", body: formData }),

  listarReunioes: (inicio, fim) => requisitar(`/agenda?inicio=${inicio}&fim=${fim}`),
  criarReuniao: dados => requisitar("/agenda", { method: "POST", body: JSON.stringify(dados) }),
  removerReuniao: id => requisitar(`/agenda/${id}`, { method: "DELETE" }),
};
