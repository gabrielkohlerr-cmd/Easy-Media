import { Router } from "express";
import path from "node:path";
import fs from "node:fs";
import { db } from "../db.js";
import { autenticar } from "../auth.js";
import { uploadMidiasPost, PASTA_UPLOADS } from "../uploads.js";
import * as ig from "../instagram.js";

export const rotaPosts = Router();

const TIPOS_VALIDOS = ["reels", "carrossel", "estatico"];
const STATUS_VALIDOS = ["aguardando", "agendado", "publicado", "alteracao"];

function donoDaCarteira(usuario) {
  return usuario.tipo === "social_media" && usuario.agencia_id ? usuario.agencia_id : usuario.id;
}

function clienteAcessivel(usuario, clienteId) {
  const cliente = db.prepare("SELECT * FROM clientes WHERE id = ?").get(clienteId);
  if (!cliente) return null;
  return cliente.dono_id === donoDaCarteira(usuario) ? cliente : null;
}

function carregarMidias(postId) {
  return db.prepare("SELECT id, url, tipo, ordem FROM posts_midias WHERE post_id = ? ORDER BY ordem").all(postId);
}

function serializarPost(post, clienteNome) {
  return {
    id: post.id,
    clienteId: post.cliente_id,
    cliente: clienteNome,
    tipo: post.tipo,
    titulo: post.titulo,
    legenda: post.legenda,
    data: post.data_agendada,
    hora: post.hora_agendada,
    status: post.status,
    feedback: post.feedback,
    midias: carregarMidias(post.id),
    instagramMediaId: post.instagram_media_id,
    instagramPermalink: post.instagram_permalink,
    instagramErro: post.instagram_erro,
  };
}

/* tenta publicar de verdade no Instagram do cliente quando o post é aprovado.
   Falha silenciosamente (grava o erro em instagram_erro) sem quebrar a aprovação —
   o cliente pode não ter Instagram conectado, ou a chamada pode falhar por vários
   motivos fora do nosso controle (token expirado, mídia não acessível publicamente etc). */
async function tentarPublicarNoInstagram(post, cliente, baseUrl) {
  if (!cliente.instagram_access_token) return;

  const midias = carregarMidias(post.id);
  if (!midias.length) return;

  if (midias.some(m => m.tipo === "video")) {
    db.prepare("UPDATE posts SET instagram_erro = ? WHERE id = ?")
      .run("Publicação automática de vídeo ainda não é suportada. Publique manualmente pelo Instagram.", post.id);
    return;
  }

  const urls = midias.map(m => `${baseUrl}${m.url}`);
  try {
    const resultado = urls.length > 1
      ? await ig.publicarCarrossel(cliente.instagram_user_id, cliente.instagram_access_token, urls, post.legenda)
      : await ig.publicarImagemUnica(cliente.instagram_user_id, cliente.instagram_access_token, urls[0], post.legenda);

    db.prepare(`
      UPDATE posts SET status = 'publicado', instagram_media_id = ?, instagram_permalink = ?,
        instagram_publicado_em = datetime('now'), instagram_erro = NULL
      WHERE id = ?
    `).run(resultado.mediaId, resultado.permalink, post.id);
  } catch (err) {
    db.prepare("UPDATE posts SET instagram_erro = ? WHERE id = ?").run(err.message, post.id);
  }
}

/* lista todos os posts dos clientes acessíveis ao usuário autenticado */
rotaPosts.get("/", autenticar, (req, res) => {
  const donoId = donoDaCarteira(req.usuario);
  const linhas = db.prepare(`
    SELECT p.*, c.nome AS cliente_nome
    FROM posts p JOIN clientes c ON c.id = p.cliente_id
    WHERE c.dono_id = ?
    ORDER BY p.criado_em DESC
  `).all(donoId);
  res.json({ posts: linhas.map(p => serializarPost(p, p.cliente_nome)) });
});

rotaPosts.post("/clientes/:clienteId", autenticar, uploadMidiasPost.array("midias", 10), (req, res) => {
  const cliente = clienteAcessivel(req.usuario, req.params.clienteId);
  if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado." });

  const { tipo, titulo, legenda, data, hora } = req.body || {};
  if (!TIPOS_VALIDOS.includes(tipo)) return res.status(400).json({ erro: "Tipo de post inválido." });
  if (!titulo?.trim()) return res.status(400).json({ erro: "Informe um título para o post." });
  if (!req.files?.length) return res.status(400).json({ erro: "Envie ao menos uma imagem ou vídeo." });
  if (tipo !== "carrossel" && req.files.length > 1) {
    return res.status(400).json({ erro: "Apenas o formato Carrossel aceita mais de um arquivo." });
  }

  const resultado = db.prepare(`
    INSERT INTO posts (cliente_id, autor_id, tipo, titulo, legenda, data_agendada, hora_agendada)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(cliente.id, req.usuario.id, tipo, titulo.trim(), legenda?.trim() || null, data || null, hora || null);

  const inserirMidia = db.prepare("INSERT INTO posts_midias (post_id, url, tipo, ordem) VALUES (?, ?, ?, ?)");
  req.files.forEach((arquivo, indice) => {
    const tipoMidia = arquivo.mimetype.startsWith("video/") ? "video" : "imagem";
    inserirMidia.run(resultado.lastInsertRowid, `/uploads/posts/${arquivo.filename}`, tipoMidia, indice);
  });

  const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(resultado.lastInsertRowid);
  res.status(201).json({ post: serializarPost(post, cliente.nome) });
});

rotaPosts.patch("/:id", autenticar, async (req, res) => {
  const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
  const cliente = post && clienteAcessivel(req.usuario, post.cliente_id);
  if (!post || !cliente) return res.status(404).json({ erro: "Post não encontrado." });

  const { status, feedback } = req.body || {};
  if (!STATUS_VALIDOS.includes(status)) return res.status(400).json({ erro: "Status inválido." });

  db.prepare("UPDATE posts SET status = ?, feedback = ? WHERE id = ?").run(status, feedback?.trim() || null, post.id);

  if (status === "agendado") {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    await tentarPublicarNoInstagram(post, cliente, baseUrl);
  }

  const atualizado = db.prepare("SELECT * FROM posts WHERE id = ?").get(post.id);
  res.json({ post: serializarPost(atualizado, cliente.nome) });
});

/* revisa um post com alteração solicitada e reenvia pro cliente aprovar de novo,
   permitindo trocar título/legenda/data/hora e opcionalmente substituir a mídia
   (geralmente é o motivo do pedido de alteração: algum detalhe na imagem) */
rotaPosts.patch("/:id/reenviar", autenticar, uploadMidiasPost.array("midias", 10), (req, res) => {
  const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
  const cliente = post && clienteAcessivel(req.usuario, post.cliente_id);
  if (!post || !cliente) return res.status(404).json({ erro: "Post não encontrado." });
  if (post.status !== "alteracao") {
    return res.status(400).json({ erro: "Só é possível revisar posts com alteração solicitada pelo cliente." });
  }

  const { titulo, legenda, data, hora } = req.body || {};
  if (!titulo?.trim()) return res.status(400).json({ erro: "Informe um título para o post." });
  if (post.tipo !== "carrossel" && req.files?.length > 1) {
    return res.status(400).json({ erro: "Apenas o formato Carrossel aceita mais de um arquivo." });
  }

  db.prepare(`
    UPDATE posts SET titulo = ?, legenda = ?, data_agendada = ?, hora_agendada = ?,
      status = 'aguardando', feedback = NULL
    WHERE id = ?
  `).run(titulo.trim(), legenda?.trim() || null, data || null, hora || null, post.id);

  if (req.files?.length) {
    const antigas = carregarMidias(post.id);
    db.prepare("DELETE FROM posts_midias WHERE post_id = ?").run(post.id);
    antigas.forEach(m => {
      fs.unlink(path.join(PASTA_UPLOADS, m.url.replace("/uploads/", "")), () => {});
    });

    const inserirMidia = db.prepare("INSERT INTO posts_midias (post_id, url, tipo, ordem) VALUES (?, ?, ?, ?)");
    req.files.forEach((arquivo, indice) => {
      const tipoMidia = arquivo.mimetype.startsWith("video/") ? "video" : "imagem";
      inserirMidia.run(post.id, `/uploads/posts/${arquivo.filename}`, tipoMidia, indice);
    });
  }

  const atualizado = db.prepare("SELECT * FROM posts WHERE id = ?").get(post.id);
  res.json({ post: serializarPost(atualizado, cliente.nome) });
});

rotaPosts.delete("/:id", autenticar, (req, res) => {
  const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
  if (!post || !clienteAcessivel(req.usuario, post.cliente_id)) {
    return res.status(404).json({ erro: "Post não encontrado." });
  }
  db.prepare("DELETE FROM posts WHERE id = ?").run(post.id);
  res.json({ ok: true });
});

/* pública: posts do cliente via link de acesso (sem senha) */
rotaPosts.get("/acesso/:token", (req, res) => {
  const cliente = db.prepare("SELECT * FROM clientes WHERE token_acesso = ?").get(req.params.token);
  if (!cliente) return res.status(404).json({ erro: "Link inválido." });

  const linhas = db.prepare("SELECT * FROM posts WHERE cliente_id = ? ORDER BY criado_em DESC").all(cliente.id);
  res.json({ posts: linhas.map(p => serializarPost(p, cliente.nome)) });
});

function postDoClientePorToken(token, postId) {
  const cliente = db.prepare("SELECT * FROM clientes WHERE token_acesso = ?").get(token);
  if (!cliente) return null;
  const post = db.prepare("SELECT * FROM posts WHERE id = ? AND cliente_id = ?").get(postId, cliente.id);
  return post ? { post, cliente } : null;
}

rotaPosts.post("/acesso/:token/:postId/aprovar", async (req, res) => {
  const achado = postDoClientePorToken(req.params.token, req.params.postId);
  if (!achado) return res.status(404).json({ erro: "Post não encontrado." });

  db.prepare("UPDATE posts SET status = 'agendado', feedback = NULL WHERE id = ?").run(achado.post.id);

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  await tentarPublicarNoInstagram(achado.post, achado.cliente, baseUrl);

  res.json({ ok: true });
});

rotaPosts.post("/acesso/:token/:postId/reprovar", (req, res) => {
  const achado = postDoClientePorToken(req.params.token, req.params.postId);
  if (!achado) return res.status(404).json({ erro: "Post não encontrado." });

  const { feedback } = req.body || {};
  if (!feedback?.trim()) return res.status(400).json({ erro: "Descreva a alteração desejada." });

  db.prepare("UPDATE posts SET status = 'alteracao', feedback = ? WHERE id = ?").run(feedback.trim(), achado.post.id);
  res.json({ ok: true });
});
