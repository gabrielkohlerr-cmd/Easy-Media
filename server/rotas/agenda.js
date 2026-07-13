import { Router } from "express";
import { db } from "../db.js";
import { autenticar } from "../auth.js";

export const rotaAgenda = Router();

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function carregarConvidados(reuniaoId) {
  return db.prepare("SELECT email FROM reunioes_convidados WHERE reuniao_id = ?")
    .all(reuniaoId)
    .map(c => c.email);
}

function serializar(reuniao) {
  return {
    id: reuniao.id,
    titulo: reuniao.titulo,
    descricao: reuniao.descricao,
    local: reuniao.local,
    inicio: reuniao.inicio,
    fim: reuniao.fim,
    convidados: carregarConvidados(reuniao.id),
  };
}

rotaAgenda.get("/", autenticar, (req, res) => {
  const { inicio, fim } = req.query;
  let linhas;
  if (inicio && fim) {
    linhas = db.prepare(`
      SELECT * FROM reunioes
      WHERE usuario_id = ? AND inicio < ? AND fim > ?
      ORDER BY inicio
    `).all(req.usuario.id, fim, inicio);
  } else {
    linhas = db.prepare("SELECT * FROM reunioes WHERE usuario_id = ? ORDER BY inicio").all(req.usuario.id);
  }
  res.json({ reunioes: linhas.map(serializar) });
});

rotaAgenda.post("/", autenticar, (req, res) => {
  const { titulo, descricao, local, inicio, fim, convidados } = req.body || {};

  if (!titulo?.trim()) return res.status(400).json({ erro: "Informe um título pra reunião." });
  if (!inicio || !fim) return res.status(400).json({ erro: "Informe início e fim da reunião." });
  if (new Date(fim) <= new Date(inicio)) return res.status(400).json({ erro: "O fim precisa ser depois do início." });

  const listaEmails = (Array.isArray(convidados) ? convidados : [])
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  const invalido = listaEmails.find(e => !REGEX_EMAIL.test(e));
  if (invalido) return res.status(400).json({ erro: `E-mail inválido: ${invalido}` });

  const resultado = db.prepare(`
    INSERT INTO reunioes (usuario_id, titulo, descricao, local, inicio, fim)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.usuario.id, titulo.trim(), descricao?.trim() || null, local?.trim() || null, inicio, fim);

  const inserirConvidado = db.prepare("INSERT INTO reunioes_convidados (reuniao_id, email) VALUES (?, ?)");
  listaEmails.forEach(email => inserirConvidado.run(resultado.lastInsertRowid, email));

  const reuniao = db.prepare("SELECT * FROM reunioes WHERE id = ?").get(resultado.lastInsertRowid);
  res.status(201).json({ reuniao: serializar(reuniao) });
});

rotaAgenda.delete("/:id", autenticar, (req, res) => {
  const reuniao = db.prepare("SELECT * FROM reunioes WHERE id = ? AND usuario_id = ?")
    .get(req.params.id, req.usuario.id);
  if (!reuniao) return res.status(404).json({ erro: "Reunião não encontrada." });

  db.prepare("DELETE FROM reunioes WHERE id = ?").run(reuniao.id);
  res.json({ ok: true });
});
