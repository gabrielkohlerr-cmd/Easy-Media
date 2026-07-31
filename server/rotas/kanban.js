import { Router } from "express";
import { db } from "../db.js";
import { autenticar } from "../auth.js";
import { uploadAnexoCartao } from "../uploads.js";

export const rotaKanban = Router();

const COLUNAS_PADRAO = [
  { coluna: "solicitacoes", nome: "Solicitações", cor: "#867E72" },
  { coluna: "urgencia", nome: "Urgência", cor: "#F43F5E" },
  { coluna: "revisao_textual", nome: "Revisão Textual", cor: "#3B82F6" },
  { coluna: "revisao_artes", nome: "Revisão das artes", cor: "#8B5CF6" },
  { coluna: "pit_stop", nome: "Pit Stop", cor: "#F59E0B" },
  { coluna: "aprovacao_cliente", nome: "Aprovação do cliente", cor: "#06B6D4" },
  { coluna: "entregue", nome: "Entregue/Concluído", cor: "#10B981" },
];
const COLUNAS_VALIDAS = COLUNAS_PADRAO.map(c => c.coluna);

function obterColunasDoQuadro(quadroId) {
  const overrides = db.prepare("SELECT coluna, nome, cor FROM colunas_kanban WHERE quadro_id = ?").all(quadroId);
  const porChave = Object.fromEntries(overrides.map(o => [o.coluna, o]));
  return COLUNAS_PADRAO.map(padrao => ({
    coluna: padrao.coluna,
    nome: porChave[padrao.coluna]?.nome || padrao.nome,
    cor: porChave[padrao.coluna]?.cor || padrao.cor,
  }));
}

/* agência dona do squad do usuário: a própria conta se for agência,
   ou a agência à qual o social media pertence. Freelancer solo -> null (sem quadro de squad) */
function squadAgenciaId(usuario) {
  if (usuario.tipo === "agencia") return usuario.id;
  if (usuario.tipo === "social_media" && usuario.agencia_id) return usuario.agencia_id;
  return null;
}

function membrosDoSquad(agenciaId) {
  const agencia = db.prepare("SELECT id, nome FROM usuarios WHERE id = ?").get(agenciaId);
  const membros = db.prepare("SELECT id, nome FROM usuarios WHERE agencia_id = ? ORDER BY nome").all(agenciaId);
  return agencia ? [agencia, ...membros] : membros;
}

function obterOuCriarQuadroPessoal(usuarioId) {
  let quadro = db.prepare("SELECT * FROM quadros_kanban WHERE tipo = 'pessoal' AND dono_id = ?").get(usuarioId);
  if (!quadro) {
    const resultado = db.prepare("INSERT INTO quadros_kanban (tipo, dono_id) VALUES ('pessoal', ?)").run(usuarioId);
    quadro = db.prepare("SELECT * FROM quadros_kanban WHERE id = ?").get(resultado.lastInsertRowid);
  }
  return quadro;
}

function obterOuCriarQuadroSquad(agenciaId) {
  let quadro = db.prepare("SELECT * FROM quadros_kanban WHERE tipo = 'squad' AND agencia_id = ?").get(agenciaId);
  if (!quadro) {
    const resultado = db.prepare("INSERT INTO quadros_kanban (tipo, agencia_id) VALUES ('squad', ?)").run(agenciaId);
    quadro = db.prepare("SELECT * FROM quadros_kanban WHERE id = ?").get(resultado.lastInsertRowid);
  }
  return quadro;
}

function quadroAcessivel(usuario, quadroId) {
  const quadro = db.prepare("SELECT * FROM quadros_kanban WHERE id = ?").get(quadroId);
  if (!quadro) return null;
  if (quadro.tipo === "pessoal") return quadro.dono_id === usuario.id ? quadro : null;
  const meuSquad = squadAgenciaId(usuario);
  return meuSquad && quadro.agencia_id === meuSquad ? quadro : null;
}

function cartaoAcessivel(usuario, cartaoId) {
  const cartao = db.prepare("SELECT * FROM cartoes_kanban WHERE id = ?").get(cartaoId);
  if (!cartao) return null;
  const quadro = quadroAcessivel(usuario, cartao.quadro_id);
  return quadro ? { cartao, quadro } : null;
}

function serializarCartao(cartao) {
  const membros = db.prepare(`
    SELECT u.id, u.nome FROM cartoes_kanban_membros m JOIN usuarios u ON u.id = m.usuario_id
    WHERE m.cartao_id = ? ORDER BY u.nome
  `).all(cartao.id);
  const totalComentarios = db.prepare("SELECT COUNT(*) AS n FROM cartoes_kanban_comentarios WHERE cartao_id = ?").get(cartao.id).n;
  const totalAnexos = db.prepare("SELECT COUNT(*) AS n FROM cartoes_kanban_anexos WHERE cartao_id = ?").get(cartao.id).n;
  return {
    id: cartao.id,
    quadroId: cartao.quadro_id,
    coluna: cartao.coluna,
    titulo: cartao.titulo,
    descricao: cartao.descricao,
    prazo: cartao.prazo,
    criadoEm: cartao.criado_em,
    membros,
    totalComentarios,
    totalAnexos,
  };
}

/* mesma serialização de serializarCartao, mas em lote: evita 1+3N consultas
   ao carregar a lista inteira de um quadro (uma consulta por cartão pra
   membros/comentários/anexos era o principal motivo do Kanban demorar pra
   abrir com mais alguns cartões) */
function serializarCartoesEmLote(cartoes) {
  if (cartoes.length === 0) return [];
  const ids = cartoes.map(c => c.id);
  const marcadores = ids.map(() => "?").join(",");

  const membrosLinhas = db.prepare(`
    SELECT m.cartao_id AS cartaoId, u.id, u.nome FROM cartoes_kanban_membros m
    JOIN usuarios u ON u.id = m.usuario_id
    WHERE m.cartao_id IN (${marcadores}) ORDER BY u.nome
  `).all(...ids);
  const comentariosLinhas = db.prepare(`
    SELECT cartao_id AS cartaoId, COUNT(*) AS n FROM cartoes_kanban_comentarios
    WHERE cartao_id IN (${marcadores}) GROUP BY cartao_id
  `).all(...ids);
  const anexosLinhas = db.prepare(`
    SELECT cartao_id AS cartaoId, COUNT(*) AS n FROM cartoes_kanban_anexos
    WHERE cartao_id IN (${marcadores}) GROUP BY cartao_id
  `).all(...ids);

  const membrosPorCartao = {};
  membrosLinhas.forEach(m => { (membrosPorCartao[m.cartaoId] ||= []).push({ id: m.id, nome: m.nome }); });
  const comentariosPorCartao = Object.fromEntries(comentariosLinhas.map(c => [c.cartaoId, c.n]));
  const anexosPorCartao = Object.fromEntries(anexosLinhas.map(a => [a.cartaoId, a.n]));

  return cartoes.map(cartao => ({
    id: cartao.id,
    quadroId: cartao.quadro_id,
    coluna: cartao.coluna,
    titulo: cartao.titulo,
    descricao: cartao.descricao,
    prazo: cartao.prazo,
    criadoEm: cartao.criado_em,
    membros: membrosPorCartao[cartao.id] || [],
    totalComentarios: comentariosPorCartao[cartao.id] || 0,
    totalAnexos: anexosPorCartao[cartao.id] || 0,
  }));
}

/* lista os quadros que o usuário pode ver: sempre o pessoal, e o do squad se
   ele for agência ou social media vinculado a uma */
rotaKanban.get("/quadros", autenticar, (req, res) => {
  const quadros = [{ ...obterOuCriarQuadroPessoal(req.usuario.id), nome: "Meu quadro" }];
  const agenciaId = squadAgenciaId(req.usuario);
  if (agenciaId) quadros.push({ ...obterOuCriarQuadroSquad(agenciaId), nome: "Quadro do squad" });
  res.json({ quadros: quadros.map(q => ({ id: q.id, tipo: q.tipo, nome: q.nome })) });
});

rotaKanban.get("/quadros/:id/membros", autenticar, (req, res) => {
  const quadro = quadroAcessivel(req.usuario, req.params.id);
  if (!quadro) return res.status(404).json({ erro: "Quadro não encontrado." });
  if (quadro.tipo === "pessoal") return res.json({ membros: [{ id: req.usuario.id, nome: req.usuario.nome }] });
  res.json({ membros: membrosDoSquad(quadro.agencia_id) });
});

rotaKanban.get("/quadros/:id/colunas", autenticar, (req, res) => {
  const quadro = quadroAcessivel(req.usuario, req.params.id);
  if (!quadro) return res.status(404).json({ erro: "Quadro não encontrado." });
  res.json({ colunas: obterColunasDoQuadro(quadro.id) });
});

/* renomear/recolorir uma coluna só afeta o quadro em questão (pessoal ou de
   squad) — quem não tem acesso ao quadro nem enxerga essa rota, então a troca
   nunca vaza pra outro quadro */
rotaKanban.patch("/quadros/:id/colunas/:coluna", autenticar, (req, res) => {
  const quadro = quadroAcessivel(req.usuario, req.params.id);
  if (!quadro) return res.status(404).json({ erro: "Quadro não encontrado." });
  if (!COLUNAS_VALIDAS.includes(req.params.coluna)) return res.status(400).json({ erro: "Coluna inválida." });

  const { nome, cor } = req.body || {};
  if (!nome?.trim()) return res.status(400).json({ erro: "Informe um nome pra coluna." });
  if (!/^#[0-9a-f]{6}$/i.test(cor || "")) return res.status(400).json({ erro: "Escolha uma cor válida." });

  db.prepare(`
    INSERT INTO colunas_kanban (quadro_id, coluna, nome, cor) VALUES (?, ?, ?, ?)
    ON CONFLICT(quadro_id, coluna) DO UPDATE SET nome = excluded.nome, cor = excluded.cor
  `).run(quadro.id, req.params.coluna, nome.trim(), cor.toLowerCase());

  res.json({ colunas: obterColunasDoQuadro(quadro.id) });
});

rotaKanban.get("/quadros/:id/cartoes", autenticar, (req, res) => {
  const quadro = quadroAcessivel(req.usuario, req.params.id);
  if (!quadro) return res.status(404).json({ erro: "Quadro não encontrado." });
  const cartoes = db.prepare("SELECT * FROM cartoes_kanban WHERE quadro_id = ? ORDER BY criado_em ASC").all(quadro.id);
  res.json({ cartoes: serializarCartoesEmLote(cartoes) });
});

/* carga inicial do Kanban num único request: quadros do usuário + colunas,
   cartões e membros do quadro que abre por padrão (o pessoal). Evita a
   sequência "busca quadros -> espera -> busca o resto do quadro ativo"
   que fazia a tela demorar mais pra aparecer. */
rotaKanban.get("/inicial", autenticar, (req, res) => {
  const quadroPessoal = { ...obterOuCriarQuadroPessoal(req.usuario.id), nome: "Meu quadro" };
  const quadros = [quadroPessoal];
  const agenciaId = squadAgenciaId(req.usuario);
  if (agenciaId) quadros.push({ ...obterOuCriarQuadroSquad(agenciaId), nome: "Quadro do squad" });

  const cartoes = db.prepare("SELECT * FROM cartoes_kanban WHERE quadro_id = ? ORDER BY criado_em ASC").all(quadroPessoal.id);

  res.json({
    quadros: quadros.map(q => ({ id: q.id, tipo: q.tipo, nome: q.nome })),
    quadroAtivoId: quadroPessoal.id,
    colunas: obterColunasDoQuadro(quadroPessoal.id),
    cartoes: serializarCartoesEmLote(cartoes),
    membros: [{ id: req.usuario.id, nome: req.usuario.nome }],
  });
});

rotaKanban.post("/quadros/:id/cartoes", autenticar, (req, res) => {
  const quadro = quadroAcessivel(req.usuario, req.params.id);
  if (!quadro) return res.status(404).json({ erro: "Quadro não encontrado." });

  const { titulo, coluna, prazo } = req.body || {};
  if (!titulo?.trim()) return res.status(400).json({ erro: "Informe um título pro cartão." });
  const colunaFinal = COLUNAS_VALIDAS.includes(coluna) ? coluna : "solicitacoes";

  const resultado = db.prepare("INSERT INTO cartoes_kanban (quadro_id, coluna, titulo, autor_id, prazo) VALUES (?, ?, ?, ?, ?)")
    .run(quadro.id, colunaFinal, titulo.trim(), req.usuario.id, prazo?.trim() || null);
  const cartao = db.prepare("SELECT * FROM cartoes_kanban WHERE id = ?").get(resultado.lastInsertRowid);
  res.status(201).json({ cartao: serializarCartao(cartao) });
});

rotaKanban.get("/cartoes/:id", autenticar, (req, res) => {
  const achado = cartaoAcessivel(req.usuario, req.params.id);
  if (!achado) return res.status(404).json({ erro: "Cartão não encontrado." });

  const comentarios = db.prepare(`
    SELECT c.id, c.texto, c.criado_em, u.id AS autor_id, u.nome AS autor_nome
    FROM cartoes_kanban_comentarios c JOIN usuarios u ON u.id = c.autor_id
    WHERE c.cartao_id = ? ORDER BY c.criado_em ASC
  `).all(achado.cartao.id);

  const anexos = db.prepare(`
    SELECT a.id, a.tipo, a.url, a.nome, a.criado_em, u.nome AS autor_nome
    FROM cartoes_kanban_anexos a JOIN usuarios u ON u.id = a.autor_id
    WHERE a.cartao_id = ? ORDER BY a.criado_em ASC
  `).all(achado.cartao.id);

  res.json({
    cartao: {
      ...serializarCartao(achado.cartao),
      comentarios: comentarios.map(c => ({
        id: c.id, texto: c.texto, criadoEm: c.criado_em, autorId: c.autor_id, autorNome: c.autor_nome,
      })),
      anexos: anexos.map(a => ({
        id: a.id, tipo: a.tipo, url: a.url, nome: a.nome, criadoEm: a.criado_em, autorNome: a.autor_nome,
      })),
    },
  });
});

rotaKanban.patch("/cartoes/:id", autenticar, (req, res) => {
  const achado = cartaoAcessivel(req.usuario, req.params.id);
  if (!achado) return res.status(404).json({ erro: "Cartão não encontrado." });

  const { titulo, descricao, coluna, prazo } = req.body || {};
  const campos = [];
  const valores = [];
  if (titulo !== undefined) {
    if (!titulo.trim()) return res.status(400).json({ erro: "Informe um título pro cartão." });
    campos.push("titulo = ?"); valores.push(titulo.trim());
  }
  if (descricao !== undefined) { campos.push("descricao = ?"); valores.push(descricao?.trim() || null); }
  if (coluna !== undefined) {
    if (!COLUNAS_VALIDAS.includes(coluna)) return res.status(400).json({ erro: "Coluna inválida." });
    campos.push("coluna = ?"); valores.push(coluna);
  }
  if (prazo !== undefined) { campos.push("prazo = ?"); valores.push(prazo?.trim() || null); }
  if (campos.length) {
    valores.push(achado.cartao.id);
    db.prepare(`UPDATE cartoes_kanban SET ${campos.join(", ")} WHERE id = ?`).run(...valores);
  }
  const atualizado = db.prepare("SELECT * FROM cartoes_kanban WHERE id = ?").get(achado.cartao.id);
  res.json({ cartao: serializarCartao(atualizado) });
});

rotaKanban.delete("/cartoes/:id", autenticar, (req, res) => {
  const achado = cartaoAcessivel(req.usuario, req.params.id);
  if (!achado) return res.status(404).json({ erro: "Cartão não encontrado." });
  db.prepare("DELETE FROM cartoes_kanban WHERE id = ?").run(achado.cartao.id);
  res.json({ ok: true });
});

rotaKanban.post("/cartoes/:id/membros", autenticar, (req, res) => {
  const achado = cartaoAcessivel(req.usuario, req.params.id);
  if (!achado) return res.status(404).json({ erro: "Cartão não encontrado." });

  const usuarioId = Number(req.body?.usuarioId);
  const permitido = achado.quadro.tipo === "pessoal"
    ? usuarioId === req.usuario.id
    : membrosDoSquad(achado.quadro.agencia_id).some(m => m.id === usuarioId);
  if (!permitido) return res.status(400).json({ erro: "Esse usuário não pode ser adicionado a esse cartão." });

  db.prepare("INSERT OR IGNORE INTO cartoes_kanban_membros (cartao_id, usuario_id) VALUES (?, ?)")
    .run(achado.cartao.id, usuarioId);
  res.status(201).json({ ok: true });
});

rotaKanban.delete("/cartoes/:id/membros/:usuarioId", autenticar, (req, res) => {
  const achado = cartaoAcessivel(req.usuario, req.params.id);
  if (!achado) return res.status(404).json({ erro: "Cartão não encontrado." });
  db.prepare("DELETE FROM cartoes_kanban_membros WHERE cartao_id = ? AND usuario_id = ?")
    .run(achado.cartao.id, req.params.usuarioId);
  res.json({ ok: true });
});

rotaKanban.post("/cartoes/:id/comentarios", autenticar, (req, res) => {
  const achado = cartaoAcessivel(req.usuario, req.params.id);
  if (!achado) return res.status(404).json({ erro: "Cartão não encontrado." });

  const { texto } = req.body || {};
  if (!texto?.trim()) return res.status(400).json({ erro: "Escreva um comentário." });

  db.prepare("INSERT INTO cartoes_kanban_comentarios (cartao_id, autor_id, texto) VALUES (?, ?, ?)")
    .run(achado.cartao.id, req.usuario.id, texto.trim());
  res.status(201).json({ ok: true });
});

rotaKanban.post("/cartoes/:id/arquivos", autenticar, uploadAnexoCartao.single("arquivo"), (req, res) => {
  const achado = cartaoAcessivel(req.usuario, req.params.id);
  if (!achado) return res.status(404).json({ erro: "Cartão não encontrado." });
  if (!req.file) return res.status(400).json({ erro: "Envie um arquivo." });

  db.prepare("INSERT INTO cartoes_kanban_anexos (cartao_id, tipo, url, nome, autor_id) VALUES (?, 'arquivo', ?, ?, ?)")
    .run(achado.cartao.id, `/uploads/kanban/${req.file.filename}`, req.file.originalname, req.usuario.id);
  res.status(201).json({ ok: true });
});

rotaKanban.post("/cartoes/:id/links", autenticar, (req, res) => {
  const achado = cartaoAcessivel(req.usuario, req.params.id);
  if (!achado) return res.status(404).json({ erro: "Cartão não encontrado." });

  const { url, nome } = req.body || {};
  if (!url?.trim()) return res.status(400).json({ erro: "Informe um link." });
  const urlFinal = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;

  db.prepare("INSERT INTO cartoes_kanban_anexos (cartao_id, tipo, url, nome, autor_id) VALUES (?, 'link', ?, ?, ?)")
    .run(achado.cartao.id, urlFinal, nome?.trim() || null, req.usuario.id);
  res.status(201).json({ ok: true });
});

rotaKanban.delete("/cartoes/:id/anexos/:anexoId", autenticar, (req, res) => {
  const achado = cartaoAcessivel(req.usuario, req.params.id);
  if (!achado) return res.status(404).json({ erro: "Cartão não encontrado." });
  db.prepare("DELETE FROM cartoes_kanban_anexos WHERE id = ? AND cartao_id = ?").run(req.params.anexoId, achado.cartao.id);
  res.json({ ok: true });
});
