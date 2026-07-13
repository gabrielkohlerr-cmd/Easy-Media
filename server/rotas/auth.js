import { Router } from "express";
import { db } from "../db.js";
import { hashSenha, conferirSenha, gerarToken, usuarioPublico, autenticar } from "../auth.js";

export const rotaAuth = Router();

const TIPOS_VALIDOS = ["social_media", "agencia"];

rotaAuth.post("/registro", (req, res) => {
  const { nome, email, senha, tipo, nomeNegocio, conviteToken } = req.body || {};

  if (!nome?.trim() || !email?.trim() || !senha || senha.length < 6) {
    return res.status(400).json({ erro: "Preencha nome, e-mail e uma senha com pelo menos 6 caracteres." });
  }
  if (!TIPOS_VALIDOS.includes(tipo)) {
    return res.status(400).json({ erro: "Tipo de conta inválido." });
  }

  const existente = db.prepare("SELECT id FROM usuarios WHERE email = ?").get(email.trim().toLowerCase());
  if (existente) {
    return res.status(409).json({ erro: "Já existe uma conta com esse e-mail." });
  }

  let agenciaId = null;
  let convite = null;
  if (tipo === "social_media" && conviteToken) {
    convite = db.prepare("SELECT * FROM convites_squad WHERE token = ? AND status = 'pendente'").get(conviteToken);
    if (convite) agenciaId = convite.agencia_id;
  }

  const resultado = db.prepare(`
    INSERT INTO usuarios (nome, email, senha_hash, tipo, nome_negocio, agencia_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(nome.trim(), email.trim().toLowerCase(), hashSenha(senha), tipo, nomeNegocio?.trim() || null, agenciaId);

  if (convite) {
    db.prepare("UPDATE convites_squad SET status = 'aceito', aceito_por = ? WHERE id = ?")
      .run(resultado.lastInsertRowid, convite.id);
  }

  const usuario = db.prepare("SELECT * FROM usuarios WHERE id = ?").get(resultado.lastInsertRowid);
  res.status(201).json({ token: gerarToken(usuario), usuario: usuarioPublico(usuario) });
});

rotaAuth.post("/login", (req, res) => {
  const { email, senha } = req.body || {};
  const usuario = db.prepare("SELECT * FROM usuarios WHERE email = ?").get((email || "").trim().toLowerCase());

  if (!usuario || !conferirSenha(senha || "", usuario.senha_hash)) {
    return res.status(401).json({ erro: "E-mail ou senha inválidos." });
  }

  res.json({ token: gerarToken(usuario), usuario: usuarioPublico(usuario) });
});

rotaAuth.get("/me", autenticar, (req, res) => {
  const usuario = usuarioPublico(req.usuario);
  if (usuario.agencia_id) {
    const agencia = db.prepare("SELECT id, nome, nome_negocio FROM usuarios WHERE id = ?").get(usuario.agencia_id);
    usuario.agencia = agencia || null;
  }
  res.json({ usuario });
});
