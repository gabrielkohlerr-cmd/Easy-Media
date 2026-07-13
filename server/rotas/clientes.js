import { Router } from "express";
import { db } from "../db.js";
import { autenticar } from "../auth.js";
import { gerarTokenAleatorio } from "../tokens.js";

export const rotaClientes = Router();

export const SEGMENTOS_VALIDOS = [
  "Alimentação e Gastronomia",
  "Moda e Beleza",
  "Saúde e Bem-estar",
  "Fitness e Esportes",
  "Educação",
  "Imobiliário",
  "Varejo e E-commerce",
  "Serviços Profissionais",
  "Tecnologia",
  "Turismo e Hospitalidade",
  "Outro",
];

function donoDaCarteira(usuario) {
  // Agência e social media solo (sem squad) gerenciam sua própria carteira.
  // Social media que integra um squad enxerga a carteira compartilhada da agência.
  return usuario.tipo === "social_media" && usuario.agencia_id ? usuario.agencia_id : usuario.id;
}

rotaClientes.get("/", autenticar, (req, res) => {
  const donoId = donoDaCarteira(req.usuario);
  const ehDono = donoId === req.usuario.id;

  const linhas = db.prepare("SELECT * FROM clientes WHERE dono_id = ? ORDER BY nome").all(donoId);
  const clientes = linhas.map(c => ({
    id: c.id,
    nome: c.nome,
    segmento: c.segmento,
    nicho: c.nicho,
    criado_em: c.criado_em,
    instagram_username: c.instagram_username,
    instagram_conectado: Boolean(c.instagram_access_token),
    ...(ehDono ? { token_acesso: c.token_acesso } : {}),
  }));
  res.json({ clientes });
});

rotaClientes.post("/", autenticar, (req, res) => {
  if (req.usuario.tipo === "social_media" && req.usuario.agencia_id) {
    return res.status(403).json({ erro: "Fale com sua agência para adicionar clientes na carteira." });
  }
  const { nome, segmento, nicho } = req.body || {};
  if (!nome?.trim()) return res.status(400).json({ erro: "Informe o nome do cliente." });
  if (!SEGMENTOS_VALIDOS.includes(segmento)) return res.status(400).json({ erro: "Selecione o segmento do cliente." });
  if (!nicho?.trim()) return res.status(400).json({ erro: "Informe o nicho do cliente." });

  const token = gerarTokenAleatorio();
  const resultado = db.prepare("INSERT INTO clientes (nome, dono_id, token_acesso, segmento, nicho) VALUES (?, ?, ?, ?, ?)")
    .run(nome.trim(), req.usuario.id, token, segmento, nicho.trim());

  const cliente = db.prepare("SELECT * FROM clientes WHERE id = ?").get(resultado.lastInsertRowid);
  res.status(201).json({ cliente });
});

rotaClientes.delete("/:id", autenticar, (req, res) => {
  const cliente = db.prepare("SELECT * FROM clientes WHERE id = ? AND dono_id = ?")
    .get(req.params.id, req.usuario.id);
  if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado." });

  db.prepare("DELETE FROM clientes WHERE id = ?").run(cliente.id);
  res.json({ ok: true });
});

rotaClientes.post("/:id/rotacionar-link", autenticar, (req, res) => {
  const cliente = db.prepare("SELECT * FROM clientes WHERE id = ? AND dono_id = ?")
    .get(req.params.id, req.usuario.id);
  if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado." });

  const token = gerarTokenAleatorio();
  db.prepare("UPDATE clientes SET token_acesso = ? WHERE id = ?").run(token, cliente.id);
  res.json({ token_acesso: token });
});

/* pública: acesso do cliente via link, sem senha */
rotaClientes.get("/acesso/:token", (req, res) => {
  const cliente = db.prepare("SELECT id, nome FROM clientes WHERE token_acesso = ?").get(req.params.token);
  if (!cliente) return res.status(404).json({ erro: "Link de acesso inválido." });
  res.json({ cliente });
});
