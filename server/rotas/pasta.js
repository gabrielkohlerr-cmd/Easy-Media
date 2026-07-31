import { Router } from "express";
import { db } from "../db.js";
import { autenticar } from "../auth.js";
import { uploadDocumentoCliente } from "../uploads.js";

export const rotaPasta = Router();

function donoDaCarteira(usuario) {
  return usuario.tipo === "social_media" && usuario.agencia_id ? usuario.agencia_id : usuario.id;
}

function clienteAcessivel(usuario, clienteId) {
  const cliente = db.prepare("SELECT * FROM clientes WHERE id = ?").get(clienteId);
  if (!cliente) return null;
  return cliente.dono_id === donoDaCarteira(usuario) ? cliente : null;
}

function serializarDocumento(d) {
  return {
    id: d.id, tipo: d.tipo, titulo: d.titulo, conteudo: d.conteudo,
    autorNome: d.autor_nome, criadoEm: d.criado_em,
  };
}

/* pasta de planejamentos, roteiros e outros materiais de um cliente — serve
   como um banco de referências da conta, independente do calendário/kanban */
rotaPasta.get("/clientes/:clienteId/pasta", autenticar, (req, res) => {
  const cliente = clienteAcessivel(req.usuario, req.params.clienteId);
  if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado." });

  const documentos = db.prepare(`
    SELECT d.*, u.nome AS autor_nome FROM documentos_cliente d
    JOIN usuarios u ON u.id = d.autor_id
    WHERE d.cliente_id = ? ORDER BY d.criado_em DESC
  `).all(cliente.id);
  res.json({ documentos: documentos.map(serializarDocumento) });
});

rotaPasta.post("/clientes/:clienteId/pasta", autenticar, (req, res) => {
  const cliente = clienteAcessivel(req.usuario, req.params.clienteId);
  if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado." });

  const { tipo, titulo, conteudo } = req.body || {};
  if (!["nota", "link"].includes(tipo)) return res.status(400).json({ erro: "Tipo inválido." });
  if (!titulo?.trim()) return res.status(400).json({ erro: "Informe um título." });
  if (!conteudo?.trim()) {
    return res.status(400).json({ erro: tipo === "nota" ? "Escreva o conteúdo da nota." : "Informe um link." });
  }

  const conteudoFinal = tipo === "link" && !/^https?:\/\//i.test(conteudo.trim())
    ? `https://${conteudo.trim()}`
    : conteudo.trim();

  const resultado = db.prepare(`
    INSERT INTO documentos_cliente (cliente_id, tipo, titulo, conteudo, autor_id) VALUES (?, ?, ?, ?, ?)
  `).run(cliente.id, tipo, titulo.trim(), conteudoFinal, req.usuario.id);

  const documento = db.prepare(`
    SELECT d.*, u.nome AS autor_nome FROM documentos_cliente d JOIN usuarios u ON u.id = d.autor_id WHERE d.id = ?
  `).get(resultado.lastInsertRowid);
  res.status(201).json({ documento: serializarDocumento(documento) });
});

rotaPasta.post(
  "/clientes/:clienteId/pasta/arquivo", autenticar, uploadDocumentoCliente.single("arquivo"),
  (req, res) => {
    const cliente = clienteAcessivel(req.usuario, req.params.clienteId);
    if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado." });
    if (!req.file) return res.status(400).json({ erro: "Envie um arquivo." });

    const titulo = (req.body?.titulo || req.file.originalname).trim();
    const resultado = db.prepare(`
      INSERT INTO documentos_cliente (cliente_id, tipo, titulo, conteudo, autor_id) VALUES (?, 'arquivo', ?, ?, ?)
    `).run(cliente.id, titulo, `/uploads/documentos/${req.file.filename}`, req.usuario.id);

    const documento = db.prepare(`
      SELECT d.*, u.nome AS autor_nome FROM documentos_cliente d JOIN usuarios u ON u.id = d.autor_id WHERE d.id = ?
    `).get(resultado.lastInsertRowid);
    res.status(201).json({ documento: serializarDocumento(documento) });
  },
);

rotaPasta.delete("/pasta/:id", autenticar, (req, res) => {
  const documento = db.prepare("SELECT * FROM documentos_cliente WHERE id = ?").get(req.params.id);
  if (!documento || !clienteAcessivel(req.usuario, documento.cliente_id)) {
    return res.status(404).json({ erro: "Documento não encontrado." });
  }
  db.prepare("DELETE FROM documentos_cliente WHERE id = ?").run(documento.id);
  res.json({ ok: true });
});
