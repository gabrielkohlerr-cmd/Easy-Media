import React, { useEffect, useState } from "react";
import { ROXO, LAVANDA, LAVANDA_2, TINTA, CINZA } from "./theme.js";
import { Botao, Cartao, Pill } from "./components.jsx";
import { IconeCamera } from "./icones.jsx";
import { useAuth } from "./AuthContext.jsx";
import { api } from "./api.js";
import { SEGMENTOS } from "./segmentos.js";

const campoEstilo = {
  borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "10px 14px",
  fontFamily: "inherit", fontWeight: 700, fontSize: 14, color: TINTA, outline: "none",
};

async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return false;
  }
}

export default function CarteiraClientes({ mostrar }) {
  const { usuario } = useAuth();
  const podeGerenciar = usuario?.tipo === "agencia" || !usuario?.agencia_id;

  const [clientes, setClientes] = useState([]);
  const [membrosSquad, setMembrosSquad] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [nomeNovo, setNomeNovo] = useState("");
  const [segmentoNovo, setSegmentoNovo] = useState("");
  const [nichoNovo, setNichoNovo] = useState("");
  const [responsavelNovo, setResponsavelNovo] = useState("");
  const [criando, setCriando] = useState(false);

  const recarregar = () => {
    api.listarClientes().then(({ clientes }) => setClientes(clientes)).finally(() => setCarregando(false));
  };

  useEffect(recarregar, []);

  useEffect(() => {
    if (usuario?.tipo === "agencia") {
      api.listarMembros().then(({ membros }) => setMembrosSquad(membros)).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.tipo]);

  const adicionar = async e => {
    e.preventDefault();
    if (!nomeNovo.trim() || !segmentoNovo || !nichoNovo.trim()) return;
    setCriando(true);
    try {
      const { cliente } = await api.criarCliente({
        nome: nomeNovo.trim(), segmento: segmentoNovo, nicho: nichoNovo.trim(),
        responsavelId: responsavelNovo || null,
      });
      setNomeNovo(""); setSegmentoNovo(""); setNichoNovo(""); setResponsavelNovo("");
      mostrar("✓ Cliente adicionado à carteira");
      recarregar();
      return cliente;
    } catch (err) {
      mostrar(err.message);
    } finally {
      setCriando(false);
    }
  };

  const remover = async id => {
    await api.removerCliente(id);
    mostrar("Cliente removido da carteira");
    recarregar();
  };

  const copiarLink = async cliente => {
    const link = `${window.location.origin}/cliente/${cliente.token_acesso}`;
    const ok = await copiar(link);
    mostrar(ok ? "✓ Link do cliente copiado" : link);
  };

  const rotacionarLink = async cliente => {
    await api.rotacionarLinkCliente(cliente.id);
    mostrar("Link do cliente renovado (o link antigo parou de funcionar)");
    recarregar();
  };

  const conectarInstagram = async cliente => {
    try {
      const { url } = await api.obterUrlAutorizacaoInstagram(cliente.id);
      window.location.href = url;
    } catch (err) {
      mostrar(err.message);
    }
  };

  const desconectarInstagram = async cliente => {
    await api.desconectarInstagram(cliente.id);
    mostrar("Instagram desconectado");
    recarregar();
  };

  if (carregando) return null;

  return (
    <Cartao>
      <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: TINTA }}>
        Carteira de clientes ({clientes.length})
      </h3>
      <p style={{ margin: "0 0 14px", fontSize: 13, color: CINZA, fontWeight: 600 }}>
        Cada cliente tem um link único e sem senha para acompanhar e aprovar os próprios posts.
        Conecte o Instagram do cliente pra publicar e responder comentários direto por aqui. Segmento
        e nicho alimentam os insights e tendências da tela de Início.
      </p>

      {podeGerenciar && (
        <form onSubmit={adicionar} style={{ display: "grid", gap: 8, marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              value={nomeNovo} onChange={e => setNomeNovo(e.target.value)} placeholder="Nome do novo cliente"
              style={{ ...campoEstilo, flex: 2, minWidth: 200 }}
            />
            <select
              value={segmentoNovo} onChange={e => setSegmentoNovo(e.target.value)}
              style={{ ...campoEstilo, flex: 1, minWidth: 200, color: segmentoNovo ? TINTA : CINZA }}
            >
              <option value="">Segmento *</option>
              {SEGMENTOS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              value={nichoNovo} onChange={e => setNichoNovo(e.target.value)} placeholder="Nicho * (ex: sushi delivery)"
              style={{ ...campoEstilo, flex: 1, minWidth: 200 }}
            />
            {membrosSquad.length > 0 && (
              <select
                value={responsavelNovo} onChange={e => setResponsavelNovo(e.target.value)}
                style={{ ...campoEstilo, flex: 1, minWidth: 200, color: responsavelNovo ? TINTA : CINZA }}
              >
                <option value="">Sem responsável (opcional)</option>
                {membrosSquad.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
            )}
          </div>
          <div>
            <Botao pequeno type="submit">{criando ? "Adicionando…" : "Adicionar cliente"}</Botao>
          </div>
        </form>
      )}

      {clientes.length === 0 ? (
        <p style={{ color: CINZA, fontWeight: 600, fontSize: 14, margin: 0 }}>Nenhum cliente na carteira ainda.</p>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {clientes.map(c => (
            <div key={c.id} style={{ background: LAVANDA, borderRadius: 14, padding: "10px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 800, color: TINTA, fontSize: 14 }}>{c.nome}</div>
                  {c.segmento && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: CINZA, marginTop: 2 }}>
                      {c.segmento}{c.nicho ? ` · ${c.nicho}` : ""}
                    </div>
                  )}
                  {c.responsavelNome && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: ROXO, marginTop: 2 }}>
                      Responsável: {c.responsavelNome}
                    </div>
                  )}
                </div>
                {c.token_acesso ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Botao pequeno variante="fantasma" onClick={() => copiarLink(c)}>Copiar link do cliente</Botao>
                    <Botao pequeno variante="fantasma" onClick={() => rotacionarLink(c)}>Renovar link</Botao>
                    <Botao pequeno variante="perigo" onClick={() => remover(c.id)}>Remover</Botao>
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: CINZA, fontWeight: 600 }}>Gerenciado pela sua agência</span>
                )}
              </div>

              {podeGerenciar && (
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {c.instagram_conectado ? (
                    <>
                      <Pill cor={ROXO} bg="#fff">
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <IconeCamera tamanho={13} /> @{c.instagram_username}
                        </span>
                      </Pill>
                      <Botao pequeno variante="fantasma" onClick={() => desconectarInstagram(c)}>Desconectar Instagram</Botao>
                    </>
                  ) : (
                    <Botao pequeno variante="fantasma" onClick={() => conectarInstagram(c)}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <IconeCamera tamanho={14} /> Conectar Instagram
                      </span>
                    </Botao>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Cartao>
  );
}
