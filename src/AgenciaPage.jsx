import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROXO, LAVANDA, LAVANDA_2, TINTA, CINZA } from "./theme.js";
import { Pill, Botao, Cartao, Toast } from "./components.jsx";
import { useAuth } from "./AuthContext.jsx";
import { api } from "./api.js";
import CarteiraClientes from "./CarteiraClientes.jsx";

async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return false;
  }
}

function CartaoConvite({ aoCriado }) {
  const [linkGerado, setLinkGerado] = useState(null);
  const [gerando, setGerando] = useState(false);

  const gerar = async () => {
    setGerando(true);
    try {
      const { token } = await api.criarConvite();
      const link = `${window.location.origin}/convite/${token}`;
      setLinkGerado(link);
      aoCriado();
    } finally {
      setGerando(false);
    }
  };

  return (
    <Cartao style={{ background: LAVANDA }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontWeight: 800, color: TINTA, fontSize: 15 }}>Convidar social media pro squad</div>
          <div style={{ fontSize: 13, color: CINZA, fontWeight: 600 }}>
            Gere um link único e envie por WhatsApp ou e-mail. Quem clicar cria a conta já vinculada à sua agência.
          </div>
        </div>
        <Botao pequeno onClick={gerar}>{gerando ? "Gerando…" : "Gerar link de convite"}</Botao>
      </div>
      {linkGerado && (
        <div style={{
          marginTop: 14, background: "#fff", borderRadius: 14, padding: "10px 14px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap",
        }}>
          <code style={{ fontSize: 13, color: TINTA, wordBreak: "break-all" }}>{linkGerado}</code>
          <Botao pequeno variante="fantasma" onClick={() => copiar(linkGerado)}>Copiar link</Botao>
        </div>
      )}
    </Cartao>
  );
}

function SecaoSquad({ mostrar }) {
  const [membros, setMembros] = useState([]);
  const [convites, setConvites] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const recarregar = () => {
    Promise.all([api.listarMembros(), api.listarConvites()])
      .then(([m, c]) => { setMembros(m.membros); setConvites(c.convites); })
      .finally(() => setCarregando(false));
  };

  useEffect(recarregar, []);

  const pendentes = convites.filter(c => c.status === "pendente");

  const revogar = async id => {
    await api.revogarConvite(id);
    mostrar("Convite revogado");
    recarregar();
  };

  const remover = async id => {
    await api.removerMembro(id);
    mostrar("Membro removido do squad");
    recarregar();
  };

  if (carregando) return null;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <CartaoConvite aoCriado={recarregar} />

      <Cartao>
        <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: TINTA }}>
          Squad ({membros.length} {membros.length === 1 ? "membro" : "membros"})
        </h3>
        {membros.length === 0 ? (
          <p style={{ color: CINZA, fontWeight: 600, fontSize: 14, margin: 0 }}>
            Nenhum social media no squad ainda. Gere um link de convite acima.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {membros.map(m => (
              <div key={m.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: LAVANDA, borderRadius: 14, padding: "10px 14px", gap: 10,
              }}>
                <div>
                  <div style={{ fontWeight: 800, color: TINTA, fontSize: 14 }}>{m.nome}</div>
                  <div style={{ fontSize: 12, color: CINZA, fontWeight: 600 }}>{m.email}</div>
                </div>
                <Botao pequeno variante="perigo" onClick={() => remover(m.id)}>Remover</Botao>
              </div>
            ))}
          </div>
        )}
      </Cartao>

      {pendentes.length > 0 && (
        <Cartao>
          <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: TINTA }}>Convites pendentes</h3>
          <div style={{ display: "grid", gap: 8 }}>
            {pendentes.map(c => (
              <div key={c.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: LAVANDA, borderRadius: 14, padding: "10px 14px", gap: 10, flexWrap: "wrap",
              }}>
                <Pill cor={ROXO} bg="#fff">Aguardando aceite</Pill>
                <div style={{ display: "flex", gap: 8 }}>
                  <Botao pequeno variante="fantasma" onClick={() => copiar(`${window.location.origin}/convite/${c.token}`)}>
                    Copiar link
                  </Botao>
                  <Botao pequeno variante="perigo" onClick={() => revogar(c.id)}>Revogar</Botao>
                </div>
              </div>
            ))}
          </div>
        </Cartao>
      )}
    </div>
  );
}

export default function AgenciaPage() {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState("");

  const mostrar = msg => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  return (
    <div style={{ minHeight: "100vh", background: LAVANDA, color: TINTA }}>
      <header style={{
        position: "sticky", top: 0, zIndex: 20, background: "rgba(255,255,255,.92)",
        backdropFilter: "blur(8px)", borderBottom: `1px solid ${LAVANDA_2}`,
      }}>
        <div style={{
          maxWidth: 960, margin: "0 auto", padding: "14px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 14, background: ROXO,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 900, fontSize: 18,
            }}>em</div>
            <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-.5px" }}>
              easy<span style={{ color: ROXO }}>media</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Botao pequeno variante="fantasma" onClick={() => navigate("/painel")}>Ver painel de conteúdo</Botao>
            <button onClick={() => navigate("/perfil")} className="em-btn" style={{
              display: "flex", alignItems: "center", gap: 8, border: "none", background: "transparent",
              cursor: "pointer", fontFamily: "inherit", padding: 0,
            }}>
              <span style={{
                width: 26, height: 26, borderRadius: "50%", overflow: "hidden", background: LAVANDA_2,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 800, color: ROXO, flexShrink: 0,
              }}>
                {usuario?.foto_perfil_url
                  ? <img src={usuario.foto_perfil_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : usuario?.nome?.[0]?.toUpperCase()}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: CINZA }}>Olá, {usuario?.nome}</span>
            </button>
            <button onClick={() => { sair(); navigate("/"); }} className="em-btn" style={{
              border: "none", background: "transparent", cursor: "pointer",
              fontFamily: "inherit", fontWeight: 700, fontSize: 12, color: CINZA,
              textDecoration: "underline", padding: 0,
            }}>Sair</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px 60px", display: "grid", gap: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: TINTA }}>
            {usuario?.nome_negocio || "Sua agência"}
          </h1>
          <p style={{ margin: "4px 0 0", color: CINZA, fontWeight: 600, fontSize: 14 }}>
            Gerencie seu squad de social medias e a carteira de clientes num só lugar.
          </p>
        </div>

        <SecaoSquad mostrar={mostrar} />
        <CarteiraClientes mostrar={mostrar} />
      </main>

      <Toast msg={toast} />
    </div>
  );
}
