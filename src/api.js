const CHAVE_TOKEN = "ezmedia-token";

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
  criarCliente: dados => requisitar("/clientes", { method: "POST", body: JSON.stringify(dados) }),
  removerCliente: id => requisitar(`/clientes/${id}`, { method: "DELETE" }),
  rotacionarLinkCliente: id => requisitar(`/clientes/${id}/rotacionar-link`, { method: "POST" }),
  acessoCliente: token => requisitar(`/clientes/acesso/${token}`),

  listarPosts: () => requisitar("/posts"),
  criarPost: (clienteId, formData) => requisitar(`/posts/clientes/${clienteId}`, { method: "POST", body: formData }),
  atualizarStatusPost: (id, status, feedback) =>
    requisitar(`/posts/${id}`, { method: "PATCH", body: JSON.stringify({ status, feedback }) }),
  reenviarPost: (id, formData) => requisitar(`/posts/${id}/reenviar`, { method: "PATCH", body: formData }),
  removerPost: id => requisitar(`/posts/${id}`, { method: "DELETE" }),

  listarPostsClientePublico: token => requisitar(`/posts/acesso/${token}`),
  aprovarPostCliente: (token, postId) => requisitar(`/posts/acesso/${token}/${postId}/aprovar`, { method: "POST" }),
  reprovarPostCliente: (token, postId, feedback) =>
    requisitar(`/posts/acesso/${token}/${postId}/reprovar`, { method: "POST", body: JSON.stringify({ feedback }) }),

  atualizarPerfil: formData => requisitar("/auth/perfil", { method: "PATCH", body: formData }),

  listarReunioes: (inicio, fim) => requisitar(`/agenda?inicio=${inicio}&fim=${fim}`),
  criarReuniao: dados => requisitar("/agenda", { method: "POST", body: JSON.stringify(dados) }),
  removerReuniao: id => requisitar(`/agenda/${id}`, { method: "DELETE" }),

  obterUrlAutorizacaoInstagram: clienteId => requisitar(`/instagram/clientes/${clienteId}/autorizar`),
  desconectarInstagram: clienteId => requisitar(`/instagram/clientes/${clienteId}/desconectar`, { method: "POST" }),
  listarComentariosInstagram: postId => requisitar(`/instagram/posts/${postId}/comentarios`),
  responderComentarioInstagram: (postId, comentarioId, mensagem) =>
    requisitar(`/instagram/posts/${postId}/comentarios/${comentarioId}/responder`, {
      method: "POST", body: JSON.stringify({ mensagem }),
    }),

  listarQuadrosKanban: () => requisitar("/kanban/quadros"),
  listarMembrosQuadroKanban: quadroId => requisitar(`/kanban/quadros/${quadroId}/membros`),
  listarCartoesKanban: quadroId => requisitar(`/kanban/quadros/${quadroId}/cartoes`),
  criarCartaoKanban: (quadroId, dados) =>
    requisitar(`/kanban/quadros/${quadroId}/cartoes`, { method: "POST", body: JSON.stringify(dados) }),
  obterCartaoKanban: id => requisitar(`/kanban/cartoes/${id}`),
  atualizarCartaoKanban: (id, dados) => requisitar(`/kanban/cartoes/${id}`, { method: "PATCH", body: JSON.stringify(dados) }),
  removerCartaoKanban: id => requisitar(`/kanban/cartoes/${id}`, { method: "DELETE" }),
  adicionarMembroCartao: (id, usuarioId) =>
    requisitar(`/kanban/cartoes/${id}/membros`, { method: "POST", body: JSON.stringify({ usuarioId }) }),
  removerMembroCartao: (id, usuarioId) => requisitar(`/kanban/cartoes/${id}/membros/${usuarioId}`, { method: "DELETE" }),
  comentarCartao: (id, texto) =>
    requisitar(`/kanban/cartoes/${id}/comentarios`, { method: "POST", body: JSON.stringify({ texto }) }),
  anexarArquivoCartao: (id, formData) => requisitar(`/kanban/cartoes/${id}/arquivos`, { method: "POST", body: formData }),
  anexarLinkCartao: (id, url, nome) =>
    requisitar(`/kanban/cartoes/${id}/links`, { method: "POST", body: JSON.stringify({ url, nome }) }),
  removerAnexoCartao: (id, anexoId) => requisitar(`/kanban/cartoes/${id}/anexos/${anexoId}`, { method: "DELETE" }),
};
