import { Router } from "express";
import { db } from "../db.js";
import { autenticar, exigirTipo } from "../auth.js";
import { gerarTokenAleatorio } from "../tokens.js";
import { LIMITES_PLANO_AGENCIA, LIMITE_CLIENTES_GRATIS_FREELANCER } from "./planos.js";

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

/* usuários que podem ser responsáveis por um cliente dessa carteira: a
   própria agência e os social medias do squad dela */
function squadValido(agenciaId, usuarioId) {
  if (Number(usuarioId) === agenciaId) return false; // responsável é sempre um social media, não a própria agência
  const membro = db.prepare("SELECT id FROM usuarios WHERE id = ? AND agencia_id = ?").get(usuarioId, agenciaId);
  return Boolean(membro);
}

function serializarCliente(c, ehDono) {
  return {
    id: c.id,
    nome: c.nome,
    segmento: c.segmento,
    nicho: c.nicho,
    criado_em: c.criado_em,
    instagram_username: c.instagram_username,
    instagram_conectado: Boolean(c.instagram_access_token),
    responsavelId: c.responsavel_id,
    responsavelNome: c.responsavel_nome,
    ...(ehDono ? { token_acesso: c.token_acesso } : {}),
  };
}

rotaClientes.get("/", autenticar, (req, res) => {
  const donoId = donoDaCarteira(req.usuario);
  const ehDono = donoId === req.usuario.id;

  const linhas = db.prepare(`
    SELECT c.*, u.nome AS responsavel_nome
    FROM clientes c LEFT JOIN usuarios u ON u.id = c.responsavel_id
    WHERE c.dono_id = ? ORDER BY c.nome
  `).all(donoId);
  res.json({ clientes: linhas.map(c => serializarCliente(c, ehDono)) });
});

rotaClientes.post("/", autenticar, (req, res) => {
  if (req.usuario.tipo === "social_media" && req.usuario.agencia_id) {
    return res.status(403).json({ erro: "Fale com sua agência para adicionar clientes na carteira." });
  }
  const { nome, segmento, nicho, responsavelId } = req.body || {};
  if (!nome?.trim()) return res.status(400).json({ erro: "Informe o nome do cliente." });
  if (!SEGMENTOS_VALIDOS.includes(segmento)) return res.status(400).json({ erro: "Selecione o segmento do cliente." });
  if (!nicho?.trim()) return res.status(400).json({ erro: "Informe o nicho do cliente." });
  if (responsavelId && !squadValido(req.usuario.id, responsavelId)) {
    return res.status(400).json({ erro: "Escolha um responsável que faça parte do seu squad." });
  }

  const { n: totalAtual } = db.prepare("SELECT COUNT(*) AS n FROM clientes WHERE dono_id = ?").get(req.usuario.id);
  if (req.usuario.tipo === "agencia" && req.usuario.plano) {
    const limite = LIMITES_PLANO_AGENCIA[req.usuario.plano]?.clientes;
    if (limite != null && totalAtual >= limite) {
      return res.status(403).json({ erro: "Você atingiu o limite de clientes do seu plano atual. Faça upgrade em Planos." });
    }
  } else if (req.usuario.tipo === "social_media" && !req.usuario.agencia_id) {
    const limite = LIMITE_CLIENTES_GRATIS_FREELANCER + (req.usuario.pacote_clientes_extra || 0);
    if (totalAtual >= limite) {
      return res.status(403).json({ erro: "Você atingiu o limite de clientes do seu plano gratuito. Compre um pacote extra em Planos." });
    }
  }

  const token = gerarTokenAleatorio();
  const resultado = db.prepare(`
    INSERT INTO clientes (nome, dono_id, token_acesso, segmento, nicho, responsavel_id) VALUES (?, ?, ?, ?, ?, ?)
  `).run(nome.trim(), req.usuario.id, token, segmento, nicho.trim(), responsavelId || null);

  const cliente = db.prepare(`
    SELECT c.*, u.nome AS responsavel_nome FROM clientes c LEFT JOIN usuarios u ON u.id = c.responsavel_id
    WHERE c.id = ?
  `).get(resultado.lastInsertRowid);
  res.status(201).json({ cliente: serializarCliente(cliente, true) });
});

rotaClientes.patch("/:id/responsavel", autenticar, exigirTipo("agencia"), (req, res) => {
  const cliente = db.prepare("SELECT * FROM clientes WHERE id = ? AND dono_id = ?")
    .get(req.params.id, req.usuario.id);
  if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado." });

  const { responsavelId } = req.body || {};
  if (responsavelId && !squadValido(req.usuario.id, responsavelId)) {
    return res.status(400).json({ erro: "Escolha um responsável que faça parte do seu squad." });
  }
  db.prepare("UPDATE clientes SET responsavel_id = ? WHERE id = ?").run(responsavelId || null, cliente.id);

  const atualizado = db.prepare(`
    SELECT c.*, u.nome AS responsavel_nome FROM clientes c LEFT JOIN usuarios u ON u.id = c.responsavel_id
    WHERE c.id = ?
  `).get(cliente.id);
  res.json({ cliente: serializarCliente(atualizado, true) });
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
