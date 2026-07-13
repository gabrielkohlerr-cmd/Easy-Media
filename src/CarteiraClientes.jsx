import React, { useEffect, useState } from "react";
import { LAVANDA, LAVANDA_2, TINTA, CINZA } from "./theme.js";
import { Botao, Cartao } from "./components.jsx";
import { useAuth } from "./AuthContext.jsx";
import { api } from "./api.js";

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
  const [carregando, setCarregando] = useState(true);
  const [nomeNovo, setNomeNovo] = useState("");
  const [criando, setCriando] = useState(false);

  const recarregar = () => {
    api.listarClientes().then(({ clientes }) => setClientes(clientes)).finally(() => setCarregando(false));
  };

  useEffect(recarregar, []);

  const adicionar = async e => {
    e.preventDefault();
    if (!nomeNovo.trim()) return;
    setCriando(true);
    try {
      await api.criarCliente(nomeNovo.trim());
      setNomeNovo("");
      mostrar("✓ Cliente adicionado à carteira");
      recarregar();
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

  if (carregando) return null;

  return (
    <Cartao>
      <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: TINTA }}>
        Carteira de clientes ({clientes.length})
      </h3>
      <p style={{ margin: "0 0 14px", fontSize: 13, color: CINZA, fontWeight: 600 }}>
        Cada cliente tem um link único e sem senha para acompanhar e aprovar os próprios posts.
      </p>

      {podeGerenciar && (
        <form onSubmit={adicionar} style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <input
            value={nomeNovo} onChange={e => setNomeNovo(e.target.value)} placeholder="Nome do novo cliente"
            style={{
              flex: 1, minWidth: 200, borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "10px 14px",
              fontFamily: "inherit", fontWeight: 700, fontSize: 14, color: TINTA, outline: "none",
            }}
          />
          <Botao pequeno type="submit">{criando ? "Adicionando…" : "Adicionar cliente"}</Botao>
        </form>
      )}

      {clientes.length === 0 ? (
        <p style={{ color: CINZA, fontWeight: 600, fontSize: 14, margin: 0 }}>Nenhum cliente na carteira ainda.</p>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {clientes.map(c => (
            <div key={c.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: LAVANDA, borderRadius: 14, padding: "10px 14px", gap: 10, flexWrap: "wrap",
            }}>
              <div style={{ fontWeight: 800, color: TINTA, fontSize: 14 }}>{c.nome}</div>
              {c.token_acesso ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <Botao pequeno variante="fantasma" onClick={() => copiarLink(c)}>Copiar link do cliente</Botao>
                  <Botao pequeno variante="fantasma" onClick={() => rotacionarLink(c)}>Renovar link</Botao>
                  <Botao pequeno variante="perigo" onClick={() => remover(c.id)}>Remover</Botao>
                </div>
              ) : (
                <span style={{ fontSize: 12, color: CINZA, fontWeight: 600 }}>Gerenciado pela sua agência</span>
              )}
            </div>
          ))}
        </div>
      )}
    </Cartao>
  );
}
