import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROXO, LAVANDA, LAVANDA_2, TINTA, CINZA } from "./theme.js";
import { Pill, Botao, Cartao, Toast, Marca } from "./components.jsx";
import { IconeUsuarios, IconePrancheta } from "./icones.jsx";
import { api } from "./api.js";

const campoEstilo = {
  borderRadius: 12, border: `2px solid ${LAVANDA_2}`, padding: "6px 10px",
  fontFamily: "inherit", fontWeight: 700, fontSize: 12, color: TINTA, outline: "none",
};

function SeletorResponsavel({ cliente, membros, aoAlterar }) {
  return (
    <select
      value={cliente.responsavelId ?? ""}
      onChange={e => aoAlterar(cliente.id, e.target.value || null)}
      style={campoEstilo}
    >
      <option value="">Sem responsável</option>
      {membros.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
    </select>
  );
}

export default function SquadPage() {
  const navigate = useNavigate();
  const [membros, setMembros] = useState([]);
  const [semResponsavel, setSemResponsavel] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [toast, setToast] = useState("");

  const mostrar = msg => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  const carregar = () => {
    api.visaoGeralSquad().then(({ membros, semResponsavel }) => {
      setMembros(membros);
      setSemResponsavel(semResponsavel);
    }).finally(() => setCarregando(false));
  };

  useEffect(carregar, []);

  const alterarResponsavel = async (clienteId, responsavelId) => {
    await api.atualizarResponsavelCliente(clienteId, responsavelId);
    mostrar("✓ Responsável atualizado");
    carregar();
  };

  if (carregando) return null;

  const totalClientes = membros.reduce((n, m) => n + m.clientes.length, 0) + semResponsavel.length;

  return (
    <div style={{ minHeight: "100vh", background: LAVANDA, color: TINTA }}>
      <header style={{
        position: "sticky", top: 0, zIndex: 20, background: "rgba(255,255,255,.92)",
        backdropFilter: "blur(8px)", borderBottom: `1px solid ${LAVANDA_2}`,
      }}>
        <div style={{
          maxWidth: 1000, margin: "0 auto", padding: "14px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        }}>
          <Marca />
          <Botao pequeno variante="fantasma" onClick={() => navigate("/agencia")}>Voltar pra agência</Botao>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 20px 60px", display: "grid", gap: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: TINTA }}>Squad</h1>
          <p style={{ margin: "4px 0 0", color: CINZA, fontWeight: 600, fontSize: 14 }}>
            Seus social medias e os clientes sob responsabilidade de cada um.
          </p>
        </div>

        {membros.length === 0 ? (
          <Cartao style={{ textAlign: "center", padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "center", color: CINZA, marginBottom: 6 }}>
              <IconeUsuarios tamanho={28} />
            </div>
            <div style={{ fontWeight: 800, color: TINTA, fontSize: 15 }}>Nenhum social media no squad ainda</div>
            <div style={{ color: CINZA, fontWeight: 600, fontSize: 13 }}>
              Convide alguém na tela da agência pra ver o time aqui.
            </div>
          </Cartao>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {membros.map(m => (
              <Cartao key={m.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{
                    width: 34, height: 34, borderRadius: "50%", background: LAVANDA_2, color: ROXO,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 800, flexShrink: 0,
                  }}>{m.nome?.[0]?.toUpperCase()}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: TINTA, fontSize: 14 }}>{m.nome}</div>
                    <div style={{ fontSize: 11, color: CINZA, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.email}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: CINZA, marginBottom: 8 }}>
                  {m.clientes.length} {m.clientes.length === 1 ? "cliente" : "clientes"}
                </div>
                {m.clientes.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 12, color: CINZA, fontWeight: 600 }}>Nenhum cliente atribuído ainda.</p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {m.clientes.map(c => (
                      <Pill key={c.id} cor={ROXO} bg={LAVANDA}>{c.nome}{c.segmento ? ` · ${c.segmento}` : ""}</Pill>
                    ))}
                  </div>
                )}
              </Cartao>
            ))}
          </div>
        )}

        <Cartao>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <IconePrancheta tamanho={18} style={{ color: ROXO }} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: TINTA }}>Todos os clientes ({totalClientes})</h3>
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: CINZA, fontWeight: 600 }}>
            Defina ou troque o responsável de cada cliente.
          </p>
          <div style={{ display: "grid", gap: 8 }}>
            {[...membros.flatMap(m => m.clientes), ...semResponsavel].length === 0 && (
              <p style={{ margin: 0, fontSize: 13, color: CINZA, fontWeight: 600 }}>Nenhum cliente na carteira ainda.</p>
            )}
            {membros.flatMap(m => m.clientes).map(c => (
              <div key={c.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap",
                background: LAVANDA, borderRadius: 14, padding: "10px 14px",
              }}>
                <div>
                  <div style={{ fontWeight: 800, color: TINTA, fontSize: 14 }}>{c.nome}</div>
                  {c.segmento && <div style={{ fontSize: 11, color: CINZA, fontWeight: 600 }}>{c.segmento}{c.nicho ? ` · ${c.nicho}` : ""}</div>}
                </div>
                <SeletorResponsavel cliente={c} membros={membros} aoAlterar={alterarResponsavel} />
              </div>
            ))}
            {semResponsavel.map(c => (
              <div key={c.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap",
                background: LAVANDA, borderRadius: 14, padding: "10px 14px",
              }}>
                <div>
                  <div style={{ fontWeight: 800, color: TINTA, fontSize: 14 }}>{c.nome}</div>
                  {c.segmento && <div style={{ fontSize: 11, color: CINZA, fontWeight: 600 }}>{c.segmento}{c.nicho ? ` · ${c.nicho}` : ""}</div>}
                </div>
                <SeletorResponsavel cliente={c} membros={membros} aoAlterar={alterarResponsavel} />
              </div>
            ))}
          </div>
        </Cartao>
      </main>

      <Toast msg={toast} />
    </div>
  );
}
