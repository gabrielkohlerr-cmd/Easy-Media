import { Router } from "express";
import { db } from "../db.js";
import { autenticar, exigirTipo, usuarioPublico } from "../auth.js";
import { gerarTokenAleatorio } from "../tokens.js";
import { LIMITES_PLANO_AGENCIA } from "./planos.js";

export const rotaSquad = Router();

rotaSquad.post("/convites", autenticar, exigirTipo("agencia"), (req, res) => {
  const token = gerarTokenAleatorio();
  db.prepare("INSERT INTO convites_squad (agencia_id, token) VALUES (?, ?)").run(req.usuario.id, token);
  res.status(201).json({ token });
});

rotaSquad.get("/convites", autenticar, exigirTipo("agencia"), (req, res) => {
  const convites = db.prepare(`
    SELECT c.id, c.token, c.status, c.criado_em, u.nome AS aceito_por_nome
    FROM convites_squad c
    LEFT JOIN usuarios u ON u.id = c.aceito_por
    WHERE c.agencia_id = ?
    ORDER BY c.criado_em DESC
  `).all(req.usuario.id);
  res.json({ convites });
});

rotaSquad.delete("/convites/:id", autenticar, exigirTipo("agencia"), (req, res) => {
  const convite = db.prepare("SELECT * FROM convites_squad WHERE id = ? AND agencia_id = ?")
    .get(req.params.id, req.usuario.id);
  if (!convite) return res.status(404).json({ erro: "Convite não encontrado." });

  db.prepare("UPDATE convites_squad SET status = 'revogado' WHERE id = ?").run(convite.id);
  res.json({ ok: true });
});

rotaSquad.get("/membros", autenticar, exigirTipo("agencia"), (req, res) => {
  const membros = db.prepare(`
    SELECT id, nome, email, criado_em FROM usuarios WHERE agencia_id = ? ORDER BY nome
  `).all(req.usuario.id);
  res.json({ membros });
});

/* visão do squad pra agência: cada social media com os clientes que estão
   sob a responsabilidade dele, mais os clientes ainda sem responsável definido */
rotaSquad.get("/visao-geral", autenticar, exigirTipo("agencia"), (req, res) => {
  const membros = db.prepare(`
    SELECT id, nome, email FROM usuarios WHERE agencia_id = ? ORDER BY nome
  `).all(req.usuario.id);
  const clientes = db.prepare(`
    SELECT id, nome, segmento, nicho, responsavel_id FROM clientes WHERE dono_id = ? ORDER BY nome
  `).all(req.usuario.id);

  const porResponsavel = {};
  clientes.forEach(c => {
    const chave = c.responsavel_id || "sem_responsavel";
    (porResponsavel[chave] ||= []).push({
      id: c.id, nome: c.nome, segmento: c.segmento, nicho: c.nicho, responsavelId: c.responsavel_id,
    });
  });

  res.json({
    membros: membros.map(m => ({ ...m, clientes: porResponsavel[m.id] || [] })),
    semResponsavel: porResponsavel.sem_responsavel || [],
  });
});

rotaSquad.delete("/membros/:id", autenticar, exigirTipo("agencia"), (req, res) => {
  const membro = db.prepare("SELECT * FROM usuarios WHERE id = ? AND agencia_id = ?")
    .get(req.params.id, req.usuario.id);
  if (!membro) return res.status(404).json({ erro: "Membro não encontrado." });

  db.prepare("UPDATE usuarios SET agencia_id = NULL WHERE id = ?").run(membro.id);
  res.json({ ok: true });
});

/* pública: quem recebeu o link vê antes de aceitar */
rotaSquad.get("/convites/:token/info", (req, res) => {
  const convite = db.prepare(`
    SELECT c.status, u.nome AS agencia_nome, u.nome_negocio AS agencia_negocio
    FROM convites_squad c
    JOIN usuarios u ON u.id = c.agencia_id
    WHERE c.token = ?
  `).get(req.params.token);

  if (!convite) return res.status(404).json({ erro: "Convite não encontrado." });
  res.json({ convite });
});

rotaSquad.post("/convites/:token/aceitar", autenticar, exigirTipo("social_media"), (req, res) => {
  const convite = db.prepare("SELECT * FROM convites_squad WHERE token = ? AND status = 'pendente'")
    .get(req.params.token);
  if (!convite) return res.status(404).json({ erro: "Convite inválido, já usado ou revogado." });

  const agencia = db.prepare("SELECT * FROM usuarios WHERE id = ?").get(convite.agencia_id);
  const limiteColaboradores = agencia?.plano ? LIMITES_PLANO_AGENCIA[agencia.plano]?.colaboradores : null;
  if (limiteColaboradores != null) {
    const { n: colaboradoresAtuais } = db.prepare("SELECT COUNT(*) AS n FROM usuarios WHERE agencia_id = ?").get(agencia.id);
    if (colaboradoresAtuais >= limiteColaboradores) {
      return res.status(403).json({ erro: "Essa agência atingiu o limite de colaboradores do plano atual." });
    }
  }

  db.prepare("UPDATE usuarios SET agencia_id = ? WHERE id = ?").run(convite.agencia_id, req.usuario.id);
  db.prepare("UPDATE convites_squad SET status = 'aceito', aceito_por = ? WHERE id = ?").run(req.usuario.id, convite.id);

  const usuario = db.prepare("SELECT * FROM usuarios WHERE id = ?").get(req.usuario.id);
  res.json({ usuario: usuarioPublico(usuario) });
});
