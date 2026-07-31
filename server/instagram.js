import jwt from "jsonwebtoken";

const APP_ID = process.env.INSTAGRAM_APP_ID;
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET;
const SEGREDO_ESTADO = process.env.EASYMEDIA_JWT_SECRET || "dev-secret-troque-em-producao";

const AUTH_BASE = "https://www.instagram.com/oauth/authorize";
const TOKEN_BASE = "https://api.instagram.com/oauth/access_token";
const API_BASE = "https://graph.instagram.com";

export function integracaoConfigurada() {
  return Boolean(APP_ID && APP_SECRET);
}

export function assinarEstado(payload) {
  return jwt.sign(payload, SEGREDO_ESTADO, { expiresIn: "10m" });
}

export function lerEstado(state) {
  return jwt.verify(state, SEGREDO_ESTADO);
}

export function urlAutorizacao(redirectUri, state) {
  const params = new URLSearchParams({
    client_id: APP_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "instagram_business_basic,instagram_business_content_publish,instagram_business_manage_comments,instagram_business_manage_insights",
    state,
  });
  return `${AUTH_BASE}?${params.toString()}`;
}

async function chamarForm(url, corpo) {
  const resposta = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(corpo),
  });
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.error_message || dados.error?.message || "Erro na API do Instagram.");
  return dados;
}

async function chamarGet(url) {
  const resposta = await fetch(url);
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.error?.message || "Erro na API do Instagram.");
  return dados;
}

export async function trocarCodigoPorToken(code, redirectUri) {
  return chamarForm(TOKEN_BASE, {
    client_id: APP_ID,
    client_secret: APP_SECRET,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
  });
}

export async function paraTokenDeLongaDuracao(tokenCurto) {
  const params = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_secret: APP_SECRET,
    access_token: tokenCurto,
  });
  return chamarGet(`${API_BASE}/access_token?${params.toString()}`);
}

export async function renovarToken(tokenAtual) {
  const params = new URLSearchParams({ grant_type: "ig_refresh_token", access_token: tokenAtual });
  return chamarGet(`${API_BASE}/refresh_access_token?${params.toString()}`);
}

export async function buscarPerfil(token) {
  const params = new URLSearchParams({ fields: "user_id,username,account_type", access_token: token });
  return chamarGet(`${API_BASE}/me?${params.toString()}`);
}

async function publicarContainer(igUserId, token, creationId) {
  const publicado = await chamarForm(`${API_BASE}/${igUserId}/media_publish`, {
    creation_id: creationId,
    access_token: token,
  });
  const detalhe = await chamarGet(`${API_BASE}/${publicado.id}?fields=permalink&access_token=${token}`);
  return { mediaId: publicado.id, permalink: detalhe.permalink };
}

export async function publicarImagemUnica(igUserId, token, urlImagem, legenda) {
  const container = await chamarForm(`${API_BASE}/${igUserId}/media`, {
    image_url: urlImagem,
    caption: legenda || "",
    access_token: token,
  });
  return publicarContainer(igUserId, token, container.id);
}

export async function publicarCarrossel(igUserId, token, urlsImagens, legenda) {
  const itens = [];
  for (const url of urlsImagens) {
    const item = await chamarForm(`${API_BASE}/${igUserId}/media`, {
      image_url: url,
      is_carousel_item: "true",
      access_token: token,
    });
    itens.push(item.id);
  }
  const container = await chamarForm(`${API_BASE}/${igUserId}/media`, {
    media_type: "CAROUSEL",
    children: itens.join(","),
    caption: legenda || "",
    access_token: token,
  });
  return publicarContainer(igUserId, token, container.id);
}

export async function listarComentarios(mediaId, token) {
  const dados = await chamarGet(`${API_BASE}/${mediaId}/comments?fields=id,text,username,timestamp&access_token=${token}`);
  return dados.data || [];
}

export async function responderComentario(commentId, token, mensagem) {
  return chamarForm(`${API_BASE}/${commentId}/replies`, { message: mensagem, access_token: token });
}

/* insights reais de uma mídia publicada (alcance e interações) — exige o
   escopo instagram_business_manage_insights concedido na conexão do cliente */
export async function buscarInsightsMedia(mediaId, token) {
  const params = new URLSearchParams({
    metric: "reach,likes,comments,saved,shares",
    access_token: token,
  });
  const dados = await chamarGet(`${API_BASE}/${mediaId}/insights?${params.toString()}`);
  const porMetrica = {};
  (dados.data || []).forEach(m => {
    const valor = m.values?.[0]?.value ?? m.total_value?.value ?? 0;
    porMetrica[m.name] = valor;
  });
  return porMetrica;
}
