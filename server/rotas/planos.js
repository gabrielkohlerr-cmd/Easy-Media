import { Router } from "express";
import { db } from "../db.js";
import { autenticar, exigirTipo } from "../auth.js";

export const rotaPlanos = Router();

export const LIMITES_PLANO_AGENCIA = {
  basico: { colaboradores: 15, clientes: 50 },
  premium: { colaboradores: 40, clientes: 100 },
  unlimited: { colaboradores: null, clientes: null },
};

export const PACOTES_CLIENTES_VALIDOS = { mais20: 20, mais30: 30, mais50: 50 };
export const LIMITE_CLIENTES_GRATIS_FREELANCER = 20;

function donoDaCarteira(usuario) {
  return usuario.tipo === "social_media" && usuario.agencia_id ? usuario.agencia_id : usuario.id;
}

/* status do plano atual do usuário logado: limites, uso e (se freelancer) o
   saldo de clientes liberado pelos pacotes comprados */
rotaPlanos.get("/meu", autenticar, (req, res) => {
  const usuario = req.usuario;
  const donoId = donoDaCarteira(usuario);
  const { n: clientesCadastrados } = db.prepare("SELECT COUNT(*) AS n FROM clientes WHERE dono_id = ?").get(donoId);

  if (usuario.tipo === "agencia") {
    const { n: colaboradoresAtuais } = db.prepare("SELECT COUNT(*) AS n FROM usuarios WHERE agencia_id = ?").get(usuario.id);
    return res.json({
      tipo: "agencia",
      plano: usuario.plano || null,
      limites: usuario.plano ? LIMITES_PLANO_AGENCIA[usuario.plano] : null,
      colaboradoresAtuais,
      clientesCadastrados,
    });
  }

  if (usuario.agencia_id) {
    return res.json({ tipo: "social_media", gerenciadoPelaAgencia: true, clientesCadastrados });
  }

  const pacoteClientesExtra = usuario.pacote_clientes_extra || 0;
  res.json({
    tipo: "social_media",
    gerenciadoPelaAgencia: false,
    limiteGratis: LIMITE_CLIENTES_GRATIS_FREELANCER,
    pacoteClientesExtra,
    totalPermitido: LIMITE_CLIENTES_GRATIS_FREELANCER + pacoteClientesExtra,
    clientesCadastrados,
  });
});

/* "compra" o plano da agência — cobrança ainda não integrada, é só uma
   simulação: o plano fica ativo assim que o botão é clicado. */
rotaPlanos.post("/agencia", autenticar, exigirTipo("agencia"), (req, res) => {
  const { plano } = req.body || {};
  if (!Object.keys(LIMITES_PLANO_AGENCIA).includes(plano)) {
    return res.status(400).json({ erro: "Escolha um plano válido." });
  }

  db.prepare("UPDATE usuarios SET plano = ? WHERE id = ?").run(plano, req.usuario.id);
  res.json({ ok: true, plano });
});

/* "compra" um pacote extra de clientes pro social media freelancer —
   também simulada, sem cobrança real por enquanto. */
rotaPlanos.post("/pacote-cliente", autenticar, exigirTipo("social_media"), (req, res) => {
  if (req.usuario.agencia_id) {
    return res.status(403).json({ erro: "Você faz parte do squad de uma agência — o plano é gerenciado por ela." });
  }
  const { pacote } = req.body || {};
  const quantidade = PACOTES_CLIENTES_VALIDOS[pacote];
  if (!quantidade) return res.status(400).json({ erro: "Escolha um pacote válido." });

  db.prepare("UPDATE usuarios SET pacote_clientes_extra = pacote_clientes_extra + ? WHERE id = ?")
    .run(quantidade, req.usuario.id);
  res.json({ ok: true, pacoteClientesExtra: quantidade });
});
