import { Router } from "express";
import { db } from "../db.js";
import { autenticar } from "../auth.js";
import * as ig from "../instagram.js";

export const rotaInstagram = Router();

function donoDaCarteira(usuario) {
  return usuario.tipo === "social_media" && usuario.agencia_id ? usuario.agencia_id : usuario.id;
}

function clienteAcessivel(usuario, clienteId) {
  const cliente = db.prepare("SELECT * FROM clientes WHERE id = ?").get(clienteId);
  if (!cliente) return null;
  return cliente.dono_id === donoDaCarteira(usuario) ? cliente : null;
}

function redirectUriDoRequest(req) {
  return `${req.protocol}://${req.get("host")}/api/instagram/callback`;
}

rotaInstagram.get("/clientes/:id/autorizar", autenticar, (req, res) => {
  if (!ig.integracaoConfigurada()) {
    return res.status(503).json({ erro: "Integração com Instagram ainda não configurada nesse ambiente." });
  }
  const cliente = clienteAcessivel(req.usuario, req.params.id);
  if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado." });

  const retorno = req.usuario.tipo === "agencia" ? "/agencia" : "/clientes";
  const state = ig.assinarEstado({ clienteId: cliente.id, retorno });
  res.json({ url: ig.urlAutorizacao(redirectUriDoRequest(req), state) });
});

rotaInstagram.get("/callback", async (req, res) => {
  const { code, state, error } = req.query;
  if (error || !code || !state) return res.redirect("/clientes?instagram=erro");

  let retorno = "/clientes";
  try {
    const dadosEstado = ig.lerEstado(state);
    retorno = dadosEstado.retorno || retorno;
    const { clienteId } = dadosEstado;

    const curto = await ig.trocarCodigoPorToken(code, redirectUriDoRequest(req));
    const longo = await ig.paraTokenDeLongaDuracao(curto.access_token);
    const perfil = await ig.buscarPerfil(longo.access_token);

    const expiraEm = new Date(Date.now() + longo.expires_in * 1000).toISOString();
    db.prepare(`
      UPDATE clientes SET
        instagram_user_id = ?, instagram_username = ?, instagram_access_token = ?,
        instagram_token_expira_em = ?, instagram_conectado_em = datetime('now')
      WHERE id = ?
    `).run(String(perfil.user_id), perfil.username, longo.access_token, expiraEm, clienteId);

    res.redirect(`${retorno}?instagram=conectado`);
  } catch {
    res.redirect(`${retorno}?instagram=erro`);
  }
});

rotaInstagram.post("/clientes/:id/desconectar", autenticar, (req, res) => {
  const cliente = clienteAcessivel(req.usuario, req.params.id);
  if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado." });

  db.prepare(`
    UPDATE clientes SET instagram_user_id = NULL, instagram_username = NULL,
      instagram_access_token = NULL, instagram_token_expira_em = NULL, instagram_conectado_em = NULL
    WHERE id = ?
  `).run(cliente.id);
  res.json({ ok: true });
});

rotaInstagram.get("/posts/:postId/comentarios", autenticar, async (req, res) => {
  const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.postId);
  if (!post) return res.status(404).json({ erro: "Post não encontrado." });
  const cliente = clienteAcessivel(req.usuario, post.cliente_id);
  if (!cliente) return res.status(404).json({ erro: "Post não encontrado." });
  if (!post.instagram_media_id) return res.status(400).json({ erro: "Esse post ainda não foi publicado no Instagram." });
  if (!cliente.instagram_access_token) return res.status(400).json({ erro: "Cliente não tem Instagram conectado." });

  try {
    const comentarios = await ig.listarComentarios(post.instagram_media_id, cliente.instagram_access_token);
    res.json({ comentarios });
  } catch (err) {
    res.status(502).json({ erro: err.message });
  }
});

/* insights reais (alcance/engajamento) agregados dos últimos posts publicados
   no Instagram do cliente — só existe quando o Instagram está conectado; sem
   conexão não tem como saber nada real, então não é chamado. */
rotaInstagram.get("/clientes/:id/insights", autenticar, async (req, res) => {
  const cliente = clienteAcessivel(req.usuario, req.params.id);
  if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado." });
  if (!cliente.instagram_access_token) return res.status(400).json({ erro: "Cliente não tem Instagram conectado." });

  const publicados = db.prepare(`
    SELECT id, instagram_media_id, instagram_permalink FROM posts
    WHERE cliente_id = ? AND status = 'publicado' AND instagram_media_id IS NOT NULL
    ORDER BY instagram_publicado_em DESC LIMIT 12
  `).all(cliente.id);

  if (publicados.length === 0) {
    return res.json({ postsConsiderados: 0, alcance: 0, engajamento: 0 });
  }

  let alcance = 0;
  let engajamento = 0;
  let postsConsiderados = 0;
  for (const post of publicados) {
    try {
      const metricas = await ig.buscarInsightsMedia(post.instagram_media_id, cliente.instagram_access_token);
      alcance += metricas.reach || 0;
      engajamento += (metricas.likes || 0) + (metricas.comments || 0) + (metricas.saved || 0) + (metricas.shares || 0);
      postsConsiderados += 1;
    } catch {
      // uma mídia sem insights disponíveis (ainda processando, tipo não suportado etc.)
      // não deve derrubar o resto do agregado — só é ignorada
    }
  }

  res.json({ postsConsiderados, alcance, engajamento });
});

rotaInstagram.post("/posts/:postId/comentarios/:comentarioId/responder", autenticar, async (req, res) => {
  const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.postId);
  if (!post) return res.status(404).json({ erro: "Post não encontrado." });
  const cliente = clienteAcessivel(req.usuario, post.cliente_id);
  if (!cliente || !cliente.instagram_access_token) {
    return res.status(400).json({ erro: "Cliente não tem Instagram conectado." });
  }

  const { mensagem } = req.body || {};
  if (!mensagem?.trim()) return res.status(400).json({ erro: "Escreva uma resposta." });

  try {
    await ig.responderComentario(req.params.comentarioId, cliente.instagram_access_token, mensagem.trim());
    res.json({ ok: true });
  } catch (err) {
    res.status(502).json({ erro: err.message });
  }
});
